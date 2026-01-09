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
  worker: {
    name: string;
    url: string;
  };
  configuration: {
    workerUrl: { set: boolean; value?: string };
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

  console.log('[osint-worker-diagnostic] Starting diagnostic checks for unified OSINT worker...');

  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    worker: {
      name: 'osint-multitool-worker',
      url: 'https://osint-multitool-worker-312297078337.europe-west1.run.app',
    },
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

  const baseUrl = workerUrl.replace('/scan', '');

  // 2. Health Endpoint Test
  const healthUrl = `${baseUrl}/health`;
  console.log('[osint-worker-diagnostic] Testing health endpoint:', healthUrl);
  
  const healthStart = Date.now();
  try {
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    const healthBody = await healthResponse.text();
    const healthTime = Date.now() - healthStart;
    
    console.log('[osint-worker-diagnostic] Health response:', healthResponse.status, healthBody.substring(0, 200));
    
    results.checks.push({
      name: 'health_endpoint',
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
      name: 'health_endpoint',
      url: healthUrl,
      status: 'fail',
      error: errorMsg,
      responseTime: healthTime
    });
    results.summary.failed++;
  }

  // 3. Test Sherlock installed
  const testSherlockUrl = `${baseUrl}/test-sherlock`;
  console.log('[osint-worker-diagnostic] Testing Sherlock installation:', testSherlockUrl);
  
  const sherlockTestStart = Date.now();
  try {
    const sherlockTestResponse = await fetch(testSherlockUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    const sherlockTestBody = await sherlockTestResponse.text();
    const sherlockTestTime = Date.now() - sherlockTestStart;
    
    results.checks.push({
      name: 'sherlock_installed',
      url: testSherlockUrl,
      status: sherlockTestResponse.ok ? 'pass' : 'warn',
      httpStatus: sherlockTestResponse.status,
      responseTime: sherlockTestTime,
      body: sherlockTestBody.substring(0, 300),
      message: sherlockTestResponse.ok ? 'Sherlock is installed' : 'Sherlock test endpoint not available'
    });
    
    if (sherlockTestResponse.ok) results.summary.passed++;
    else results.summary.warnings++;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.checks.push({
      name: 'sherlock_installed',
      url: testSherlockUrl,
      status: 'warn',
      error: errorMsg,
      responseTime: Date.now() - sherlockTestStart
    });
    results.summary.warnings++;
  }

  // 4. Test Maigret installed
  const testMaigretUrl = `${baseUrl}/test-maigret`;
  console.log('[osint-worker-diagnostic] Testing Maigret installation:', testMaigretUrl);
  
  const maigretTestStart = Date.now();
  try {
    const maigretTestResponse = await fetch(testMaigretUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    const maigretTestBody = await maigretTestResponse.text();
    const maigretTestTime = Date.now() - maigretTestStart;
    
    results.checks.push({
      name: 'maigret_installed',
      url: testMaigretUrl,
      status: maigretTestResponse.ok ? 'pass' : 'warn',
      httpStatus: maigretTestResponse.status,
      responseTime: maigretTestTime,
      body: maigretTestBody.substring(0, 300),
      message: maigretTestResponse.ok ? 'Maigret is installed' : 'Maigret test endpoint not available'
    });
    
    if (maigretTestResponse.ok) results.summary.passed++;
    else results.summary.warnings++;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.checks.push({
      name: 'maigret_installed',
      url: testMaigretUrl,
      status: 'warn',
      error: errorMsg,
      responseTime: Date.now() - maigretTestStart
    });
    results.summary.warnings++;
  }

  // 5. Self-test: Sherlock scan
  const scanUrl = `${baseUrl}/scan`;
  console.log('[osint-worker-diagnostic] Running Sherlock self-test scan...');
  
  const sherlockScanStart = Date.now();
  try {
    const sherlockPayload = {
      tool: 'sherlock',
      username: 'TestUser123',
      token: workerToken,
      fast_mode: true,
      workers: 1,
    };
    
    const sherlockScanResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sherlockPayload),
      signal: AbortSignal.timeout(60000), // 60s timeout for scan
    });
    
    const sherlockScanTime = Date.now() - sherlockScanStart;
    const sherlockScanBody = await sherlockScanResponse.text();
    let sherlockScanJson: unknown;
    try {
      sherlockScanJson = JSON.parse(sherlockScanBody);
    } catch {
      sherlockScanJson = sherlockScanBody.substring(0, 500);
    }
    
    console.log('[osint-worker-diagnostic] Sherlock scan response:', sherlockScanResponse.status);
    
    const hasResults = typeof sherlockScanJson === 'object' && 
                       sherlockScanJson !== null && 
                       'results' in sherlockScanJson &&
                       Array.isArray((sherlockScanJson as { results: unknown[] }).results);
    
    results.checks.push({
      name: 'sherlock_scan_test',
      url: scanUrl,
      status: sherlockScanResponse.ok && hasResults ? 'pass' : 'fail',
      httpStatus: sherlockScanResponse.status,
      responseTime: sherlockScanTime,
      payload: { tool: 'sherlock', username: 'TestUser123' },
      response: sherlockScanJson,
      message: sherlockScanResponse.ok && hasResults 
        ? `Sherlock scan working (${((sherlockScanJson as { results: unknown[] }).results).length} results)` 
        : `Sherlock scan failed: ${sherlockScanResponse.status}`
    });
    
    if (sherlockScanResponse.ok && hasResults) results.summary.passed++;
    else results.summary.failed++;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[osint-worker-diagnostic] Sherlock scan error:', errorMsg);
    
    results.checks.push({
      name: 'sherlock_scan_test',
      url: scanUrl,
      status: 'fail',
      error: errorMsg,
      responseTime: Date.now() - sherlockScanStart
    });
    results.summary.failed++;
  }

  // 6. Self-test: Maigret scan
  console.log('[osint-worker-diagnostic] Running Maigret self-test scan...');
  
  const maigretScanStart = Date.now();
  try {
    const maigretPayload = {
      tool: 'maigret',
      username: 'TestUser123',
      token: workerToken,
    };
    
    const maigretScanResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maigretPayload),
      signal: AbortSignal.timeout(90000), // 90s timeout for maigret
    });
    
    const maigretScanTime = Date.now() - maigretScanStart;
    const maigretScanBody = await maigretScanResponse.text();
    let maigretScanJson: unknown;
    try {
      maigretScanJson = JSON.parse(maigretScanBody);
    } catch {
      maigretScanJson = maigretScanBody.substring(0, 500);
    }
    
    console.log('[osint-worker-diagnostic] Maigret scan response:', maigretScanResponse.status);
    
    const hasResults = typeof maigretScanJson === 'object' && 
                       maigretScanJson !== null && 
                       'results' in maigretScanJson &&
                       Array.isArray((maigretScanJson as { results: unknown[] }).results);
    
    results.checks.push({
      name: 'maigret_scan_test',
      url: scanUrl,
      status: maigretScanResponse.ok && hasResults ? 'pass' : 'fail',
      httpStatus: maigretScanResponse.status,
      responseTime: maigretScanTime,
      payload: { tool: 'maigret', username: 'TestUser123' },
      response: maigretScanJson,
      message: maigretScanResponse.ok && hasResults 
        ? `Maigret scan working (${((maigretScanJson as { results: unknown[] }).results).length} results)` 
        : `Maigret scan failed: ${maigretScanResponse.status}`
    });
    
    if (maigretScanResponse.ok && hasResults) results.summary.passed++;
    else results.summary.failed++;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[osint-worker-diagnostic] Maigret scan error:', errorMsg);
    
    results.checks.push({
      name: 'maigret_scan_test',
      url: scanUrl,
      status: 'fail',
      error: errorMsg,
      responseTime: Date.now() - maigretScanStart
    });
    results.summary.failed++;
  }

  // 7. Test auth enforcement (should return 401 without token)
  console.log('[osint-worker-diagnostic] Testing auth enforcement...');
  const noAuthStart = Date.now();
  try {
    const noAuthResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'sherlock', username: 'test' }), // No token
      signal: AbortSignal.timeout(10000),
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
      error: errorMsg,
      responseTime: Date.now() - noAuthStart
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

  console.log('[osint-worker-diagnostic] Complete:', results.overall, 
    `(${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.warnings} warnings)`);

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
