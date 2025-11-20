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

const TrendQuerySchema = z.object({
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
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-trend', {
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

    const validation = TrendQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { from, to, workspace } = validation.data;

    console.log(`[dashboard-trend] User ${userId} fetching trend data`, { from, to, workspace });

    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('created_at, low_risk_count, medium_risk_count, high_risk_count')
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: true });

    if (scansError) throw scansError;

    // Group by day
    const dayMap = new Map<string, { low: number; medium: number; high: number }>();
    
    scans?.forEach((scan) => {
      const day = scan.created_at.split('T')[0];
      const current = dayMap.get(day) || { low: 0, medium: 0, high: 0 };
      
      dayMap.set(day, {
        low: current.low + (scan.low_risk_count || 0),
        medium: current.medium + (scan.medium_risk_count || 0),
        high: current.high + (scan.high_risk_count || 0),
      });
    });

    // Convert to array and add forecast (simple linear projection)
    const series = Array.from(dayMap.entries()).map(([ts, counts]) => ({
      ts,
      ...counts,
    }));

    // Add simple forecast for next 3 days
    if (series.length >= 3) {
      const lastThree = series.slice(-3);
      const avgGrowth = {
        low: (lastThree[2].low - lastThree[0].low) / 2,
        medium: (lastThree[2].medium - lastThree[0].medium) / 2,
        high: (lastThree[2].high - lastThree[0].high) / 2,
      };

      for (let i = 1; i <= 3; i++) {
        const lastDate = new Date(series[series.length - 1].ts);
        lastDate.setDate(lastDate.getDate() + i);
        const last = series[series.length - 1];

        series.push({
          ts: lastDate.toISOString().split('T')[0],
          low: Math.max(0, last.low + avgGrowth.low * i),
          medium: Math.max(0, last.medium + avgGrowth.medium * i),
          high: Math.max(0, last.high + avgGrowth.high * i),
          forecast: true,
        } as any);
      }
    }

    console.log(`[dashboard-trend] Trend computed: ${series.length} data points`);

    return new Response(JSON.stringify(series), {
      status: 200,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    console.error('[dashboard-trend] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to compute trend', message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
