import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-results-token',
};

interface WebhookPayload {
  job_id: string;
  batch_id?: string;
  username: string;
  status: 'completed' | 'failed' | 'queued' | 'running';
  summary?: any;
  raw?: any;
  user_id?: string;
  workspace_id?: string;
}

// UUID validation helper
const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESULTS_WEBHOOK_TOKEN = Deno.env.get('RESULTS_WEBHOOK_TOKEN')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const webhookToken = req.headers.get('X-Results-Token');
    if (!webhookToken || webhookToken !== RESULTS_WEBHOOK_TOKEN) {
      console.warn('[scan-results] Invalid or missing X-Results-Token header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid webhook token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WebhookPayload = await req.json();
    
    if (!payload.job_id || !payload.username || !payload.status) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request: job_id, username, and status are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-results] Webhook received for job ${payload.job_id}: ${payload.status}`);
    console.log(`[scan-results] Username: ${payload.username}, User ID: ${payload.user_id || 'none'}`);

    // Sanitize UUIDs before database insert - treat zero UUID as reserved
    const zeroUUID = '00000000-0000-0000-0000-000000000000';
    const safeUserId = payload.user_id && isUUID(payload.user_id) && payload.user_id !== zeroUUID 
      ? payload.user_id 
      : null;
    const safeWorkspaceId = payload.workspace_id && isUUID(payload.workspace_id) 
      ? payload.workspace_id 
      : null;
    
    if (payload.user_id === zeroUUID) {
      console.warn('[scan-results] Reserved zero UUID detected; storing user_id as null');
    } else if (payload.user_id && !safeUserId) {
      console.warn('[scan-results] Invalid user_id format in payload; storing as null');
    }
    if (payload.workspace_id && !safeWorkspaceId) {
      console.warn('[scan-results] Invalid workspace_id format in payload; storing as null');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: upsertError } = await supabase
      .from('maigret_results')
      .upsert({
        job_id: payload.job_id,
        batch_id: payload.batch_id || null,
        username: payload.username,
        status: payload.status,
        summary: payload.summary || {},
        raw: payload.raw || {},
        user_id: safeUserId,
        workspace_id: safeWorkspaceId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'job_id'
      });

    if (upsertError) {
      console.error('[scan-results] Database upsert error:', upsertError);
      return new Response(
        JSON.stringify({ 
          error: 'Database operation failed', 
          details: upsertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-results] Successfully stored results for job ${payload.job_id}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[scan-results] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
