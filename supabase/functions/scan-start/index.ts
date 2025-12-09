import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-selftest-key',
};

const ScanStartSchema = z.object({
  username: z.string().trim().min(1).max(100),
  platforms: z.array(z.string()).optional(),
  batch_id: z.string().uuid().optional(),
  timeout: z.number().int().min(1).max(300).optional(),
});

interface ScanStartRequest {
  username: string;
  platforms?: string[];
  batch_id?: string;
  timeout?: number;
}

// UUID validation helper
const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Use unified OSINT worker
    const OSINT_WORKER_URL = Deno.env.get('OSINT_WORKER_URL')!;
    const OSINT_WORKER_TOKEN = Deno.env.get('OSINT_WORKER_TOKEN')!;
    const SELFTEST_KEY = Deno.env.get('SELFTEST_KEY') ?? '';

    // Check for self-test bypass - strict validation only
    const selftestKey = req.headers.get('X-Selftest-Key');
    const isSelfTest = selftestKey && selftestKey === SELFTEST_KEY;
    
    console.log('[scan-start] Self-test check:', {
      headerValue: selftestKey,
      isSelfTest,
      headerPresent: !!selftestKey
    });

    // Enhanced error for selftest key mismatch
    if (selftestKey && !isSelfTest) {
      console.error('[scan-start] SELFTEST_KEY mismatch detected');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: SELFTEST_KEY mismatch',
          hint: 'Run /maigret/self-test validation to diagnose. Backend expects different key than provided.'
        }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    
    let userId: string;
    let workspaceId: string | null = null;

    if (isSelfTest) {
      // Self-test mode - use valid zero UUID
      userId = '00000000-0000-0000-0000-000000000000';
      console.log('[scan-start] Self-test mode activated');
    } else {
      // Authentication
      const authResult = await validateAuth(req);
      if (!authResult.valid || !authResult.context) {
        return new Response(
          JSON.stringify({ error: authResult.error || 'Unauthorized' }),
          { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
        );
      }
      userId = authResult.context.userId;
    }

    const body = await req.json();
    
    // Input validation
    const validation = ScanStartSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const scanRequest: ScanStartRequest = validation.data;

    // Rate limiting for non-selftest scans
    if (!isSelfTest) {
      const rateLimitResult = await checkRateLimit(userId, 'user', 'scan-start', {
        maxRequests: 20,
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
    }

    if (!isSelfTest && userId !== '00000000-0000-0000-0000-000000000000') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      try {
        const { data: workspaceMember } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (workspaceMember) {
          workspaceId = workspaceMember.workspace_id;
        }
      } catch (workspaceError) {
        console.warn('[scan-start] Could not fetch workspace:', workspaceError);
      }
    }

    console.log(`[scan-start] Initiating scan for username: ${scanRequest.username}`);
    console.log(`[scan-start] User: ${userId}, Workspace: ${workspaceId || 'none'}`);
    console.log(`[scan-start] Worker URL: ${OSINT_WORKER_URL}`);

    // Calculate timeout: default 25s, min 10s, max 120s
    const timeoutSec = Math.max(10, Math.min(Number(body.timeout ?? 25), 120));

    // Build unified worker payload per contract
    const workerPayload = {
      tool: 'maigret', // Use maigret as default tool for scan-start
      username: body.username.trim(),
      token: OSINT_WORKER_TOKEN,
    };

    console.log('[scan-start] Worker payload:', JSON.stringify({ ...workerPayload, token: '***' }, null, 2));

    const controller = new AbortController();
    // Dynamic request timeout: worker timeout + 5s buffer, max 90s
    const requestTimeoutMs = Math.min(timeoutSec * 1000 + 5000, 90000);
    const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

    // Build scan URL
    const scanUrl = OSINT_WORKER_URL.endsWith('/scan') 
      ? OSINT_WORKER_URL 
      : `${OSINT_WORKER_URL}/scan`;

    let workerResponse;
    try {
      workerResponse = await fetch(scanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerPayload),
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`[scan-start] Worker request timeout after ${requestTimeoutMs}ms`);
        
        // Graceful fallback: if client provided batch_id, return 202 for polling
        if (body.batch_id) {
          console.log('[scan-start] Returning 202 - worker still processing, client can poll for results');
          return new Response(
            JSON.stringify({ 
              job_id: body.batch_id,
              status: 'queued',
              note: 'Worker still processing - results will be available shortly via polling'
            }),
            { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // No batch_id: return 504 for backwards compatibility
        return new Response(
          JSON.stringify({ 
            error: 'Worker timeout. Check OSINT_WORKER_URL.',
            details: `Request timed out after ${requestTimeoutMs}ms`
          }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('[scan-start] Network error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Worker unreachable. Check OSINT_WORKER_URL.',
          details: fetchError.message
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    clearTimeout(timeoutId);

    if (!workerResponse.ok) {
      const errorBody = await workerResponse.text().catch(() => 'Unknown error');
      console.error(`[scan-start] Worker error ${workerResponse.status}: ${errorBody}`);
      
      let errorMessage = 'Worker error';
      if (workerResponse.status === 401 || workerResponse.status === 403) {
        errorMessage = 'Worker auth misconfigured. Check OSINT_WORKER_TOKEN.';
      } else if (workerResponse.status === 404) {
        errorMessage = 'Worker route missing (/scan). Verify Cloud Run deployment.';
      } else if (workerResponse.status >= 500) {
        errorMessage = 'Worker crashed. Check Cloud Run logs.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: workerResponse.status,
          details: errorBody 
        }),
        { status: workerResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workerData = await workerResponse.json();
    console.log(`[scan-start] Worker response:`, workerData);

    return new Response(
      JSON.stringify({ 
        job_id: workerData.job_id || workerData.id || body.batch_id,
        status: workerData.status || 'completed',
        results: workerData.results || [],
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[scan-start] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        type: error.name || 'Error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
