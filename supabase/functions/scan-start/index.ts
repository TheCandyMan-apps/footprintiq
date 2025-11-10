import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanStartRequest {
  username: string;
  platforms?: string[];
  batch_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const MAIGRET_WORKER_URL = Deno.env.get('MAIGRET_WORKER_URL')!;
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[scan-start] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ScanStartRequest = await req.json();
    
    if (!body.username?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let workspaceId: string | null = null;
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

    console.log(`[scan-start] Initiating scan for username: ${body.username}`);
    console.log(`[scan-start] User: ${user.id}, Workspace: ${workspaceId || 'none'}`);
    console.log(`[scan-start] Worker URL: ${MAIGRET_WORKER_URL}`);

    const workerPayload = {
      username: body.username.trim(),
      platforms: body.platforms || undefined,
      batch_id: body.batch_id || undefined,
      user_id: user.id,
      workspace_id: workspaceId,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let workerResponse;
    try {
      workerResponse = await fetch(`${MAIGRET_WORKER_URL}/scan`, {
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
