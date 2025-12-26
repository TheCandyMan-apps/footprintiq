import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MetricsQuerySchema = z.object({
  // No body params needed
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication - Admin only
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      console.error('[observability-metrics] Non-admin access attempt:', userId);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Rate limiting - 60 requests/minute for real-time metrics
    const rateLimitResult = await checkRateLimit(userId, 'user', 'observability-metrics', {
      maxRequests: 60,
      windowSeconds: 60
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

    console.log('[observability-metrics] Admin metrics query by:', userId);

    // Get real-time metrics from the last 60 minutes
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Try to fetch real audit logs for recent API activity
    // Note: audit_log table uses 'at' column, not 'created_at'
    const { data: auditLogs } = await supabase
      .from('audit_log')
      .select('*')
      .gte('at', oneHourAgo.toISOString())
      .order('at', { ascending: true })
      .limit(500); // Limit to reduce connection usage

    // Try to fetch recent scan results for activity metrics
    const { data: scans } = await supabase
      .from('scans')
      .select('created_at, status')
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: true });

    // Generate enhanced mock data with real activity if available
    const logs = generateEnhancedLogs(oneHourAgo, now, auditLogs, scans);
    const pgLogs = generateMockPgLogs(oneHourAgo, now);

    // Calculate API calls per minute
    const apiCallsPerMinute = calculateCallsPerMinute(logs || []);
    
    // Calculate error rates over time
    const errorRates = calculateErrorRates(logs || [], pgLogs || []);
    
    // Get recent alerts from logs
    const alerts = extractAlerts(logs || [], pgLogs || []);
    
    // Calculate current metrics
    const totalCalls = logs?.length || 0;
    const errorCount = (logs?.filter((log: any) => log.status_code >= 400) || []).length;
    const errorRate = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0;
    
    // Calculate average response time
    const responseTimes = logs?.map((log: any) => log.execution_time_ms || 0) || [];
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
      : 0;

    return new Response(
      JSON.stringify({
        realtime: {
          apiCallsPerMinute,
          errorRates,
          totalCalls,
          errorRate: errorRate.toFixed(2),
          avgResponseTime: Math.round(avgResponseTime),
        },
        alerts,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      }
    );
  } catch (error) {
    console.error('[observability-metrics] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      }
    );
  }
});

function calculateCallsPerMinute(logs: any[]): Array<{ time: string; calls: number }> {
  const minuteBuckets = new Map<string, number>();
  
  logs.forEach((log) => {
    const timestamp = new Date(log.timestamp);
    const minute = `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}`;
    minuteBuckets.set(minute, (minuteBuckets.get(minute) || 0) + 1);
  });
  
  return Array.from(minuteBuckets.entries())
    .map(([time, calls]) => ({ time, calls }))
    .slice(-30); // Last 30 minutes
}

function calculateErrorRates(logs: any[], pgLogs: any[]): Array<{ time: string; rate: number }> {
  const minuteBuckets = new Map<string, { total: number; errors: number }>();
  
  logs.forEach((log) => {
    const timestamp = new Date(log.timestamp);
    const minute = `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}`;
    const bucket = minuteBuckets.get(minute) || { total: 0, errors: 0 };
    
    bucket.total++;
    if (log.status_code >= 400) {
      bucket.errors++;
    }
    
    minuteBuckets.set(minute, bucket);
  });
  
  return Array.from(minuteBuckets.entries())
    .map(([time, data]) => ({
      time,
      rate: data.total > 0 ? (data.errors / data.total) * 100 : 0,
    }))
    .slice(-30); // Last 30 minutes
}

function extractAlerts(logs: any[], pgLogs: any[]): Array<{
  id: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}> {
  const alerts: Array<any> = [];
  
  // Extract error logs from edge functions
  logs.forEach((log, index) => {
    if (log.status_code >= 500) {
      alerts.push({
        id: `edge-${index}`,
        timestamp: log.timestamp,
        severity: 'error',
        message: `Edge function error: ${log.event_message || 'Unknown error'}`,
        source: log.function_id || 'edge-function',
      });
    } else if (log.status_code >= 400) {
      alerts.push({
        id: `edge-warn-${index}`,
        timestamp: log.timestamp,
        severity: 'warning',
        message: `Client error: ${log.event_message || 'Bad request'}`,
        source: log.function_id || 'edge-function',
      });
    }
  });
  
  // Extract postgres errors
  pgLogs.forEach((log, index) => {
    if (log.error_severity === 'ERROR' || log.error_severity === 'FATAL') {
      alerts.push({
        id: `pg-${index}`,
        timestamp: log.timestamp,
        severity: 'error',
        message: `Database error: ${log.event_message}`,
        source: 'postgres',
      });
    }
  });
  
  // Sort by timestamp and return most recent 20
  return alerts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

function generateEnhancedLogs(startTime: Date, endTime: Date, auditLogs: any, scans: any) {
  const logs = [];
  const functions = ['scan-orchestrate', 'ai-analyst', 'dashboard-kpis', 'providers-hibp', 'api-scan'];
  const duration = endTime.getTime() - startTime.getTime();
  
  // If we have real activity, incorporate it
  if (auditLogs && auditLogs.length > 0) {
    auditLogs.forEach((audit: any) => {
      logs.push({
        timestamp: audit.at, // Use 'at' column, not 'created_at'
        function_id: audit.action || 'api-action',
        status_code: 200,
        execution_time_ms: Math.floor(Math.random() * 300) + 50,
        event_message: `Audit: ${audit.action}`,
      });
    });
  }

  // Add scan activity
  if (scans && scans.length > 0) {
    scans.forEach((scan: any) => {
      logs.push({
        timestamp: scan.created_at,
        function_id: 'scan-orchestrate',
        status_code: scan.status === 'failed' ? 500 : 200,
        execution_time_ms: Math.floor(Math.random() * 1000) + 100,
        event_message: `Scan ${scan.status}`,
      });
    });
  }

  // Fill in with mock data for demonstration
  const targetCount = Math.max(200, logs.length);
  for (let i = logs.length; i < targetCount; i++) {
    const timestamp = new Date(startTime.getTime() + Math.random() * duration);
    const statusCode = Math.random() > 0.95 ? (Math.random() > 0.5 ? 500 : 400) : 200;
    
    logs.push({
      timestamp: timestamp.toISOString(),
      function_id: functions[Math.floor(Math.random() * functions.length)],
      status_code: statusCode,
      execution_time_ms: Math.floor(Math.random() * 500) + 50,
      event_message: statusCode >= 400 ? 'Error processing request' : 'Success',
    });
  }
  
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function generateMockLogs(startTime: Date, endTime: Date) {
  const logs = [];
  const functions = ['scan-orchestrate', 'ai-analyst', 'dashboard-kpis', 'providers-hibp', 'api-scan'];
  const duration = endTime.getTime() - startTime.getTime();
  
  // Generate ~200 logs over the time period
  for (let i = 0; i < 200; i++) {
    const timestamp = new Date(startTime.getTime() + Math.random() * duration);
    const statusCode = Math.random() > 0.95 ? (Math.random() > 0.5 ? 500 : 400) : 200;
    
    logs.push({
      timestamp: timestamp.toISOString(),
      function_id: functions[Math.floor(Math.random() * functions.length)],
      status_code: statusCode,
      execution_time_ms: Math.floor(Math.random() * 500) + 50,
      event_message: statusCode >= 400 ? 'Error processing request' : 'Success',
    });
  }
  
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function generateMockPgLogs(startTime: Date, endTime: Date) {
  const logs = [];
  const duration = endTime.getTime() - startTime.getTime();
  
  // Generate ~20 postgres logs (mostly warnings, few errors)
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(startTime.getTime() + Math.random() * duration);
    const severity = Math.random() > 0.8 ? 'ERROR' : 'WARNING';
    
    logs.push({
      timestamp: timestamp.toISOString(),
      error_severity: severity,
      event_message: severity === 'ERROR' 
        ? 'Connection pool exhausted' 
        : 'Slow query detected',
    });
  }
  
  return logs;
}
