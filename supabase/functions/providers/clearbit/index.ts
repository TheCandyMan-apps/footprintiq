import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';
import { withCache } from '../../_shared/cache.ts';
import { normalizeClearbit } from '../../_shared/normalize.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const { target, type } = await req.json();
    if (!target) return bad(400, 'missing_target');

    const apiKey = Deno.env.get('CLEARBIT_API_KEY');
    if (!apiKey) {
      console.warn('[clearbit] API key not configured');
      return ok({ findings: [] });
    }

    const startTime = Date.now();
    
    const findings = await withCache(
      `clearbit:${type}:${target}`,
      async () => {
        const endpoint = type === 'domain' || type === 'company'
          ? `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(target)}`
          : `https://person.clearbit.com/v2/people/find?email=${encodeURIComponent(target)}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            return { findings: [] };
          }
          throw new Error(`Clearbit API error: ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeClearbit(data, target, type);
        
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
    console.error('[clearbit] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});
