const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const MAIGRET_WORKER_URL = Deno.env.get('MAIGRET_WORKER_URL');
  const MAIGRET_WORKER_SCAN_PATH = Deno.env.get('MAIGRET_WORKER_SCAN_PATH') || '/scan';
  const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN');

  if (!MAIGRET_WORKER_URL) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'MAIGRET_WORKER_URL not configured' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const diagnostics: any = {
    worker_url: MAIGRET_WORKER_URL,
    scan_path: MAIGRET_WORKER_SCAN_PATH,
    worker_token_configured: !!WORKER_TOKEN,
    checks: [],
  };

  // Step 1: Check /healthz
  try {
    const healthzUrl = `${MAIGRET_WORKER_URL}/healthz`;
    const healthzResponse = await fetch(healthzUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const healthzBody = await healthzResponse.text().catch(() => '');
    let healthzJson: any = {};
    try {
      healthzJson = JSON.parse(healthzBody);
    } catch {
      healthzJson = { raw: healthzBody };
    }

    diagnostics.checks.push({
      endpoint: '/healthz',
      status: healthzResponse.status,
      ok: healthzResponse.ok,
      body: healthzJson,
    });

    if (healthzResponse.ok && healthzJson.ok === true) {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          statusCode: 200,
          ...diagnostics 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    diagnostics.checks.push({
      endpoint: '/healthz',
      error: err.message,
    });
  }

  // Step 2: Try /diag/env for diagnostics
  try {
    const diagEnvUrl = `${MAIGRET_WORKER_URL}/diag/env`;
    const diagEnvResponse = await fetch(diagEnvUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (diagEnvResponse.ok) {
      const diagEnvBody = await diagEnvResponse.json().catch(() => ({}));
      diagnostics.diag_env = diagEnvBody;
    }
  } catch (err: any) {
    diagnostics.diag_env_error = err.message;
  }

  // Step 3: Try /diag/maigret for Maigret info
  try {
    const diagMaigretUrl = `${MAIGRET_WORKER_URL}/diag/maigret`;
    const diagMaigretResponse = await fetch(diagMaigretUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (diagMaigretResponse.ok) {
      const diagMaigretBody = await diagMaigretResponse.json().catch(() => ({}));
      diagnostics.diag_maigret = diagMaigretBody;
      diagnostics.maigret_in_path = diagMaigretBody.maigret_in_path;
      diagnostics.maigret_version = diagMaigretBody.version;
    }
  } catch (err: any) {
    diagnostics.diag_maigret_error = err.message;
  }

  // If healthz failed, return unhealthy status
  return new Response(
    JSON.stringify({ 
      status: 'unhealthy',
      statusCode: 503,
      ...diagnostics 
    }),
    { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
