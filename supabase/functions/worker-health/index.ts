import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  worker: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
  endpoint: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAIGRET_URL = Deno.env.get('VITE_MAIGRET_API_URL') || 'https://maigret-api-312297078337.europe-west1.run.app';
    const RECON_NG_URL = Deno.env.get('RECON_NG_WORKER_URL') || '';
    const SPIDERFOOT_URL = Deno.env.get('SPIDERFOOT_API_URL') || '';
    
    const results: HealthCheckResult[] = [];

    // Check Maigret
    const maigretStart = Date.now();
    try {
      const healthResp = await fetch(`${MAIGRET_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      results.push({
        worker: 'maigret',
        status: healthResp.ok ? 'online' : 'offline',
        responseTime: Date.now() - maigretStart,
        endpoint: MAIGRET_URL,
        error: healthResp.ok ? undefined : `HTTP ${healthResp.status}`,
      });
    } catch (error) {
      results.push({
        worker: 'maigret',
        status: 'offline',
        endpoint: MAIGRET_URL,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    // Check Recon-ng
    if (RECON_NG_URL) {
      const reconStart = Date.now();
      try {
        const reconResp = await fetch(`${RECON_NG_URL}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        results.push({
          worker: 'reconng',
          status: reconResp.ok ? 'online' : 'offline',
          responseTime: Date.now() - reconStart,
          endpoint: RECON_NG_URL,
          error: reconResp.ok ? undefined : `HTTP ${reconResp.status}`,
        });
      } catch (error) {
        results.push({
          worker: 'reconng',
          status: 'offline',
          endpoint: RECON_NG_URL,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    } else {
      results.push({
        worker: 'reconng',
        status: 'error',
        endpoint: 'Not configured',
        error: 'RECON_NG_WORKER_URL not set',
      });
    }

    // Check SpiderFoot
    if (SPIDERFOOT_URL) {
      const sfStart = Date.now();
      try {
        const sfResp = await fetch(`${SPIDERFOOT_URL}/api/v1/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        results.push({
          worker: 'spiderfoot',
          status: sfResp.ok ? 'online' : 'offline',
          responseTime: Date.now() - sfStart,
          endpoint: SPIDERFOOT_URL,
          error: sfResp.ok ? undefined : `HTTP ${sfResp.status}`,
        });
      } catch (error) {
        results.push({
          worker: 'spiderfoot',
          status: 'offline',
          endpoint: SPIDERFOOT_URL,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    } else {
      results.push({
        worker: 'spiderfoot',
        status: 'error',
        endpoint: 'Not configured',
        error: 'SPIDERFOOT_API_URL not set',
      });
    }

    // Environment validation
    const envConfig = {
      maigret: {
        url: MAIGRET_URL,
        hasToken: !!Deno.env.get('WORKER_TOKEN'),
      },
      reconng: {
        url: RECON_NG_URL,
        hasToken: !!Deno.env.get('WORKER_TOKEN'),
      },
      spiderfoot: {
        url: SPIDERFOOT_URL,
        hasApiKey: !!Deno.env.get('SPIDERFOOT_API_KEY'),
      },
    };

    return new Response(
      JSON.stringify({
        workers: results,
        environment: envConfig,
        timestamp: new Date().toISOString(),
        allOnline: results.every((r) => r.status === 'online'),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Worker health check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
