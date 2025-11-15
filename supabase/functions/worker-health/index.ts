import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Worker Health Check Function
 * 
 * Pings all registered workers and updates their status in the database.
 * Should be called every 5 minutes via cron job.
 * 
 * Workers checked:
 * - Maigret (username scanning)
 * - Recon-ng (recon automation)
 * - Harvester (OSINT data collection)
 * - SpiderFoot (automated OSINT)
 */

interface WorkerConfig {
  name: string;
  type: string;
  healthUrl: string;
  timeout: number;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [WORKER-HEALTH] ${step}`, details ? JSON.stringify(details) : '');
};

async function checkWorkerHealth(config: WorkerConfig): Promise<{
  status: 'online' | 'offline' | 'degraded';
  responseTimeMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    logStep(`Checking ${config.name}`, { url: config.healthUrl });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(config.healthUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FootprintIQ-HealthCheck/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    
    if (response.ok) {
      const body = await response.text();
      logStep(`${config.name} health check passed`, { 
        status: response.status, 
        responseTime: `${responseTimeMs}ms` 
      });
      
      // Check if response time is slow (degraded)
      if (responseTimeMs > 5000) {
        return { status: 'degraded', responseTimeMs, error: 'Slow response time' };
      }
      
      return { status: 'online', responseTimeMs };
    } else {
      logStep(`${config.name} returned error status`, { status: response.status });
      return { 
        status: 'offline', 
        responseTimeMs,
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    logStep(`${config.name} health check failed`, { 
      error: errorMsg,
      responseTime: `${responseTimeMs}ms` 
    });
    
    return { 
      status: 'offline', 
      responseTimeMs,
      error: errorMsg.includes('abort') ? 'Timeout' : errorMsg
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  logStep('Worker health check started');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Define workers to check
    const workers: WorkerConfig[] = [
      {
        name: 'maigret',
        type: 'maigret',
        healthUrl: `${Deno.env.get('VITE_MAIGRET_API_URL')}/health`,
        timeout: 10000,
      },
      {
        name: 'recon-ng',
        type: 'recon-ng',
        healthUrl: `${Deno.env.get('RECON_NG_WORKER_URL')}/health`,
        timeout: 10000,
      },
      {
        name: 'harvester',
        type: 'harvester',
        healthUrl: `${Deno.env.get('HARVESTER_WORKER_URL') || 'http://localhost:8081'}/health`,
        timeout: 10000,
      },
      {
        name: 'spiderfoot',
        type: 'spiderfoot',
        healthUrl: `${Deno.env.get('SPIDERFOOT_URL') || 'http://localhost:5001'}/health`,
        timeout: 10000,
      },
    ];

    // Check all workers in parallel
    const healthChecks = await Promise.all(
      workers.map(async (worker) => {
        const result = await checkWorkerHealth(worker);
        
        // Update database
        const { error: updateError } = await supabase
          .from('worker_status')
          .upsert({
            worker_name: worker.name,
            worker_type: worker.type,
            status: result.status,
            last_check_at: new Date().toISOString(),
            last_success_at: result.status === 'online' ? new Date().toISOString() : undefined,
            response_time_ms: result.responseTimeMs,
            error_message: result.error || null,
            metadata: {
              last_health_check: new Date().toISOString(),
              endpoint: worker.healthUrl,
            },
          }, {
            onConflict: 'worker_name',
          });
        
        if (updateError) {
          logStep('ERROR: Failed to update worker status', { 
            worker: worker.name, 
            error: updateError.message 
          });
        }
        
        return {
          worker: worker.name,
          ...result,
        };
      })
    );

    // Count statuses
    const summary = {
      online: healthChecks.filter(w => w.status === 'online').length,
      degraded: healthChecks.filter(w => w.status === 'degraded').length,
      offline: healthChecks.filter(w => w.status === 'offline').length,
      total: healthChecks.length,
    };

    const duration = Date.now() - startTime;
    logStep('Health check completed', { 
      summary, 
      duration: `${duration}ms`,
      workers: healthChecks 
    });

    return new Response(JSON.stringify({
      success: true,
      summary,
      workers: healthChecks,
      duration_ms: duration,
      checked_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });

    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
