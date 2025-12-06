import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeScanId } from "../_shared/sanitizeIds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

/**
 * Intermediate progress update endpoint for n8n to call during scan execution.
 * Allows updating scan progress as each provider starts/completes.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication token
    const callbackToken = req.headers.get('x-callback-token');
    const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');
    
    if (!expectedToken) {
      console.error('[n8n-scan-progress] N8N_CALLBACK_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!callbackToken || callbackToken !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { 
      scanId: rawScanId, 
      provider, 
      status, 
      message, 
      completedProviders, 
      currentProviders,
      findingsCount 
    } = body;

    // Sanitize scanId - strip leading '=' from n8n expression artifacts
    const scanId = sanitizeScanId(rawScanId);
    if (!scanId) {
      console.error(`[n8n-scan-progress] Invalid or missing scanId: "${rawScanId}"`);
      return new Response(JSON.stringify({ error: 'Invalid or missing scanId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[n8n-scan-progress] Update for scan ${scanId}: provider=${provider}, status=${status}`);

    // Get current progress to merge updates
    const { data: currentProgress, error: fetchError } = await supabase
      .from('scan_progress')
      .select('*')
      .eq('scan_id', scanId)
      .maybeSingle();

    if (fetchError) {
      console.error('[n8n-scan-progress] Error fetching progress:', fetchError);
    }

    // Build update object, preserving existing values
    const updateData: Record<string, unknown> = {
      scan_id: scanId,
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    } else if (!currentProgress) {
      updateData.status = 'running';
    }

    if (message) {
      updateData.message = message;
    }

    if (typeof completedProviders === 'number') {
      updateData.completed_providers = completedProviders;
    }

    if (Array.isArray(currentProviders)) {
      updateData.current_providers = currentProviders;
    }

    if (typeof findingsCount === 'number') {
      updateData.findings_count = findingsCount;
    }

    // Preserve total_providers if it exists
    if (currentProgress?.total_providers) {
      updateData.total_providers = currentProgress.total_providers;
    }

    // Upsert progress
    const { error: upsertError } = await supabase
      .from('scan_progress')
      .upsert(updateData, { onConflict: 'scan_id' });

    if (upsertError) {
      console.error('[n8n-scan-progress] Error upserting progress:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to update progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optionally store a scan event for this provider update
    if (provider && status) {
      await supabase.from('scan_events').insert({
        scan_id: scanId,
        provider: provider,
        stage: status === 'started' ? 'start' : status === 'completed' ? 'complete' : status,
        status: status,
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('[n8n-scan-progress] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});