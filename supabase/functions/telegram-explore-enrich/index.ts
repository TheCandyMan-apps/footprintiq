import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate user
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { scan_id, input, include, admins_limit, pinned_preview_chars } = await req.json();

    if (!scan_id || !input) {
      return new Response(JSON.stringify({ error: 'scan_id and input are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify user has access to the scan via workspace membership
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: scan, error: scanError } = await adminClient
      .from('scans')
      .select('workspace_id')
      .eq('id', scan_id)
      .single();

    if (scanError || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: membership } = await adminClient
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', scan.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call worker
    const workerUrl = Deno.env.get('TELEGRAM_WORKER_URL');
    const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');
    if (!workerUrl || !workerToken) {
      return new Response(JSON.stringify({ detail: 'Worker not configured' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const workerBody: Record<string, unknown> = { input };
    if (include) workerBody.include = include;
    if (admins_limit !== undefined) workerBody.admins_limit = admins_limit;
    if (pinned_preview_chars !== undefined) workerBody.pinned_preview_chars = pinned_preview_chars;

    let workerRes: Response;
    try {
      workerRes = await fetch(`${workerUrl}/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Worker-Key': workerToken },
        body: JSON.stringify(workerBody),
      });
    } catch {
      return new Response(JSON.stringify({ detail: 'Worker request failed' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await workerRes.text();
    return new Response(data, {
      status: workerRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[telegram-explore-enrich]', err);
    return new Response(JSON.stringify({ detail: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
