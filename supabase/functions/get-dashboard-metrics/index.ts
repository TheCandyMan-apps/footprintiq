import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { errorResponse, safeError } from '../_shared/errors.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MetricsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Admin role check
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Rate limiting (100 requests/hour for admin metrics)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'get-dashboard-metrics', {
      maxRequests: 100,
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
      days: url.searchParams.get('days') || '30',
    };
    
    const validation = MetricsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { days } = validation.data;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`[get-dashboard-metrics] Admin ${userId} requesting metrics for last ${days} days`);

    // Total scans
    const { count: totalScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Active users
    const { data: activeUsers } = await supabase
      .from('scans')
      .select('user_id')
      .gte('created_at', startDate.toISOString());
    
    const uniqueUsers = new Set(activeUsers?.map(s => s.user_id)).size;

    // Scan breakdown by type
    const { data: scanTypes } = await supabase
      .from('scans')
      .select('scan_type')
      .gte('created_at', startDate.toISOString());

    const scanBreakdown = scanTypes?.reduce((acc: any, scan) => {
      acc[scan.scan_type] = (acc[scan.scan_type] || 0) + 1;
      return acc;
    }, {});

    // Provider success rates
    const { data: findings } = await supabase
      .from('findings')
      .select('provider, scan_id')
      .gte('created_at', startDate.toISOString());

    const providerStats = findings?.reduce((acc: any, finding) => {
      if (!acc[finding.provider]) {
        acc[finding.provider] = { total: 0, scans: new Set() };
      }
      acc[finding.provider].total++;
      acc[finding.provider].scans.add(finding.scan_id);
      return acc;
    }, {});

    const providerSuccessRates = Object.entries(providerStats || {}).map(([provider, stats]: [string, any]) => ({
      provider,
      findingsCount: stats.total,
      scansWithFindings: stats.scans.size,
    }));

    // Average scan completion time
    const { data: completedScans } = await supabase
      .from('scans')
      .select('created_at, completed_at')
      .not('completed_at', 'is', null)
      .gte('created_at', startDate.toISOString());

    const avgCompletionTime = (completedScans && completedScans.length > 0)
      ? completedScans.reduce((sum, scan) => {
          const duration = new Date(scan.completed_at).getTime() - new Date(scan.created_at).getTime();
          return sum + duration;
        }, 0) / completedScans.length
      : 0;

    // Top error codes
    const { data: errors } = await supabase
      .from('system_errors')
      .select('error_code')
      .gte('created_at', startDate.toISOString())
      .limit(100);

    const errorCounts = errors?.reduce((acc: any, err) => {
      acc[err.error_code] = (acc[err.error_code] || 0) + 1;
      return acc;
    }, {});

    const topErrors = Object.entries(errorCounts || {})
      .map(([code, count]) => ({ code, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    // Risk distribution
    const { data: riskFindings } = await supabase
      .from('findings')
      .select('severity')
      .gte('created_at', startDate.toISOString());

    const riskDistribution = riskFindings?.reduce((acc: any, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    }, {});

    const metrics = {
      totalScans: totalScans || 0,
      activeUsers: uniqueUsers,
      scanBreakdown,
      providerSuccessRates,
      avgCompletionTimeMs: Math.round(avgCompletionTime),
      topErrors,
      riskDistribution,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
    };

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[get-dashboard-metrics] Error:', error);
    const err = safeError(error);
    return errorResponse(error, 500, 'SERVER_ERROR', corsHeaders);
  }
});
