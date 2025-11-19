/**
 * Health Check Edge Function
 * Provides real-time system health diagnostics for admin dashboard
 * Tests: Database connectivity, OSINT worker availability, system metrics
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: CheckResult;
    osint_workers: CheckResult;
    edge_functions: CheckResult;
  };
  metrics: {
    pending_scans: number;
    avg_scan_time_minutes: number;
    error_rate_24h: number;
  };
}

interface CheckResult {
  status: 'ok' | 'warn' | 'error';
  message: string;
  latency_ms?: number;
  details?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Database Health Check
    const dbCheckStart = Date.now();
    let dbCheck: CheckResult;
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      
      if (error) throw error;
      
      dbCheck = {
        status: 'ok',
        message: 'Database connection successful',
        latency_ms: Date.now() - dbCheckStart,
      };
    } catch (err) {
      const error = err as Error;
      dbCheck = {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        latency_ms: Date.now() - dbCheckStart,
      };
    }

    // 2. OSINT Workers Health Check
    const workersCheckStart = Date.now();
    let workersCheck: CheckResult;
    try {
      const maigretUrl = Deno.env.get('MAIGRET_WORKER_URL');
      const sherlockUrl = Deno.env.get('SHERLOCK_WORKER_URL');
      
      const workerChecks = await Promise.allSettled([
        fetch(`${maigretUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${sherlockUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        }),
      ]);

      const results = workerChecks.map((r, i) => ({
        worker: i === 0 ? 'maigret' : 'sherlock',
        ok: r.status === 'fulfilled' && r.value.ok,
      }));

      const allOk = results.every(r => r.ok);
      const someOk = results.some(r => r.ok);

      workersCheck = {
        status: allOk ? 'ok' : someOk ? 'warn' : 'error',
        message: allOk 
          ? 'All OSINT workers responding' 
          : someOk 
          ? 'Some OSINT workers unavailable'
          : 'All OSINT workers unavailable',
        latency_ms: Date.now() - workersCheckStart,
        details: results,
      };
    } catch (err) {
      const error = err as Error;
      workersCheck = {
        status: 'error',
        message: `Worker health check failed: ${error.message}`,
        latency_ms: Date.now() - workersCheckStart,
      };
    }

    // 3. Edge Functions Health (self-check)
    const edgeFunctionsCheck: CheckResult = {
      status: 'ok',
      message: 'Edge functions operational',
      latency_ms: Date.now() - startTime,
    };

    // 4. Collect System Metrics
    const metricsStart = Date.now();
    let metrics = {
      pending_scans: 0,
      avg_scan_time_minutes: 0,
      error_rate_24h: 0,
    };

    try {
      // Count pending scans
      const { count: pendingCount } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']);
      
      metrics.pending_scans = pendingCount || 0;

      // Calculate average scan time (completed scans in last 24h)
      const { data: recentScans } = await supabase
        .from('scans')
        .select('created_at, completed_at')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      if (recentScans && recentScans.length > 0) {
        const durations = recentScans
          .filter(s => s.completed_at)
          .map(s => {
            const start = new Date(s.created_at).getTime();
            const end = new Date(s.completed_at).getTime();
            return (end - start) / (1000 * 60); // minutes
          });
        
        if (durations.length > 0) {
          metrics.avg_scan_time_minutes = Math.round(
            durations.reduce((a, b) => a + b, 0) / durations.length * 10
          ) / 10;
        }
      }

      // Calculate error rate (errors in last 24h vs total operations)
      const { count: errorCount } = await supabase
        .from('system_errors')
        .select('*', { count: 'exact', head: true })
        .in('severity', ['error', 'critical'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { count: totalOps } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (totalOps && totalOps > 0) {
        metrics.error_rate_24h = Math.round((errorCount || 0) / totalOps * 1000) / 10; // percentage
      }
    } catch (err) {
      console.warn('Failed to collect metrics:', err);
    }

    // 5. Determine Overall Status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    
    if (dbCheck.status === 'error' || workersCheck.status === 'error') {
      overallStatus = 'unhealthy';
    } else if (dbCheck.status === 'warn' || workersCheck.status === 'warn' || metrics.error_rate_24h > 5) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const response: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
        osint_workers: workersCheck,
        edge_functions: edgeFunctionsCheck,
      },
      metrics,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (err) {
    const error = err as Error;
    console.error('Health check failed:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
