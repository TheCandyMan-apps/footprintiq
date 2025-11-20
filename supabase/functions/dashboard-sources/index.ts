import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SourcesQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  workspace: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting - 30 requests/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-sources', {
      maxRequests: 30,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Input validation
    const url = new URL(req.url);
    const queryParams = {
      from: url.searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: url.searchParams.get('to') || new Date().toISOString(),
      workspace: url.searchParams.get('workspace') || userId,
    };

    const validation = SourcesQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { from, to, workspace } = validation.data;

    console.log(`[dashboard-sources] User ${userId} fetching source breakdown`, { from, to, workspace });

    const { data: results, error: resultsError } = await supabase
      .from('scan_results')
      .select('provider')
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to);

    if (resultsError) throw resultsError;

    // Count by provider
    const providerCounts = new Map<string, number>();
    results?.forEach((result) => {
      const count = providerCounts.get(result.provider) || 0;
      providerCounts.set(result.provider, count + 1);
    });

    const sources = Array.from(providerCounts.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`[dashboard-sources] Source breakdown: ${sources.length} providers`);

    return new Response(JSON.stringify(sources), {
      status: 200,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    console.error('[dashboard-sources] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to compute sources', message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
