/**
 * telegram-retrigger – Re-trigger only the Telegram worker for an existing scan.
 *
 * Auth: Supabase JWT (user must be authenticated + member of scan's workspace)
 * Routes:
 *   - username scan → POST N8N_TELEGRAM_USERNAME_WEBHOOK_URL (fire-and-forget)
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

Deno.serve(async (req) => {
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
    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await userClient.auth.getClaims(token);

    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authData.claims.sub;

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
      // Clear the telegram_triggered_at lock so n8n-scan-trigger allows a re-trigger
      adminClient
        .from('scans')
        .update({ telegram_triggered_at: null })
        .eq('id', scan_id),

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

    // ── 5. Route to correct backend ─────────────────────────────────
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
      // Username scan: fire n8n Telegram Username Webhook
      const webhookUrl = Deno.env.get('N8N_TELEGRAM_USERNAME_WEBHOOK_URL');
      if (!webhookUrl) {
        console.error('[telegram-retrigger] N8N_TELEGRAM_USERNAME_WEBHOOK_URL not configured');
        return new Response(
          JSON.stringify({ error: 'Telegram username webhook not configured' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // Fire-and-forget
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id,
          username: target,
          query: target,
          workspace_id: scan.workspace_id,
          tier: 'pro',
          retrigger: true,
        }),
      }).catch((err) => console.error('[telegram-retrigger] n8n webhook error:', err));

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
