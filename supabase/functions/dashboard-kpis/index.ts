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

const KPIQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  workspace: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting (60 requests/hour)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-kpis', {
      maxRequests: 60,
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

    // Input validation
    const url = new URL(req.url);
    const queryParams = {
      from: url.searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: url.searchParams.get('to') || new Date().toISOString(),
      workspace: url.searchParams.get('workspace') || userId,
    };

    const validation = KPIQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { from, to, workspace } = validation.data;
    // Ensure from and to are defined (they should be after validation)
    const fromDate = from!;
    const toDate = to!;
    console.log(`[dashboard-kpis] User ${userId} fetching KPIs`, { from: fromDate, to: toDate, workspace });

    // Calculate current period metrics
    const { data: currentScans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', workspace)
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    if (scansError) throw scansError;

    const scans = currentScans?.length || 0;
    const findings = currentScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
    const high = currentScans?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;

    // Dark web mentions
    const { count: darkweb } = await supabase
      .from('darkweb_findings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', workspace)
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    // Success rate (scans completed successfully)
    const successRate = scans > 0 
      ? Math.round((currentScans?.filter(s => s.status === 'completed').length || 0) / scans * 100)
      : 100;

    // Estimated spend (mock for now)
    const spend = findings * 0.02; // $0.02 per finding

    // Calculate previous period for deltas
    const periodLength = new Date(toDate).getTime() - new Date(fromDate).getTime();
    const prevFrom = new Date(new Date(fromDate).getTime() - periodLength).toISOString();
    const prevTo = fromDate;

    const { data: prevScans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', workspace)
      .gte('created_at', prevFrom)
      .lte('created_at', prevTo);

    const prevScansCount = prevScans?.length || 0;
    const prevFindings = prevScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
    const prevHigh = prevScans?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;

    const { count: prevDarkweb } = await supabase
      .from('darkweb_findings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', workspace)
      .gte('created_at', prevFrom)
      .lte('created_at', prevTo);

    const prevSuccessRate = prevScansCount > 0
      ? Math.round((prevScans?.filter(s => s.status === 'completed').length || 0) / prevScansCount * 100)
      : 100;

    const prevSpend = prevFindings * 0.02;

    const kpis = {
      scans,
      findings,
      high,
      darkweb: darkweb || 0,
      successRate,
      spend,
      deltas: {
        scans: scans - prevScansCount,
        findings: findings - prevFindings,
        high: high - prevHigh,
        darkweb: (darkweb || 0) - (prevDarkweb || 0),
        successRate: successRate - prevSuccessRate,
        spend: spend - prevSpend,
      },
    };

    console.log(`[dashboard-kpis] Successfully computed KPIs for workspace ${workspace}`);

    return new Response(JSON.stringify(kpis), {
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    console.error('[dashboard-kpis] Error computing KPIs:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
