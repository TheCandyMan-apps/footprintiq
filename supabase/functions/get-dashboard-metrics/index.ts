import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, safeError } from '../_shared/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse(new Error('Missing authorization'), 401, 'AUTH_FAILED', corsHeaders);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(authError || new Error('Unauthorized'), 401, 'AUTH_FAILED', corsHeaders);
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return errorResponse(new Error('Admin access required'), 403, 'UNAUTHORIZED', corsHeaders);
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
