const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-selftest-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SELFTEST_KEY = Deno.env.get('SELFTEST_KEY') || 'test-key-12345';
    const RESULTS_WEBHOOK_TOKEN = Deno.env.get('RESULTS_WEBHOOK_TOKEN')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

    // Validate selftest key from header or query
    const selftestKey = req.headers.get('X-Selftest-Key') || new URL(req.url).searchParams.get('key');
    
    if (selftestKey !== SELFTEST_KEY) {
      console.error('[selftest-webhook] Invalid selftest key');
      return new Response(
        JSON.stringify({ error: 'Invalid selftest key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[selftest-webhook] Calling real scan-results endpoint...');

    // Create a fake webhook payload
    const fakePayload = {
      job_id: `selftest-${crypto.randomUUID()}`,
      username: 'selftest',
      status: 'completed',
      summary: { total_found: 0, platforms: [] },
      raw: { test: true },
    };

    // Call the real scan-results endpoint with proper authentication
    const scanResultsUrl = `${SUPABASE_URL}/functions/v1/scan-results`;
    console.log(`[selftest-webhook] Calling: ${scanResultsUrl}`);

    const response = await fetch(scanResultsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Results-Token': RESULTS_WEBHOOK_TOKEN,
      },
      body: JSON.stringify(fakePayload),
    });

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { raw: responseText };
    }

    console.log(`[selftest-webhook] Response status: ${response.status}`);
    console.log(`[selftest-webhook] Response body:`, responseBody);

    // Return the proxied response
    return new Response(
      JSON.stringify({
        status: response.status,
        ok: response.ok,
        body: responseBody,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[selftest-webhook] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        errorType: 'unknown',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
