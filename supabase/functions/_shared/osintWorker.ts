/**
 * Unified OSINT Worker Client
 * Single helper for all OSINT tool calls via the consolidated Cloud Run worker.
 * 
 * Worker: osint-multitool-worker
 * Base URL: https://osint-multitool-worker-312297078337.europe-west1.run.app
 * 
 * Supported tools: sherlock, whatsmyname, maigret, holehe, gosearch
 */

export type OsintTool = 'sherlock' | 'whatsmyname' | 'maigret' | 'holehe' | 'gosearch';

export interface OsintWorkerRequest {
  tool: OsintTool;
  username?: string;
  email?: string;
  token?: string; // Will be auto-filled from env
  fast_mode?: boolean;
  workers?: number;
  strict?: boolean;
}

export interface OsintWorkerResult {
  site: string;
  url: string;
  username?: string;
  status?: string | null;
  response_time?: number | null;
  found?: boolean;
  nsfw?: boolean;
}

export interface OsintWorkerResponse {
  tool: string;
  username?: string;
  email?: string;
  results: OsintWorkerResult[];
  stderr?: string | null;
  raw_output?: string | null;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface OsintWorkerConfig {
  timeout?: number; // in ms, default 120000 (2 min)
  strict?: boolean; // for gosearch
  fast_mode?: boolean; // for sherlock
  workers?: number; // parallel workers
}

/**
 * Call the unified OSINT worker with proper authentication and error handling.
 * 
 * @param tool - The OSINT tool to use (sherlock, maigret, holehe, gosearch, whatsmyname)
 * @param payload - Username or email depending on tool
 * @param config - Optional configuration (timeout, strict mode, etc.)
 * @returns Worker response with results array
 * @throws Error if worker is not configured or request fails
 */
export async function callOsintWorker(
  tool: OsintTool,
  payload: { username?: string; email?: string },
  config: OsintWorkerConfig = {}
): Promise<OsintWorkerResponse> {
  const workerUrl = Deno.env.get('OSINT_WORKER_URL');
  const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');

  if (!workerUrl) {
    console.error('[OSINT Worker] ❌ OSINT_WORKER_URL not configured');
    throw new Error('OSINT worker URL not configured. Set OSINT_WORKER_URL secret.');
  }

  if (!workerToken) {
    console.error('[OSINT Worker] ❌ OSINT_WORKER_TOKEN not configured');
    throw new Error('OSINT worker token not configured. Set OSINT_WORKER_TOKEN secret.');
  }

  const target = payload.username || payload.email || 'unknown';
  const timeout = config.timeout || 120000; // 2 minutes default

  console.log(`[OSINT Worker] 🔍 Calling ${tool} for target: ${target}`);
  console.log(`[OSINT Worker] URL: ${workerUrl}`);

  // Build request body per worker contract
  const requestBody: OsintWorkerRequest = {
    tool,
    token: workerToken,
    ...payload,
  };

  // Add tool-specific options
  if (tool === 'gosearch' && config.strict !== undefined) {
    requestBody.strict = config.strict;
  }
  if ((tool === 'sherlock' || tool === 'whatsmyname') && config.fast_mode !== undefined) {
    requestBody.fast_mode = config.fast_mode;
  }
  if (config.workers !== undefined) {
    requestBody.workers = config.workers;
  }

  console.log(`[OSINT Worker] Request payload:`, JSON.stringify({
    ...requestBody,
    token: '***redacted***'
  }, null, 2));

  // Build scan URL
  const scanUrl = workerUrl.endsWith('/scan') 
    ? workerUrl 
    : new URL('/scan', workerUrl).toString();

  try {
    const response = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(timeout),
    });

    console.log(`[OSINT Worker] Response status: ${response.status}`);

    const responseText = await response.text();
    console.log(`[OSINT Worker] Raw response (first 500 chars):`, responseText.substring(0, 500));

    if (!response.ok) {
      console.error(`[OSINT Worker] ❌ ${tool} error: ${response.status}`, responseText);
      return {
        tool,
        ...payload,
        results: [],
        error: `Worker returned ${response.status}: ${responseText.substring(0, 500)}`,
      };
    }

    let data: OsintWorkerResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[OSINT Worker] ❌ Failed to parse JSON response:`, parseError);
      return {
        tool,
        ...payload,
        results: [],
        error: `Invalid JSON response from worker: ${responseText.substring(0, 200)}`,
      };
    }

    // Normalize results array
    const results = Array.isArray(data.results) ? data.results : [];

    console.log(`[OSINT Worker] ✅ ${tool} returned ${results.length} results`);
    if (results.length > 0) {
      console.log(`[OSINT Worker] First result sample:`, JSON.stringify(results[0], null, 2));
    }

    // Log meta for debugging
    if (data.meta) {
      console.log(`[OSINT Worker] Execution meta:`, JSON.stringify(data.meta, null, 2));
    }

    return {
      tool: data.tool || tool,
      username: data.username || payload.username,
      email: data.email || payload.email,
      results,
      stderr: data.stderr,
      raw_output: data.raw_output,
      meta: data.meta,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('AbortError') || errorMessage.includes('timeout')) {
      console.error(`[OSINT Worker] ⏱️ ${tool} timed out after ${timeout}ms`);
      return {
        tool,
        ...payload,
        results: [],
        error: `Worker timeout after ${timeout}ms`,
      };
    }

    console.error(`[OSINT Worker] ❌ ${tool} exception:`, errorMessage);
    return {
      tool,
      ...payload,
      results: [],
      error: errorMessage,
    };
  }
}

/**
 * Check OSINT worker health
 */
export async function checkOsintWorkerHealth(): Promise<{
  healthy: boolean;
  url?: string;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}> {
  const workerUrl = Deno.env.get('OSINT_WORKER_URL');
  const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');

  if (!workerUrl || !workerToken) {
    return {
      healthy: false,
      error: !workerUrl ? 'OSINT_WORKER_URL not configured' : 'OSINT_WORKER_TOKEN not configured',
    };
  }

  const baseUrl = workerUrl.replace('/scan', '');
  const healthUrl = `${baseUrl}/health`;
  const startTime = Date.now();

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    return {
      healthy: response.ok,
      url: healthUrl,
      statusCode: response.status,
      responseTime: Date.now() - startTime,
    };
  } catch (error: unknown) {
    return {
      healthy: false,
      url: healthUrl,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Test if specific OSINT tools are installed/available
 */
export async function testOsintToolInstalled(
  tool: 'sherlock' | 'maigret'
): Promise<{
  installed: boolean;
  error?: string;
  responseTime?: number;
}> {
  const workerUrl = Deno.env.get('OSINT_WORKER_URL');

  if (!workerUrl) {
    return { installed: false, error: 'OSINT_WORKER_URL not configured' };
  }

  const baseUrl = workerUrl.replace('/scan', '');
  const testUrl = `${baseUrl}/test-${tool}`;
  const startTime = Date.now();

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    return {
      installed: response.ok,
      responseTime: Date.now() - startTime,
    };
  } catch (error: unknown) {
    return {
      installed: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    };
  }
}
