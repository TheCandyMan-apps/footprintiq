/**
 * telegram-retrigger – Re-trigger only the Telegram worker for an existing scan.
 *
 * Auth: Supabase JWT (user must be authenticated + member of scan's workspace)
 * Routes:
 *   - username scan → POST N8N_TELEGRAM_USERNAME_WEBHOOK_URL (fire-and-forget, HMAC signed)
 *   - phone scan    → POST telegram-proxy (phone_presence action, using internal token)
 *
 * Before firing:
 *   1. Clears telegram_triggered_at idempotency lock on the scan
 *   2. Deletes stale findings (provider = 'telegram') for this scan
 *   3. Deletes stale scan_artifacts (source = 'telegram') for this scan
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Sign body with HMAC-SHA256, matching n8n-scan-trigger's signFpiqHmac helper */
async function signHmac(body: string): Promise<Record<string, string>> {
  const secret = Deno.env.get('N8N_WEBHOOK_HMAC_SECRET');
  if (!secret) return {};

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    'x-fpiq-signature': hex,
    'x-fpiq-timestamp': Date.now().toString(),
  };
}

console.log('[telegram-retrigger] Function booted');

Deno.serve(async (req) => {
  console.log(`[telegram-retrigger] Request received: ${req.method}`);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. Authenticate user ────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify JWT via anon client
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // ── 2. Parse body ───────────────────────────────────────────────
    let body: { scan_id?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scan_id } = body;
    if (!scan_id) {
      return new Response(JSON.stringify({ error: 'scan_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Load scan + verify workspace membership ──────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: scan, error: scanError } = await adminClient
      .from('scans')
      .select('id, scan_type, workspace_id, username, phone, email')
      .eq('id', scan_id)
      .maybeSingle();

    if (scanError || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is a member of the scan's workspace
    const { data: membership, error: memberError } = await adminClient
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', scan.workspace_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Forbidden: not a member of this workspace' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Clear idempotency lock + stale data ──────────────────────
    await Promise.all([
      // Clear the telegram_triggered_at lock so we can re-trigger
      adminClient
        .from('scans')
        .update({ telegram_triggered_at: null })
        .eq('id', scan_id)
        .select('id'),

      // Delete stale telegram findings
      adminClient
        .from('findings')
        .delete()
        .eq('scan_id', scan_id)
        .eq('provider', 'telegram'),

      // Delete stale telegram artifacts
      adminClient
        .from('scan_artifacts')
        .delete()
        .eq('scan_id', scan_id)
        .eq('source', 'telegram'),
    ]);

    const scanType = scan.scan_type || 'username';
    const target = scan.username || scan.email || scan.phone || '';

    console.log(`[telegram-retrigger] Retriggering scan ${scan_id} (type=${scanType}, target=${target.slice(0, 10)}***)`);

    // ── 5. Stamp triggered_at immediately so UI shows "pending" ─────
    const triggeredAt = new Date().toISOString();
    const { error: stampError } = await adminClient
      .from('scans')
      .update({ telegram_triggered_at: triggeredAt })
      .eq('id', scan_id)
      .select('id');

    if (stampError) {
      console.error(`[telegram-retrigger] Failed to stamp telegram_triggered_at:`, stampError.message);
    } else {
      console.log(`[telegram-retrigger] telegram_triggered_at stamped: ${triggeredAt}`);
    }

    // ── 6. Route to correct backend ─────────────────────────────────
    if (scanType === 'phone') {
      // Phone scan: call telegram-proxy with phone_presence action
      const gatewayKey = Deno.env.get('N8N_GATEWAY_KEY');
      const proxyUrl = `${supabaseUrl}/functions/v1/telegram-proxy`;

      // Fire-and-forget
      fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-n8n-key': gatewayKey || '',
          'x-internal-token': serviceRoleKey,
        },
        body: JSON.stringify({
          action: 'phone_presence',
          phone: scan.phone || target,
          scan_id,
          workspace_id: scan.workspace_id,
          tier: 'pro',
        }),
      }).catch((err) => console.error('[telegram-retrigger] phone proxy error:', err));

      return new Response(
        JSON.stringify({ ok: true, message: 'Telegram phone presence re-triggered. Results will appear shortly.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    } else {
      // Username scan: fire n8n Telegram Username Webhook (HMAC-signed to match n8n-scan-trigger)
      const webhookUrl = Deno.env.get('N8N_TELEGRAM_USERNAME_WEBHOOK_URL');
      if (!webhookUrl) {
        console.error('[telegram-retrigger] N8N_TELEGRAM_USERNAME_WEBHOOK_URL not configured');
        return new Response(
          JSON.stringify({ error: 'Telegram username webhook not configured' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const payload = JSON.stringify({
        scanId: scan_id,
        username: target,
        query: target,
        workspace_id: scan.workspace_id,
        userId,
        tier: 'pro',
        entityType: 'username',
        telegramOptions: { enabled: true },
        progressWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-progress`,
        resultsWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-results`,
        retrigger: true,
      });

      const hmacHeaders = await signHmac(payload);

      // Fire-and-forget
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...hmacHeaders },
        body: payload,
      })
        .then((res) => console.log(`[telegram-retrigger] n8n webhook responded: ${res.status}`))
        .catch((err) => console.error('[telegram-retrigger] n8n webhook error:', err));

      console.log('[telegram-retrigger] Telegram username webhook fired (fire-and-forget)');

      return new Response(
        JSON.stringify({ ok: true, message: 'Telegram scan re-triggered. Results will appear shortly.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
  } catch (err) {
    console.error('[telegram-retrigger] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
