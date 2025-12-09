const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Use unified OSINT worker
  const OSINT_WORKER_URL = Deno.env.get('OSINT_WORKER_URL');
  const OSINT_WORKER_TOKEN = Deno.env.get('OSINT_WORKER_TOKEN');

  if (!OSINT_WORKER_URL) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'OSINT_WORKER_URL not configured' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const baseUrl = OSINT_WORKER_URL.replace('/scan', '');
  const diagnostics: any = {
    worker: 'osint-multitool-worker',
    worker_url: OSINT_WORKER_URL,
    worker_token_configured: !!OSINT_WORKER_TOKEN,
    checks: [],
  };

  // Step 1: Check /health endpoint
  try {
    const healthUrl = `${baseUrl}/health`;
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    const healthBody = await healthResponse.text().catch(() => '');
    let healthJson: any = {};
    try {
      healthJson = JSON.parse(healthBody);
    } catch {
      healthJson = { raw: healthBody.substring(0, 200) };
    }

    diagnostics.checks.push({
      endpoint: '/health',
      status: healthResponse.status,
      ok: healthResponse.ok,
      body: healthJson,
    });

    if (healthResponse.ok) {
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
      endpoint: '/health',
      error: err.message,
    });
  }

  // Step 2: Try /test-sherlock
  try {
    const testSherlockUrl = `${baseUrl}/test-sherlock`;
    const testSherlockResponse = await fetch(testSherlockUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    diagnostics.sherlock_installed = testSherlockResponse.ok;
    diagnostics.checks.push({
      endpoint: '/test-sherlock',
      status: testSherlockResponse.status,
      ok: testSherlockResponse.ok,
    });
  } catch (err: any) {
    diagnostics.checks.push({
      endpoint: '/test-sherlock',
      error: err.message,
    });
  }

  // Step 3: Try /test-maigret
  try {
    const testMaigretUrl = `${baseUrl}/test-maigret`;
    const testMaigretResponse = await fetch(testMaigretUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    diagnostics.maigret_installed = testMaigretResponse.ok;
    diagnostics.checks.push({
      endpoint: '/test-maigret',
      status: testMaigretResponse.status,
      ok: testMaigretResponse.ok,
    });
  } catch (err: any) {
    diagnostics.checks.push({
      endpoint: '/test-maigret',
      error: err.message,
    });
  }

  // Step 4: Try a test scan with authentication
  if (OSINT_WORKER_TOKEN) {
    try {
      const scanUrl = `${baseUrl}/scan`;
      const testPayload = {
        tool: 'sherlock',
        username: 'test_health_check',
        token: OSINT_WORKER_TOKEN,
        fast_mode: true,
        workers: 1,
      };

      const scanResponse = await fetch(scanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(30000),
      });

      const scanBody = await scanResponse.text();
      let scanJson: any = {};
      try {
        scanJson = JSON.parse(scanBody);
      } catch {
        scanJson = { raw: scanBody.substring(0, 500) };
      }

      diagnostics.scan_test = {
        status: scanResponse.status,
        ok: scanResponse.ok,
        has_results: Array.isArray(scanJson?.results),
        results_count: Array.isArray(scanJson?.results) ? scanJson.results.length : 0,
      };

      diagnostics.checks.push({
        endpoint: '/scan (test)',
        status: scanResponse.status,
        ok: scanResponse.ok,
      });
    } catch (err: any) {
      diagnostics.checks.push({
        endpoint: '/scan (test)',
        error: err.message,
      });
    }
  }

  // Determine overall status
  const hasPassingCheck = diagnostics.checks.some((c: any) => c.ok);
  const status = hasPassingCheck ? 'healthy' : 'unhealthy';
  const statusCode = hasPassingCheck ? 200 : 503;

  return new Response(
    JSON.stringify({ 
      status,
      statusCode,
      message: hasPassingCheck 
        ? 'Worker functional' 
        : 'Worker diagnostics failed - check logs',
      ...diagnostics 
    }),
    { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
