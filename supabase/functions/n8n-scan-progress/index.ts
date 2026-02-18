import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeScanId } from "../_shared/sanitizeIds.ts";
import { verifyFpiqHmac } from "../_shared/hmacAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token, x-n8n-key, x-fpiq-ts, x-fpiq-sig',
};

/**
 * Intermediate progress update endpoint for n8n to call during scan execution.
 * Allows updating scan progress as each provider starts/completes.
 *
 * Auth priority: HMAC (x-fpiq-ts + x-fpiq-sig) → x-n8n-key → x-callback-token
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read raw body BEFORE any JSON parsing (required for HMAC verification)
    const rawBody = await req.text();

    // ── Auth priority: 1) HMAC  2) x-n8n-key  3) legacy token ──
    let authenticated = false;

    // 1. HMAC signature verification (preferred)
    const fpiqTs = req.headers.get('x-fpiq-ts');
    const fpiqSig = req.headers.get('x-fpiq-sig');

    if (fpiqTs && fpiqSig) {
      const hmacResult = await verifyFpiqHmac(rawBody, req.headers);
      if (!hmacResult.authenticated) {
        console.error(`[n8n-scan-progress] HMAC auth failed: ${hmacResult.internalReason}`);
        return new Response(JSON.stringify({ error: 'Authentication failed', code: hmacResult.code }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      authenticated = true;
    }

    // 2. x-n8n-key shared secret
    if (!authenticated) {
      const n8nKey = req.headers.get('x-n8n-key');
      const expectedN8nKey = Deno.env.get('N8N_WEBHOOK_KEY');

      if (expectedN8nKey && n8nKey) {
        if (n8nKey === expectedN8nKey) {
          authenticated = true;
        } else {
          console.error('[n8n-scan-progress] x-n8n-key mismatch');
          return new Response(JSON.stringify({ error: 'Authentication failed', code: 'AUTH_KEY_INVALID' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3. Fallback: legacy x-callback-token / Authorization header
    if (!authenticated) {
      let callbackToken = 
        req.headers.get('x-callback-token') || 
        req.headers.get('Authorization');
      
      if (callbackToken?.startsWith('Bearer ')) {
        callbackToken = callbackToken.slice(7);
      }
      
      const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');
      const expectedN8nKey = Deno.env.get('N8N_WEBHOOK_KEY');
      
      if (!expectedToken && !expectedN8nKey) {
        console.error('[n8n-scan-progress] No auth secrets configured');
        return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!callbackToken || callbackToken !== expectedToken) {
        console.error('[n8n-scan-progress] Legacy token mismatch');
        return new Response(JSON.stringify({ error: 'Authentication failed', code: 'AUTH_KEY_INVALID' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse JSON from raw body string (already read for HMAC)
    const body = JSON.parse(rawBody);
    const { 
      scanId: rawScanId, 
      provider, 
      status, 
      message, 
      completedProviders, 
      currentProviders,
      findingsCount,
      // Step-based progress for Free tier UI
      step,
      totalSteps,
      stepTitle,
      stepDescription
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

    // GUARD: If n8n sends status='completed' with no provider, it means the workflow
    // finished orchestrating — but the results webhook hasn't fired yet.
    // Don't write 'completed' here; let n8n-scan-results handle finalization.
    const effectiveStatus = (status === 'completed' && !provider) ? 'running' : status;

    if (effectiveStatus) {
      updateData.status = effectiveStatus;
    } else if (currentProgress?.status) {
      // Preserve existing status when not explicitly provided
      updateData.status = currentProgress.status;
    } else {
      // Default for new records
      updateData.status = 'running';
    }

    if (message) {
      updateData.message = message;
    }

    // Handle completed_providers - INCREMENT when a provider completes
    if (typeof completedProviders === 'number') {
      updateData.completed_providers = completedProviders;
    } else if (status === 'completed' && provider && provider !== 'all') {
      // Auto-increment completed_providers when a specific provider completes
      const currentCount = currentProgress?.completed_providers || 0;
      updateData.completed_providers = currentCount + 1;
      console.log(`[n8n-scan-progress] Auto-incrementing completed_providers: ${currentCount} -> ${currentCount + 1}`);
    }

    if (Array.isArray(currentProviders)) {
      updateData.current_providers = currentProviders;
    }

    if (typeof findingsCount === 'number') {
      updateData.findings_count = findingsCount;
    }

    // Handle step-based progress for Free tier scans
    if (typeof step === 'number') {
      updateData.current_step = step;
      console.log(`[n8n-scan-progress] Step update: ${step}/${totalSteps || 6}`);
    }
    if (typeof totalSteps === 'number') {
      updateData.total_steps = totalSteps;
    }
    if (stepTitle) {
      updateData.step_title = stepTitle;
    }
    if (stepDescription) {
      updateData.step_description = stepDescription;
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

    // Send realtime broadcast for frontend to receive immediately
    try {
      const channel = supabase.channel(`scan_progress:${scanId}`);
      
      // Subscribe and wait briefly for connection
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 2000);
        channel.subscribe((subStatus) => {
          if (subStatus === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      // Broadcast provider update
      if (provider) {
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: status === 'started' ? 'loading' : status === 'completed' ? 'success' : status === 'failed' ? 'failed' : status,
            message: message || `${provider}: ${status}`,
            resultCount: findingsCount,
            // Include step data for Free tier UI
            step,
            stepTitle,
            stepDescription,
          },
        });
        console.log(`[n8n-scan-progress] Broadcast sent: ${provider} -> ${status}`);
      }
      
      // Broadcast step update for Free tier UI (separate event)
      if (typeof step === 'number' && step > 0) {
        await channel.send({
          type: 'broadcast',
          event: 'step_update',
          payload: {
            step,
            totalSteps: totalSteps || 6,
            stepTitle,
            stepDescription,
          },
        });
        console.log(`[n8n-scan-progress] Step broadcast sent: step ${step}`);
      }

      // Broadcast scan completion ONLY when the whole workflow is done (no specific provider).
      // Provider-level 'completed' events must NOT trigger scan_complete — only the final
      // workflow-level signal (provider=undefined/null, status='completed') should do so.
      // That signal is now sent by n8n-scan-results after all findings are stored.
      const isWorkflowLevelCompletion = (status === 'completed' || status === 'completed_partial' || status === 'completed_empty') && !provider;
      if (isWorkflowLevelCompletion) {
        await channel.send({
          type: 'broadcast',
          event: 'scan_complete',
          payload: {
            scanId,
            status,
            findingsCount: findingsCount || 0,
          },
        });
        console.log(`[n8n-scan-progress] Scan complete broadcast sent`);
      }

      // Clean up channel
      await supabase.removeChannel(channel);
    } catch (broadcastErr) {
      // Don't fail the request if broadcast fails - DB update already succeeded
      console.warn('[n8n-scan-progress] Broadcast failed (non-fatal):', broadcastErr);
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