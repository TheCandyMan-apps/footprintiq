import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';
import { withCache } from '../../_shared/cache.ts';
import { normalizeShodan } from '../../_shared/normalize.ts';
import { getApiContext } from '../../_shared/auth.ts';
import { checkRateLimit, getClientIP, rateLimitResponse, RateLimits } from '../../_shared/rateLimit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    // Authenticate request
    const apiContext = await getApiContext(req);
    if (!apiContext) return bad(401, 'unauthorized');

    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimitOk = await checkRateLimit(clientIP, {
      endpoint: 'providers/shodan',
      maxRequests: RateLimits.api.maxRequests,
      windowMs: RateLimits.api.windowMs,
    });
    
    if (!rateLimitOk) {
      return rateLimitResponse(3600);
    }

    const { target, type } = await req.json();
    if (!target) return bad(400, 'missing_target');

    const apiKey = Deno.env.get('SHODAN_API_KEY');
    if (!apiKey) {
      console.warn('[shodan] API key not configured');
      return ok({ findings: [] });
    }

    const startTime = Date.now();
    
    const findings = await withCache(
      `shodan:${apiContext.workspace_id}:${type}:${target}`,
      async () => {
        const endpoint = type === 'domain'
          ? `https://api.shodan.io/dns/domain/${encodeURIComponent(target)}?key=${apiKey}`
          : `https://api.shodan.io/shodan/host/${encodeURIComponent(target)}?key=${apiKey}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          if (response.status === 404) {
            return { findings: [] };
          }
          throw new Error(`Shodan API error: ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeShodan(data, target, type);
        
        return {
          findings: normalized.map((f: any) => ({
            ...f,
            latencyMs: Date.now() - startTime,
          })),
        };
      },
      { ttlSeconds: 24 * 3600 } // 24h cache
    );

    return ok(findings);
  } catch (error) {
    console.error('[shodan] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});
