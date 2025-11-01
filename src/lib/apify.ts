/**
 * Apify actor execution client
 */

const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

export interface ApifyRunOptions {
  actorId: string;
  input: Record<string, any>;
  timeoutSec?: number;
  memory?: number;
}

export interface ApifyRun {
  id: string;
  actId: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
  startedAt?: string;
  finishedAt?: string;
  defaultDatasetId?: string;
}

/**
 * Start an Apify actor run
 */
export async function runApifyActor(options: ApifyRunOptions): Promise<string> {
  if (!APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN not configured');
  }

  const { actorId, input, timeoutSec = 120, memory = 1024 } = options;

  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        memory,
        timeout: timeoutSec,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Apify run failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.id;
}

/**
 * Wait for a run to complete and return results
 */
export async function waitForRun(
  runId: string,
  maxWaitMs: number = 180000
): Promise<any[]> {
  if (!APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN not configured');
  }

  const startTime = Date.now();
  const pollInterval = 2000; // 2s

  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Failed to check run status: ${response.statusText}`);
    }

    const data = await response.json();
    const run: ApifyRun = data.data;

    if (run.status === 'SUCCEEDED') {
      // Fetch dataset items
      if (run.defaultDatasetId) {
        return await getDatasetItems(run.defaultDatasetId);
      }
      return [];
    }

    if (run.status === 'FAILED' || run.status === 'TIMED-OUT' || run.status === 'ABORTED') {
      throw new Error(`Run ${runId} ${run.status.toLowerCase()}`);
    }

    // Still running, wait and poll again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Run ${runId} timed out after ${maxWaitMs}ms`);
}

/**
 * Fetch dataset items
 */
async function getDatasetItems(datasetId: string): Promise<any[]> {
  if (!APIFY_API_TOKEN) return [];

  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`
  );

  if (!response.ok) {
    console.error('Failed to fetch dataset items:', response.statusText);
    return [];
  }

  return await response.json();
}

/**
 * Helper: Run actor and wait for results
 */
export async function executeApify(options: ApifyRunOptions): Promise<any[]> {
  console.log(`[apify] Starting ${options.actorId}`);
  
  const runId = await runApifyActor(options);
  console.log(`[apify] Run ${runId} started, waiting...`);
  
  const results = await waitForRun(runId, (options.timeoutSec || 120) * 1000 + 30000);
  console.log(`[apify] Got ${results.length} results`);
  
  return results;
}
