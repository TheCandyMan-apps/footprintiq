import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, ok, bad, allowedOrigin } from '../../_shared/secure.ts';
import { withCache } from '../../_shared/cache.ts';
import { normalizeApifySocial, normalizeApifyOsint, normalizeApifyDarkweb } from '../../_shared/normalize.ts';

const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface ApifyRunRequest {
  actorId: string;
  input: Record<string, any>;
  timeoutSec?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    if (!APIFY_API_TOKEN) {
      return bad(500, 'APIFY_API_TOKEN not configured');
    }

    const { actorId, input, timeoutSec = 120 }: ApifyRunRequest = await req.json();

    if (!actorId || !input) {
      return bad(400, 'actorId and input required');
    }

    // Validate actor ID
    const validActors = [
      'xtech/social-media-finder-pro',
      'epctex/osint-scraper',
      'epctex/darkweb-scraper',
    ];

    if (!validActors.includes(actorId)) {
      return bad(400, `Invalid actor. Allowed: ${validActors.join(', ')}`);
    }

    // Generate cache key
    const cacheKey = `apify:${actorId}:${JSON.stringify(input)}`;

    console.log(`[apify-runner] Running ${actorId}`);

    const results = await withCache(
      cacheKey,
      async () => {
        // Start actor run
        const runResponse = await fetch(
          `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...input,
              memory: 1024,
              timeout: timeoutSec,
            }),
          }
        );

        if (!runResponse.ok) {
          throw new Error(`Apify run failed: ${runResponse.statusText}`);
        }

        const runData = await runResponse.json();
        const runId = runData.data.id;

        console.log(`[apify-runner] Run ${runId} started, polling...`);

        // Poll for completion
        const maxWaitMs = (timeoutSec + 30) * 1000;
        const startTime = Date.now();
        const pollInterval = 2000;

        while (Date.now() - startTime < maxWaitMs) {
          const statusResponse = await fetch(
            `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
          );

          if (!statusResponse.ok) {
            throw new Error(`Failed to check run status`);
          }

          const statusData = await statusResponse.json();
          const status = statusData.data.status;

          if (status === 'SUCCEEDED') {
            // Fetch dataset
            const datasetId = statusData.data.defaultDatasetId;
            if (!datasetId) return [];

            const datasetResponse = await fetch(
              `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`
            );

            if (!datasetResponse.ok) return [];

            return await datasetResponse.json();
          }

          if (status === 'FAILED' || status === 'TIMED-OUT' || status === 'ABORTED') {
            throw new Error(`Run ${status.toLowerCase()}`);
          }

          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Run timed out after ${maxWaitMs}ms`);
      },
      { ttlSeconds: 86400 } // 24h cache
    );

    // Normalize based on actor
    let normalized;
    if (actorId.includes('social-media-finder')) {
      normalized = normalizeApifySocial(results);
    } else if (actorId.includes('osint-scraper')) {
      normalized = normalizeApifyOsint(results);
    } else if (actorId.includes('darkweb-scraper')) {
      normalized = normalizeApifyDarkweb(results);
    } else {
      normalized = results; // fallback
    }

    console.log(`[apify-runner] Normalized ${normalized.length} findings`);

    return ok({
      actorId,
      itemCount: results.length,
      findings: normalized,
      cached: false, // TODO: track cache hits
    });

  } catch (error) {
    console.error('[apify-runner] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
