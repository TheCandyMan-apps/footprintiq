import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get real-time metrics from the last 60 minutes
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Fetch edge function logs for API calls using analytics query
    const edgeLogsQuery = `
      select id, function_edge_logs.timestamp, event_message, response.status_code, request.method, 
      m.function_id, m.execution_time_ms, m.deployment_id, m.version 
      from function_edge_logs
      cross join unnest(metadata) as m
      cross join unnest(m.response) as response
      cross join unnest(m.request) as request
      where timestamp >= '${oneHourAgo.toISOString()}'
      order by timestamp desc
      limit 1000
    `;
    
    const { data: logs } = await supabase.rpc('analytics_query', { query: edgeLogsQuery }) as any;

    // Fetch postgres logs for errors
    const pgLogsQuery = `
      select identifier, postgres_logs.timestamp, id, event_message, parsed.error_severity 
      from postgres_logs
      cross join unnest(metadata) as m
      cross join unnest(m.parsed) as parsed
      where timestamp >= '${oneHourAgo.toISOString()}'
      and parsed.error_severity in ('ERROR', 'FATAL', 'WARNING')
      order by timestamp desc
      limit 500
    `;
    
    const { data: pgLogs } = await supabase.rpc('analytics_query', { query: pgLogsQuery }) as any;

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
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching observability metrics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
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
