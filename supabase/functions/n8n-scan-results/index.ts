import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeScanId } from "../_shared/sanitizeIds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

// Normalize confidence - handle both numeric and string values
const normalizeConfidence = (conf: unknown): number => {
  if (typeof conf === 'number') return Math.min(1, Math.max(0, conf));
  if (typeof conf === 'string') {
    const lower = conf.toLowerCase();
    if (lower === 'high') return 0.9;
    if (lower === 'medium') return 0.7;
    if (lower === 'low') return 0.5;
    const parsed = parseFloat(conf);
    if (!isNaN(parsed)) return Math.min(1, Math.max(0, parsed));
  }
  return 0.7; // default
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication token
    const callbackToken = req.headers.get('x-callback-token');
    const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');
    
    if (!expectedToken) {
      console.error('[n8n-scan-results] N8N_CALLBACK_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!callbackToken || callbackToken !== expectedToken) {
      console.warn('[n8n-scan-results] Unauthorized request - invalid or missing token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role for writing results (n8n doesn't have user context)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { scanId: rawScanId, findings, status, providerResults, error: scanError } = body;

    // Sanitize scanId - strip leading '=' from n8n expression artifacts
    const scanId = sanitizeScanId(rawScanId);
    if (!scanId) {
      console.error(`[n8n-scan-results] Invalid or missing scanId: "${rawScanId}"`);
      return new Response(JSON.stringify({ error: 'Invalid or missing scanId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[n8n-scan-results] Receiving results for scan: ${scanId}`);
    console.log(`[n8n-scan-results] Findings count: ${findings?.length || 0}`);
    console.log(`[n8n-scan-results] Status: ${status}`);

    // Get the scan record to verify it exists
    const { data: scan, error: fetchError } = await supabase
      .from('scans')
      .select('id, user_id, workspace_id')
      .eq('id', scanId)
      .single();

    if (fetchError || !scan) {
      console.error('[n8n-scan-results] Scan not found:', scanId);
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process and store findings
    if (findings && Array.isArray(findings) && findings.length > 0) {
      const findingsToInsert = findings.map((finding: Record<string, unknown>) => {
        // Normalize kind - account.profile should become profile_presence
        const normalizedKind = finding.kind === 'account.profile' ? 'profile_presence' : (finding.kind || 'profile_presence');
        
        // Build evidence array, only including non-empty values
        const evidenceArray: Array<{key: string, value: string}> = [];
        const urlValue = finding.url || finding.primary_url;
        if (urlValue) evidenceArray.push({ key: 'url', value: String(urlValue) });
        if (finding.site) evidenceArray.push({ key: 'site', value: String(finding.site) });
        if (finding.username) evidenceArray.push({ key: 'username', value: String(finding.username) });
        
        // Append any additional evidence from n8n, filtering empty values
        if (Array.isArray(finding.evidence)) {
          for (const e of finding.evidence as Array<{key?: string, value?: unknown}>) {
            if (e.key && e.value) {
              evidenceArray.push({ key: String(e.key), value: String(e.value) });
            }
          }
        }
        
        return {
          scan_id: scanId,
          workspace_id: scan.workspace_id,
          provider: finding.provider || (finding.meta as Record<string, unknown>)?.provider || 'n8n',
          kind: normalizedKind,
          severity: finding.severity || 'info',
          confidence: normalizeConfidence(finding.confidence),
          observed_at: new Date().toISOString(),
          evidence: evidenceArray,
          meta: {
            ...(finding.meta as Record<string, unknown> || {}),
            title: finding.title || finding.site || 'Unknown',
            description: finding.description || `Profile found on ${finding.site || 'unknown platform'}`,
            url: finding.url || finding.primary_url,
            site: finding.site,
            source: 'n8n',
          },
          created_at: new Date().toISOString(),
        };
      });

      console.log(`[n8n-scan-results] Inserting ${findingsToInsert.length} findings`);

      const { error: insertError } = await supabase
        .from('findings')
        .insert(findingsToInsert);

      if (insertError) {
        console.error('[n8n-scan-results] Error inserting findings:', insertError);
        // Continue anyway - we'll still update scan status
      } else {
        console.log(`[n8n-scan-results] Successfully inserted ${findingsToInsert.length} findings`);
      }
    }

    // Compute per-provider stats from findings if providerResults not provided
    let computedProviderResults: Record<string, { status: string; count: number; duration_ms?: number; error?: string }> = {};
    
    if (providerResults && typeof providerResults === 'object' && Object.keys(providerResults).length > 0) {
      // Use provided providerResults
      computedProviderResults = providerResults as typeof computedProviderResults;
    } else if (findings && Array.isArray(findings) && findings.length > 0) {
      // Compute from findings
      for (const finding of findings) {
        const provider = String(finding.provider || (finding.meta as Record<string, unknown>)?.provider || 'n8n');
        if (!computedProviderResults[provider]) {
          computedProviderResults[provider] = { status: 'success', count: 0 };
        }
        computedProviderResults[provider].count++;
      }
      console.log('[n8n-scan-results] Computed provider stats from findings:', computedProviderResults);
    }

    const providerCount = Object.keys(computedProviderResults).length || 1;

    // Log provider results for debugging
    if (Object.keys(computedProviderResults).length > 0) {
      console.log('[n8n-scan-results] Provider results summary:');
      for (const [provider, result] of Object.entries(computedProviderResults)) {
        console.log(`  ${provider}: ${result.status}, findings: ${result.count || 0}`);
      }

      // Store provider events with required stage field
      const events = Object.entries(computedProviderResults).map(([provider, result]) => ({
        scan_id: scanId,
        provider: provider,
        stage: 'complete',  // Required field with default
        status: result.status || 'success',
        duration_ms: result.duration_ms || null,
        findings_count: result.count || 0,
        error_message: result.error || null,
        created_at: new Date().toISOString(),
      }));

      const { error: eventsError } = await supabase
        .from('scan_events')
        .insert(events);

      if (eventsError) {
        console.error('[n8n-scan-results] Error inserting scan events:', eventsError);
      } else {
        console.log(`[n8n-scan-results] Inserted ${events.length} scan_events`);
      }
    }

    // Determine final scan status
    let finalStatus = status || 'completed';
    if (scanError) {
      finalStatus = 'failed';
    } else if (Object.keys(computedProviderResults).length > 0) {
      const results = Object.values(computedProviderResults);
      const hasSuccess = results.some((r) => r.status === 'success');
      const allFailed = results.every((r) => r.status === 'failed' || r.status === 'timeout');
      
      if (allFailed) {
        finalStatus = 'failed';
      } else if (hasSuccess && results.some((r) => r.status === 'failed' || r.status === 'timeout')) {
        finalStatus = 'completed_partial';
      }
    }

    // Update scan status
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        total_sources_found: findings?.length || 0,
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('[n8n-scan-results] Error updating scan status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update scan status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update scan_progress table for real-time UI updates
    // Preserve the original total_providers from initial setup, only update completed
    const { data: existingProgress } = await supabase
      .from('scan_progress')
      .select('total_providers')
      .eq('scan_id', scanId)
      .maybeSingle();
    
    const originalTotalProviders = existingProgress?.total_providers || providerCount;
    
    const { error: progressError } = await supabase
      .from('scan_progress')
      .upsert({
        scan_id: scanId,
        status: finalStatus,
        total_providers: originalTotalProviders,  // Preserve original total
        completed_providers: providerCount,  // Actual providers that returned
        current_providers: [],
        findings_count: findings?.length || 0,
        message: `Scan complete: ${findings?.length || 0} findings from ${providerCount} providers`,
        error: finalStatus === 'failed',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'scan_id' });

    if (progressError) {
      console.error('[n8n-scan-results] Error updating scan_progress:', progressError);
    }

    // Send real-time broadcast events for UI updates
    try {
      const channel = supabase.channel(`scan_progress:${scanId}`);
      
      // Must subscribe before sending broadcasts
      await new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Channel subscription failed'));
          }
        });
        // Timeout after 5 seconds
        setTimeout(() => resolve(), 5000);
      });
      
      // Send provider completion events using computed results
      for (const [provider, result] of Object.entries(computedProviderResults)) {
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: result.status === 'success' ? 'success' : 'failed',
            message: `${provider}: ${result.count || 0} findings`,
            resultCount: result.count || 0,
          },
        });
      }
      
      // Send scan complete event
      await channel.send({
        type: 'broadcast',
        event: 'scan_complete',
        payload: {
          status: finalStatus,
          findingsCount: findings?.length || 0,
        },
      });
      
      console.log(`[n8n-scan-results] Sent broadcast events for scan ${scanId}`);
      
      // Cleanup channel after a short delay
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    } catch (broadcastErr) {
      console.error('[n8n-scan-results] Error sending broadcast:', broadcastErr);
      // Non-fatal - continue anyway
    }

    console.log(`[n8n-scan-results] Scan ${scanId} completed with status: ${finalStatus}`);

    return new Response(JSON.stringify({ 
      success: true,
      scanId: scanId,
      status: finalStatus,
      findingsCount: findings?.length || 0,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('[n8n-scan-results] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
