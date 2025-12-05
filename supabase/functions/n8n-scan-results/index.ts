import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role for writing results (n8n doesn't have user context)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { scanId, findings, status, providerResults, error: scanError } = body;

    if (!scanId) {
      return new Response(JSON.stringify({ error: 'scanId is required' }), {
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
      const findingsToInsert = findings.map((finding: Record<string, unknown>) => ({
        scan_id: scanId,
        user_id: scan.user_id,
        workspace_id: scan.workspace_id,
        kind: finding.kind || 'profile_presence',
        title: finding.title || finding.site || 'Unknown',
        description: finding.description || `Profile found on ${finding.site || 'unknown platform'}`,
        severity: finding.severity || 'info',
        confidence: finding.confidence || 0.7,
        evidence: finding.evidence || [],
        meta: {
          ...(finding.meta as Record<string, unknown> || {}),
          provider: finding.provider || (finding.meta as Record<string, unknown>)?.provider || 'unknown',
          url: finding.url || finding.primary_url,
          site: finding.site,
          source: 'n8n',
        },
        url: finding.url || finding.primary_url,
        created_at: new Date().toISOString(),
      }));

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

    // Log provider results for debugging
    if (providerResults) {
      console.log('[n8n-scan-results] Provider results summary:');
      for (const [provider, result] of Object.entries(providerResults as Record<string, Record<string, unknown>>)) {
        console.log(`  ${provider}: ${result.status}, findings: ${result.count || 0}`);
      }

      // Store provider events
      const events = Object.entries(providerResults as Record<string, Record<string, unknown>>).map(([provider, result]) => ({
        scan_id: scanId,
        provider: provider,
        status: result.status || 'unknown',
        duration_ms: result.duration_ms,
        findings_count: result.count || 0,
        error_message: result.error,
        created_at: new Date().toISOString(),
      }));

      const { error: eventsError } = await supabase
        .from('scan_events')
        .insert(events);

      if (eventsError) {
        console.error('[n8n-scan-results] Error inserting scan events:', eventsError);
      }
    }

    // Determine final scan status
    let finalStatus = status || 'completed';
    if (scanError) {
      finalStatus = 'failed';
    } else if (providerResults) {
      const results = Object.values(providerResults as Record<string, Record<string, unknown>>);
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
        error_message: scanError || null,
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
