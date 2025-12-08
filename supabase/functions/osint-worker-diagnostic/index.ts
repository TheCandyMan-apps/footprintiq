import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosticCheck {
  name: string;
  url?: string;
  status: 'pass' | 'fail' | 'warn';
  httpStatus?: number;
  responseTime?: number;
  body?: string;
  response?: unknown;
  payload?: unknown;
  error?: string;
  message?: string;
}

interface DiagnosticResults {
  timestamp: string;
  configuration: {
    workerUrl: { set: boolean; value?: string; length?: number; endsWithSlash?: boolean; containsScan?: boolean };
    workerToken: { set: boolean; length?: number; preview?: string };
  };
  checks: DiagnosticCheck[];
  summary: { passed: number; failed: number; warnings: number };
  overall: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[osint-worker-diagnostic] Starting diagnostic checks...');

  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    configuration: {
      workerUrl: { set: false },
      workerToken: { set: false }
    },
    checks: [],
    summary: { passed: 0, failed: 0, warnings: 0 },
    overall: 'unknown'
  };

  // 1. Configuration Check
  const workerUrl = Deno.env.get('OSINT_WORKER_URL');
  const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');
  
  console.log('[osint-worker-diagnostic] OSINT_WORKER_URL:', workerUrl ? `${workerUrl.substring(0, 50)}... (${workerUrl.length} chars)` : 'NOT SET');
  console.log('[osint-worker-diagnostic] OSINT_WORKER_TOKEN:', workerToken ? `SET (${workerToken.length} chars)` : 'NOT SET');

  results.configuration = {
    workerUrl: workerUrl ? {
      set: true,
      value: workerUrl,
      length: workerUrl.length,
      endsWithSlash: workerUrl.endsWith('/'),
      containsScan: workerUrl.includes('/scan')
    } : { set: false },
    workerToken: workerToken ? {
      set: true,
      length: workerToken.length,
      preview: `${workerToken.substring(0, 8)}...${workerToken.substring(workerToken.length - 4)}`
    } : { set: false }
  };

  if (!workerUrl) {
    results.checks.push({
      name: 'config_worker_url',
      status: 'fail',
      error: 'OSINT_WORKER_URL secret is not set'
    });
    results.summary.failed++;
  } else {
    results.checks.push({
      name: 'config_worker_url',
      status: 'pass',
      message: `URL configured: ${workerUrl}`
    });
    results.summary.passed++;
  }

  if (!workerToken) {
    results.checks.push({
      name: 'config_worker_token',
      status: 'fail',
      error: 'OSINT_WORKER_TOKEN secret is not set'
    });
    results.summary.failed++;
  } else {
    results.checks.push({
      name: 'config_worker_token',
      status: 'pass',
      message: `Token configured (${workerToken.length} chars)`
    });
    results.summary.passed++;
  }

  if (!workerUrl || !workerToken) {
    results.overall = 'config_missing';
    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 2. Health Endpoint Test (with auth)
  const baseUrl = workerUrl.replace('/scan', '');
  const healthUrl = `${baseUrl}/health`;
  console.log('[osint-worker-diagnostic] Testing health endpoint:', healthUrl);
  
  const healthStart = Date.now();
  try {
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${workerToken}` }
    });
    const healthBody = await healthResponse.text();
    const healthTime = Date.now() - healthStart;
    
    console.log('[osint-worker-diagnostic] Health response:', healthResponse.status, healthBody.substring(0, 200));
    
    results.checks.push({
      name: 'health_endpoint_auth',
      url: healthUrl,
      status: healthResponse.ok ? 'pass' : (healthResponse.status === 404 ? 'warn' : 'fail'),
      httpStatus: healthResponse.status,
      responseTime: healthTime,
      body: healthBody.substring(0, 500),
      message: healthResponse.ok ? 'Health endpoint responding' : 
               healthResponse.status === 404 ? 'Health endpoint not found (may not be implemented)' :
               `Health endpoint returned ${healthResponse.status}`
    });
    
    if (healthResponse.ok) results.summary.passed++;
    else if (healthResponse.status === 404) results.summary.warnings++;
    else results.summary.failed++;
  } catch (err) {
    const healthTime = Date.now() - healthStart;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[osint-worker-diagnostic] Health endpoint error:', errorMsg);
    
    results.checks.push({
      name: 'health_endpoint_auth',
      url: healthUrl,
      status: 'fail',
      error: errorMsg,
      responseTime: healthTime
    });
    results.summary.failed++;
  }

  // 3. Scan Endpoint Test (authenticated)
  const scanUrl = workerUrl.endsWith('/scan') ? workerUrl : `${workerUrl}/scan`;
  console.log('[osint-worker-diagnostic] Testing scan endpoint:', scanUrl);
  
  const scanStart = Date.now();
  try {
    const scanPayload = {
      tool: 'sherlock',
      username: 'diagnostic_test_12345',
      fast_mode: true,
      workers: 1
    };
    
    console.log('[osint-worker-diagnostic] Scan payload:', JSON.stringify(scanPayload));
    
    const scanResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerToken}`
      },
      body: JSON.stringify(scanPayload)
    });
    
    const scanTime = Date.now() - scanStart;
    let scanBody: unknown;
    const rawBody = await scanResponse.text();
    
    try { 
      scanBody = JSON.parse(rawBody); 
    } catch { 
      scanBody = rawBody.substring(0, 500); 
    }
    
    console.log('[osint-worker-diagnostic] Scan response:', scanResponse.status, typeof scanBody === 'string' ? scanBody : JSON.stringify(scanBody).substring(0, 200));
    
    results.checks.push({
      name: 'scan_endpoint_auth',
      url: scanUrl,
      status: scanResponse.ok ? 'pass' : 'fail',
      httpStatus: scanResponse.status,
      responseTime: scanTime,
      payload: scanPayload,
      response: scanBody,
      message: scanResponse.ok ? 'Scan endpoint working' : `Scan endpoint returned ${scanResponse.status}`
    });
    
    if (scanResponse.ok) results.summary.passed++;
    else results.summary.failed++;
  } catch (err) {
    const scanTime = Date.now() - scanStart;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[osint-worker-diagnostic] Scan endpoint error:', errorMsg);
    
    results.checks.push({
      name: 'scan_endpoint_auth',
      url: scanUrl,
      status: 'fail',
      error: errorMsg,
      responseTime: scanTime
    });
    results.summary.failed++;
  }

  // 4. Test without auth (should fail with 401 if auth is enforced)
  console.log('[osint-worker-diagnostic] Testing auth enforcement...');
  const noAuthStart = Date.now();
  try {
    const noAuthResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'sherlock', username: 'test' })
    });
    const noAuthTime = Date.now() - noAuthStart;
    
    console.log('[osint-worker-diagnostic] No-auth response:', noAuthResponse.status);
    
    const isAuthEnforced = noAuthResponse.status === 401 || noAuthResponse.status === 403;
    results.checks.push({
      name: 'auth_enforcement',
      url: scanUrl,
      status: isAuthEnforced ? 'pass' : 'warn',
      httpStatus: noAuthResponse.status,
      responseTime: noAuthTime,
      message: isAuthEnforced 
        ? 'Worker correctly requires authentication' 
        : `Worker returned ${noAuthResponse.status} without auth (expected 401/403)`
    });
    
    if (isAuthEnforced) results.summary.passed++;
    else results.summary.warnings++;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[osint-worker-diagnostic] Auth enforcement check error:', errorMsg);
    results.checks.push({
      name: 'auth_enforcement',
      status: 'fail',
      error: errorMsg
    });
    results.summary.failed++;
  }

  // Determine overall status
  if (results.summary.failed === 0 && results.summary.warnings === 0) {
    results.overall = 'healthy';
  } else if (results.summary.failed === 0) {
    results.overall = 'healthy_with_warnings';
  } else {
    results.overall = 'issues_detected';
  }

  console.log('[osint-worker-diagnostic] Complete:', results.overall, `(${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.warnings} warnings)`);

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
