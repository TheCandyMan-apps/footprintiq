import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Proxy to Cloud Run health endpoint
    const workerUrl = Deno.env.get('TELEGRAM_WORKER_URL');
    const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');
    if (!workerUrl || !workerToken) {
      return new Response(JSON.stringify({ connected: false, authorized: false, detail: 'Worker not configured' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let workerRes: Response;
    try {
      workerRes = await fetch(`${workerUrl}/health/telegram`, {
        method: 'GET',
        headers: { 'X-Worker-Key': workerToken },
      });
    } catch {
      return new Response(JSON.stringify({ connected: false, authorized: false, detail: 'Worker request failed' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await workerRes.text();
    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[telegram-worker-health]', err);
    return new Response(JSON.stringify({ connected: false, authorized: false, detail: 'Internal error' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
