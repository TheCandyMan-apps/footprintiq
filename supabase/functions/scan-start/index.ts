import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-selftest-key',
};

interface ScanStartRequest {
  username: string;
  platforms?: string[];
  batch_id?: string;
}

// UUID validation helper
const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const MAIGRET_WORKER_URL = Deno.env.get('MAIGRET_WORKER_URL')!;
    const MAIGRET_WORKER_SCAN_PATH = Deno.env.get('MAIGRET_WORKER_SCAN_PATH') || '/scan';
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN')!;
    const SELFTEST_KEY = Deno.env.get('SELFTEST_KEY') ?? '';

    // Check for self-test bypass - strict validation only
    const selftestKey = req.headers.get('X-Selftest-Key');
    const isSelfTest = selftestKey && selftestKey === SELFTEST_KEY;
    
    console.log('[scan-start] Self-test check:', {
      headerValue: selftestKey,
      envValue: SELFTEST_KEY,
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
        { status: 401, headers: corsHeaders }
      );
    }
    
    let user = null;
    let workspaceId: string | null = null;

    if (isSelfTest) {
      // Self-test mode - use valid zero UUID
      user = { id: '00000000-0000-0000-0000-000000000000' } as any;
      console.log('[scan-start] Self-test mode activated');
    } else {
      // Optional auth flow - proceed with or without user token
      const authHeader = req.headers.get('Authorization');
      
      if (authHeader) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.warn('[scan-start] Auth token invalid, proceeding unauthenticated:', authError);
          user = { id: 'anonymous' } as any;
        } else {
          user = authUser;
        }
      } else {
        // No auth header - proceed as anonymous
        console.log('[scan-start] No authorization header, proceeding as anonymous');
        user = { id: 'anonymous' } as any;
      }
    }

    const body: ScanStartRequest = await req.json();
    
    if (!body.username?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isSelfTest && user && user.id !== 'anonymous') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      try {
        const { data: workspaceMember } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (workspaceMember) {
          workspaceId = workspaceMember.workspace_id;
        }
      } catch (workspaceError) {
        console.warn('[scan-start] Could not fetch workspace:', workspaceError);
      }
    }

    console.log(`[scan-start] Initiating scan for username: ${body.username}`);
    console.log(`[scan-start] User: ${user.id}, Workspace: ${workspaceId || 'none'}`);
    console.log(`[scan-start] Worker URL: ${MAIGRET_WORKER_URL}`);

    // Only include user_id/workspace_id if valid UUIDs
    const safeUserId = user?.id && isUUID(user.id) ? user.id : undefined;
    const safeWorkspaceId = workspaceId && isUUID(workspaceId) ? workspaceId : undefined;

    const workerPayload = {
      username: body.username.trim(),
      platforms: body.platforms || undefined,
      batch_id: body.batch_id || undefined,
      ...(safeUserId ? { user_id: safeUserId } : {}),
      ...(safeWorkspaceId ? { workspace_id: safeWorkspaceId } : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let workerResponse;
    try {
      const scanPath = MAIGRET_WORKER_SCAN_PATH.startsWith('/') ? MAIGRET_WORKER_SCAN_PATH : `/${MAIGRET_WORKER_SCAN_PATH}`;
      workerResponse = await fetch(`${MAIGRET_WORKER_URL}${scanPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WORKER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerPayload),
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[scan-start] Worker timeout');
        return new Response(
          JSON.stringify({ 
            error: 'Worker URL unreachable. Check MAIGRET_WORKER_URL.',
            details: 'Request timed out after 30 seconds'
          }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('[scan-start] Network error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Worker URL unreachable. Check MAIGRET_WORKER_URL.',
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
        errorMessage = 'Worker auth misconfigured. Check WORKER_TOKEN in Edge Function and Cloud Run.';
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
        job_id: workerData.job_id || workerData.id,
        status: workerData.status || 'queued'
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
