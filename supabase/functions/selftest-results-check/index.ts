import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-selftest-key',
};

// UUID validation helper
const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SELFTEST_KEY = Deno.env.get('SELFTEST_KEY')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate self-test key
    const selftestKey = req.headers.get('X-Selftest-Key');
    if (!selftestKey || selftestKey !== SELFTEST_KEY) {
      console.warn('[selftest-results-check] Invalid or missing X-Selftest-Key header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid self-test key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { job_id } = await req.json();

    if (!job_id || !isUUID(job_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid job_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[selftest-results-check] Querying maigret_results for job_id: ${job_id}`);

    // Use service role to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('maigret_results')
      .select('job_id, username, status, created_at')
      .eq('job_id', job_id)
      .maybeSingle();

    if (error) {
      console.error('[selftest-results-check] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data) {
      console.log(`[selftest-results-check] Found result: ${JSON.stringify(data)}`);
      return new Response(
        JSON.stringify({ found: true, row: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('[selftest-results-check] No results found');
      return new Response(
        JSON.stringify({ found: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('[selftest-results-check] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
