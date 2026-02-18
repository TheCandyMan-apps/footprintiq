import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeScanId } from "../_shared/sanitizeIds.ts";
import { verifyFpiqHmac } from "../_shared/hmacAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token, x-n8n-key, x-fpiq-ts, x-fpiq-sig',
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

/**
 * Scan results endpoint for n8n to post final OSINT findings.
 *
 * Auth priority: HMAC (x-fpiq-ts + x-fpiq-sig) → x-n8n-key → x-callback-token
 */
serve(async (req) => {
  // Handle CORS preflight
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
        console.error(`[n8n-scan-results] HMAC auth failed: ${hmacResult.internalReason}`);
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
          console.error('[n8n-scan-results] x-n8n-key mismatch');
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
        console.error('[n8n-scan-results] No auth secrets configured');
        return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!callbackToken || callbackToken !== expectedToken) {
        console.error('[n8n-scan-results] Legacy token mismatch');
        return new Response(JSON.stringify({ error: 'Authentication failed', code: 'AUTH_KEY_INVALID' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role for writing results (n8n doesn't have user context)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse JSON from raw body string (already read for HMAC)
    const body = JSON.parse(rawBody);

    // ====== ROBUST PAYLOAD EXTRACTION ======
    // n8n can send data in various structures depending on workflow configuration
    console.log('[n8n-scan-results] Raw body keys:', Object.keys(body));
    console.log('[n8n-scan-results] Body preview:', JSON.stringify(body).substring(0, 2000));

    // First check URL query parameter - most reliable way to pass scanId from n8n
    const url = new URL(req.url);
    let rawScanId = url.searchParams.get('scanId') || '';
    
    console.log('[n8n-scan-results] Query param scanId:', rawScanId);

    // Try body locations if query param is empty
    if (!rawScanId || rawScanId === '') {
      rawScanId = body.scanId || '';
    }
    
    // Try alternative locations if scanId is missing or empty
    if (!rawScanId || rawScanId === '') {
      // Check if data is wrapped in json property (common n8n pattern)
      if (body.json?.scanId) rawScanId = body.json.scanId;
      // Check data property
      else if (body.data?.scanId) rawScanId = body.data.scanId;
      // Check if it's an array (n8n sometimes sends arrays)
      else if (Array.isArray(body) && body[0]?.scanId) rawScanId = body[0].scanId;
      else if (Array.isArray(body) && body[0]?.json?.scanId) rawScanId = body[0].json.scanId;
      // Check items array
      else if (body.items?.[0]?.scanId) rawScanId = body.items[0].scanId;
      else if (body.items?.[0]?.json?.scanId) rawScanId = body.items[0].json.scanId;
    }
    
    console.log('[n8n-scan-results] Extracted rawScanId:', rawScanId);

    // Extract findings from multiple possible locations
    let findings = body.findings;
    if (!Array.isArray(findings) || findings.length === 0) {
      // Try alternative locations - ordered by most likely for n8n Quick Scan workflow
      if (Array.isArray(body.results?.results)) {
        // n8n Quick Scan sends: { results: { tool: "sherlock", results: [...] } }
        findings = body.results.results;
        console.log('[n8n-scan-results] Found findings in body.results.results');
      } else if (Array.isArray(body.json?.findings)) {
        findings = body.json.findings;
      } else if (Array.isArray(body.data?.findings)) {
        findings = body.data.findings;
      } else if (Array.isArray(body.results)) {
        findings = body.results;
      } else if (Array.isArray(body.data?.results)) {
        findings = body.data.results;
      } else if (Array.isArray(body.items)) {
        findings = body.items;
      } else if (Array.isArray(body) && body[0]?.findings) {
        findings = body[0].findings;
      }
    }

    // Extract status and providerResults similarly
    let status = body.status || body.json?.status || body.data?.status;
    let providerResults = body.providerResults || body.json?.providerResults || body.data?.providerResults;
    let scanError = body.error || body.json?.error || body.data?.error;

    console.log('[n8n-scan-results] Extracted findings count:', findings?.length || 0);
    console.log('[n8n-scan-results] Extracted status:', status);
    console.log('[n8n-scan-results] Provider results:', providerResults ? Object.keys(providerResults) : 'none');

    // Sanitize scanId - strip leading '=' from n8n expression artifacts
    const scanId = sanitizeScanId(rawScanId);
    if (!scanId) {
      console.error(`[n8n-scan-results] Invalid or missing scanId after extraction: "${rawScanId}"`);
      console.error('[n8n-scan-results] Full body for debugging:', JSON.stringify(body).substring(0, 3000));
      return new Response(JSON.stringify({ 
        error: 'Invalid or missing scanId',
        hint: 'Ensure your n8n Merge Results node outputs scanId in the payload',
        receivedKeys: Object.keys(body),
      }), {
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
      const findingsToInsert = findings
        // Filter out negative results (found === false)
        .filter((finding: Record<string, unknown>) => finding.found !== false)
        .map((finding: Record<string, unknown>) => {
          // ── Detect Telegram-format findings ──
          // Telegram proxy sends: { source, finding_type, confidence (0-100), summary, data: {...} }
          const isTelegramFormat = finding.source === 'telegram' || finding.finding_type;

          // Normalize kind - account.profile should become profile_presence
          const normalizedKind = isTelegramFormat
            ? (finding.finding_type as string || 'telegram_username')
            : (finding.kind === 'account.profile' ? 'profile_presence' : (finding.kind || 'profile_presence'));
          
          // Extract provider from meta or default to tool name or 'whatsmyname'
          const provider = finding.provider || 
            finding.source ||  // Telegram uses 'source' field
            (finding.meta as Record<string, unknown>)?.provider || 
            body.results?.tool ||  // n8n Quick Scan includes tool name
            body.source ||  // Top-level source field from Telegram callback
            'whatsmyname';
          
          // Build evidence array, only including non-empty values
          const evidenceArray: Array<{key: string, value: string}> = [];

          // For Telegram-format findings, extract evidence from the 'data' object
          if (isTelegramFormat && finding.data && typeof finding.data === 'object') {
            const data = finding.data as Record<string, unknown>;
            for (const [key, value] of Object.entries(data)) {
              if (value !== null && value !== undefined && value !== '') {
                evidenceArray.push({ key, value: String(value) });
              }
            }
            if (finding.summary) {
              evidenceArray.push({ key: 'summary', value: String(finding.summary) });
            }
          } else {
            const urlValue = finding.url || finding.primary_url;
            if (urlValue) evidenceArray.push({ key: 'url', value: String(urlValue) });
            if (finding.site) evidenceArray.push({ key: 'site', value: String(finding.site) });
            if (finding.username || body.username) {
              evidenceArray.push({ key: 'username', value: String(finding.username || body.username) });
            }
          }
          
          // Append any additional evidence from n8n, filtering empty values
          if (Array.isArray(finding.evidence)) {
            for (const e of finding.evidence as Array<{key?: string, value?: unknown}>) {
              if (e.key && e.value) {
                evidenceArray.push({ key: String(e.key), value: String(e.value) });
              }
            }
          }
          
          // Normalize confidence: Telegram sends 0-100, standard sends 0-1
          const rawConfidence = finding.confidence;
          const confidence = isTelegramFormat && typeof rawConfidence === 'number' && rawConfidence > 1
            ? normalizeConfidence(rawConfidence / 100)
            : normalizeConfidence(rawConfidence);

          // Determine severity based on NSFW flag
          const severity = finding.nsfw ? 'warning' : (finding.severity || 'info');
          
          // Build meta object
          const metaObj: Record<string, unknown> = isTelegramFormat
            ? {
                ...(finding.data as Record<string, unknown> || {}),
                title: finding.summary || `Telegram: ${normalizedKind}`,
                description: finding.summary || `Telegram finding for scan`,
                source: 'telegram',
                visibility: finding.visibility || 'free',
              }
            : {
                ...(finding.meta as Record<string, unknown> || {}),
                title: finding.title || finding.site || 'Unknown',
                description: finding.description || `Profile found on ${finding.site || 'unknown platform'}`,
                url: finding.url || finding.primary_url,
                site: finding.site,
                nsfw: finding.nsfw || false,
                source: 'n8n',
              };

          return {
            scan_id: scanId,
            workspace_id: scan.workspace_id,
            provider: provider,
            kind: normalizedKind,
            severity: severity,
            confidence: confidence,
            observed_at: new Date().toISOString(),
            evidence: evidenceArray,
            meta: metaObj,
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
        
        // ====== BRAVE SEARCH ENRICHMENT FOR LENS CORROBORATION ======
        // After inserting primary findings, run Brave Search to verify profiles in web index
        // This adds +12 LENS confidence points for verified findings
        try {
          // Extract username from body payload
          const username = body.username || body.json?.username || body.data?.username || '';
          
          if (username) {
            console.log(`[n8n-scan-results] Running Brave Search enrichment for username: ${username}`);
            
            // Extract unique profile sites from findings (limit to top 5 for efficiency)
            const profileSites = findingsToInsert
              .filter((f: { kind?: string; meta?: { url?: string } }) => 
                f.kind === 'profile_presence' && f.meta?.url
              )
              .slice(0, 5)
              .map((f: { meta?: { site?: string; url?: string } }) => ({
                site: f.meta?.site || 'unknown',
                url: f.meta?.url,
              }));
            
            if (profileSites.length > 0) {
              // Call brave-search edge function with service role auth
              const braveResponse = await fetch(
                `${supabaseUrl}/functions/v1/brave-search`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceRoleKey}`,
                  },
                  body: JSON.stringify({
                    target: username,
                    type: 'username',
                    searchType: 'web',
                    count: 10,
                  }),
                }
              );
              
              if (braveResponse.ok) {
                const braveData = await braveResponse.json();
                console.log(`[n8n-scan-results] Brave Search returned ${braveData.findings?.length || 0} findings`);
                
                // Insert Brave findings as web_index.hit/miss for LENS scoring
                if (braveData.findings && Array.isArray(braveData.findings) && braveData.findings.length > 0) {
                  const braveFindingsToInsert = braveData.findings.map((f: {
                    provider?: string;
                    kind?: string;
                    severity?: string;
                    confidence?: number;
                    evidence?: Array<{key: string; value: string}>;
                    meta?: Record<string, unknown>;
                  }) => ({
                    scan_id: scanId,
                    workspace_id: scan.workspace_id,
                    provider: f.provider || 'brave_search',
                    kind: f.kind || 'web_index.hit',
                    severity: f.severity || 'info',
                    confidence: normalizeConfidence(f.confidence ?? 0.8),
                    observed_at: new Date().toISOString(),
                    evidence: f.evidence || [],
                    meta: {
                      ...(f.meta || {}),
                      source: 'brave_search_enrichment',
                      corroboration: true,
                    },
                    created_at: new Date().toISOString(),
                  }));
                  
                  const { error: braveInsertError } = await supabase
                    .from('findings')
                    .insert(braveFindingsToInsert);
                  
                  if (braveInsertError) {
                    console.error('[n8n-scan-results] Error inserting Brave findings:', braveInsertError);
                  } else {
                    console.log(`[n8n-scan-results] Inserted ${braveFindingsToInsert.length} Brave web index findings`);
                  }
                }
              } else {
                console.warn(`[n8n-scan-results] Brave Search returned status ${braveResponse.status}`);
              }
            }
          }
        } catch (braveErr) {
          console.error('[n8n-scan-results] Brave enrichment failed (non-fatal):', braveErr);
          // Non-fatal - scan continues without enrichment
        }
      }
    }

    // ====== TELEGRAM SOURCE GUARD ======
    // Telegram callbacks are partial results — store findings but do NOT finalize the scan.
    // The main OSINT workflow (Sherlock → GoSearch → Maigret → WhatsMyName) will call this
    // endpoint again when ALL providers have finished, at which point finalization proceeds.
    const isTelegramCallback = body.source === 'telegram' || body.source === 'telegram-proxy';
    if (isTelegramCallback) {
      console.log(`[n8n-scan-results] Telegram callback for ${scanId} — findings stored, scan NOT finalized`);
      return new Response(JSON.stringify({
        accepted: true,
        finalized: false,
        reason: 'telegram_partial_results',
        findingsStored: findingsToInsert?.length || 0,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
