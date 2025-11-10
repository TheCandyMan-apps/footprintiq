const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAIGRET_WORKER_URL = Deno.env.get('MAIGRET_WORKER_URL')!;
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN')!;

    console.log(`[health-check] Checking worker at: ${MAIGRET_WORKER_URL}/health`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let healthResponse;
    try {
      healthResponse = await fetch(`${MAIGRET_WORKER_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${WORKER_TOKEN}`,
        },
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[health-check] Timeout');
        return new Response(
          JSON.stringify({
            status: 'unreachable',
            error: 'Health check timed out',
            errorType: 'timeout',
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('[health-check] Network error:', fetchError);
      return new Response(
        JSON.stringify({
          status: 'unreachable',
          error: fetchError.message,
          errorType: 'network',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    clearTimeout(timeoutId);

    const healthBody = await healthResponse.text();
    const status = healthResponse.ok ? 'healthy' : 'unhealthy';

    console.log(`[health-check] Worker status: ${status} (HTTP ${healthResponse.status})`);

    return new Response(
      JSON.stringify({
        status,
        workerUrl: MAIGRET_WORKER_URL,
        statusCode: healthResponse.status,
        response: healthBody,
        tokenConfigured: !!WORKER_TOKEN,
      }),
      { 
        status: healthResponse.ok ? 200 : healthResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[health-check] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unreachable',
        error: error.message,
        errorType: 'unknown',
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
