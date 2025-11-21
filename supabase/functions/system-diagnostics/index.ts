import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../_shared/secure.ts';
import { safeFetch } from '../_shared/errorHandler.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

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
    return new Response(null, { headers: addSecurityHeaders(corsHeaders()) });
  }

  try {
    // Authentication - admin only
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders(), 'Content-Type': 'application/json' }) }
      );
    }
    
    const { userId, role } = authResult.context;
    
    // Admin-only check
    if (role !== 'admin') {
      console.warn(`[system-diagnostics] Non-admin access attempt by user ${userId}`);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: addSecurityHeaders({ ...corsHeaders(), 'Content-Type': 'application/json' }) }
      );
    }

    // Rate limiting - 10 diagnostics/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'system-diagnostics', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders(), 'Content-Type': 'application/json' }) }
      );
    }

    console.log(`[system-diagnostics] Admin ${userId} running diagnostics`);

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
          status: 'degraded',
          responseTime: Date.now() - workerStart,
          message: `Worker unreachable: ${error.message}`
        });
      }
    } else {
      checks.push({
        name: 'maigret_worker',
        status: 'degraded',
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
          status: 'degraded',
          responseTime: Date.now() - workerStart,
          message: `Worker unreachable: ${error.message}`
        });
      }
    } else {
      checks.push({
        name: 'sherlock_worker',
        status: 'degraded',
        message: 'Worker URL not configured'
      });
    }

    // Determine overall status - only critical services (database) cause 'error' status
    const hasCriticalError = checks
      .filter(c => c.name === 'database')
      .some(c => c.status === 'error');
    
    const hasDegraded = checks.some(c => c.status === 'degraded');
    
    const overall: 'ok' | 'degraded' | 'error' = hasCriticalError 
      ? 'error' 
      : hasDegraded
        ? 'degraded' 
        : 'ok';

    console.log(`[system-diagnostics] Status calculation:`, {
      hasCriticalError,
      hasDegraded,
      overall,
      checks: checks.map(c => ({ name: c.name, status: c.status }))
    });

    const diagnostics: SystemDiagnostics = {
      overall,
      timestamp: new Date().toISOString(),
      checks,
      version: '1.0.0'
    };

    return new Response(
      JSON.stringify(diagnostics),
      { status: 200, headers: addSecurityHeaders({ ...corsHeaders(), 'Content-Type': 'application/json' }) }
    );
  } catch (error) {
    console.error('[system-diagnostics] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'System diagnostics failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders(), 'Content-Type': 'application/json' }) }
    );
  }
});