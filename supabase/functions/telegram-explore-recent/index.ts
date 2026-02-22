import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { scan_id, dialog, limit, offset_id, include_empty } = await req.json();
    if (!scan_id || !dialog) {
      return new Response(JSON.stringify({ error: 'scan_id and dialog are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: scan } = await adminClient.from('scans').select('workspace_id').eq('id', scan_id).maybeSingle();
    if (!scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: membership } = await adminClient.from('workspace_members').select('user_id').eq('workspace_id', scan.workspace_id).eq('user_id', user.id).maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const workerUrl = Deno.env.get('TELEGRAM_WORKER_URL');
    const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');
    if (!workerUrl || !workerToken) {
      return new Response(JSON.stringify({ error: 'Worker not configured' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const workerBody: Record<string, unknown> = { dialog };
    if (limit !== undefined) workerBody.limit = limit;
    if (offset_id !== undefined) workerBody.offset_id = offset_id;
    if (include_empty !== undefined) workerBody.include_empty = include_empty;

    let workerRes: Response;
    try {
      workerRes = await fetch(`${workerUrl}/dialog/recent`, {
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
    console.error('[telegram-explore-recent]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
