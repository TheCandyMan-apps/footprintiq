import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';
import { withCache } from '../../_shared/cache.ts';
import { normalizePipl } from '../../_shared/normalize.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const { target, type, options = {} } = await req.json();
    if (!target) return bad(400, 'missing_target');

    const apiKey = Deno.env.get('PIPL_API_KEY');
    if (!apiKey) {
      console.warn('[pipl] API key not configured');
      return ok({ findings: [] });
    }

    const startTime = Date.now();
    
    const findings = await withCache(
      `pipl:${type}:${target}`,
      async () => {
        const params = new URLSearchParams({ key: apiKey });
        
        if (type === 'email') params.append('email', target);
        else if (type === 'phone') params.append('phone', target);
        else if (type === 'username') params.append('username', target);
        else params.append('email', target);

        if (options.country) params.append('country', options.country);

        const response = await fetch(
          `https://api.pipl.com/search/?${params.toString()}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return { findings: [] };
          }
          throw new Error(`Pipl API error: ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizePipl(data, target);
        
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
    console.error('[pipl] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});
