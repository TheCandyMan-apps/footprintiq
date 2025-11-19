import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../_shared/secure.ts';
import { safeFetch } from '../_shared/errorHandler.ts';

interface DiagnosticCheck {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
}

interface SystemDiagnostics {
  overall: 'ok' | 'degraded' | 'error';
  timestamp: string;
  checks: DiagnosticCheck[];
  version: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const checks: DiagnosticCheck[] = [];
    
    // Check 1: Database connectivity
    const dbStart = Date.now();
    try {
      const { error } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      checks.push({
        name: 'database',
        status: 'ok',
        responseTime: Date.now() - dbStart,
        message: 'Database connection healthy'
      });
    } catch (error: any) {
      checks.push({
        name: 'database',
        status: 'error',
        responseTime: Date.now() - dbStart,
        message: `Database error: ${error.message}`
      });
    }

    // Check 2: Maigret Worker
    const maigretWorkerUrl = Deno.env.get('MAIGRET_WORKER_URL');
    if (maigretWorkerUrl) {
      const workerStart = Date.now();
      try {
        const response = await safeFetch(
          `${maigretWorkerUrl}/health`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('WORKER_TOKEN') || ''}`
            }
          },
          5000, // 5 second timeout
          0 // No retries for health check
        );

        if (response.ok) {
          checks.push({
            name: 'maigret_worker',
            status: 'ok',
            responseTime: Date.now() - workerStart,
            message: 'Maigret worker responding'
          });
        } else {
          checks.push({
            name: 'maigret_worker',
            status: 'degraded',
            responseTime: Date.now() - workerStart,
            message: `Worker returned status ${response.status}`
          });
        }
      } catch (error: any) {
        checks.push({
          name: 'maigret_worker',
          status: 'error',
          responseTime: Date.now() - workerStart,
          message: `Worker unreachable: ${error.message}`
        });
      }
    } else {
      checks.push({
        name: 'maigret_worker',
        status: 'error',
        message: 'Worker URL not configured'
      });
    }

    // Check 3: Sherlock Worker
    const sherlockWorkerUrl = Deno.env.get('SHERLOCK_WORKER_URL');
    if (sherlockWorkerUrl) {
      const workerStart = Date.now();
      try {
        const response = await safeFetch(
          `${sherlockWorkerUrl}/health`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SHERLOCK_WORKER_TOKEN') || ''}`
            }
          },
          5000,
          0
        );

        if (response.ok) {
          checks.push({
            name: 'sherlock_worker',
            status: 'ok',
            responseTime: Date.now() - workerStart,
            message: 'Sherlock worker responding'
          });
        } else {
          checks.push({
            name: 'sherlock_worker',
            status: 'degraded',
            responseTime: Date.now() - workerStart,
            message: `Worker returned status ${response.status}`
          });
        }
      } catch (error: any) {
        checks.push({
          name: 'sherlock_worker',
          status: 'error',
          responseTime: Date.now() - workerStart,
          message: `Worker unreachable: ${error.message}`
        });
      }
    } else {
      checks.push({
        name: 'sherlock_worker',
        status: 'error',
        message: 'Worker URL not configured'
      });
    }

    // Determine overall status
    const hasError = checks.some(c => c.status === 'error');
    const hasDegraded = checks.some(c => c.status === 'degraded');
    
    const overall: 'ok' | 'degraded' | 'error' = hasError 
      ? 'error' 
      : hasDegraded 
        ? 'degraded' 
        : 'ok';

    const diagnostics: SystemDiagnostics = {
      overall,
      timestamp: new Date().toISOString(),
      checks,
      version: '1.0.0'
    };

    return ok(diagnostics);
    
  } catch (error: any) {
    console.error('[system-diagnostics] Error:', error);
    return bad(500, error.message || 'Diagnostic check failed');
  }
});