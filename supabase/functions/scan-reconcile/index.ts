/**
 * Scan Reconcile Job
 * 
 * Purpose: Cleanup stuck scans and mark them appropriately
 * Runs: Every 10 minutes via cron
 * 
 * Logic:
 * - Find scans status='running' older than 15 minutes
 * - If partial results exist → mark complete_partial
 * - If no results → mark failed_timeout
 * - Write audit_activity + scan_events final markers
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STUCK_THRESHOLD_MINUTES = 15;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[scan-reconcile] Starting scan reconciliation');

    // Find stuck scans (running for > 15 minutes)
    const stuckThreshold = new Date();
    stuckThreshold.setMinutes(stuckThreshold.getMinutes() - STUCK_THRESHOLD_MINUTES);

    const { data: stuckScans, error: scanError } = await supabase
      .from('scans')
      .select('id, workspace_id, scan_type, status, created_at, username, email, phone')
      .in('status', ['pending', 'running'])
      .lt('created_at', stuckThreshold.toISOString())
      .order('created_at', { ascending: true })
      .limit(100);

    if (scanError) {
      console.error('[scan-reconcile] Error fetching stuck scans:', scanError);
      throw scanError;
    }

    console.log(`[scan-reconcile] Found ${stuckScans?.length || 0} stuck scans`);

    if (!stuckScans || stuckScans.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reconciled: 0,
          message: 'No stuck scans found',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reconciledScans: Array<{
      scan_id: string;
      old_status: string;
      new_status: string;
      had_results: boolean;
    }> = [];

    // Process each stuck scan
    for (const scan of stuckScans) {
      try {
        console.log(`[scan-reconcile] Processing scan ${scan.id} (age: ${Math.round((Date.now() - new Date(scan.created_at).getTime()) / 60000)} min)`);

        // Check if scan has any results/findings
        const { data: findings, error: findingsError } = await supabase
          .from('findings')
          .select('id')
          .eq('scan_id', scan.id)
          .limit(1);

        if (findingsError) {
          console.error(`[scan-reconcile] Error checking findings for scan ${scan.id}:`, findingsError);
          continue;
        }

        const hasResults = findings && findings.length > 0;
        const newStatus = hasResults ? 'complete_partial' : 'failed_timeout';

        console.log(`[scan-reconcile] Scan ${scan.id}: ${hasResults ? 'HAS' : 'NO'} results → ${newStatus}`);

        // Update scan status
        const { error: updateError } = await supabase
          .from('scans')
          .update({
            status: newStatus,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scan.id);

        if (updateError) {
          console.error(`[scan-reconcile] Error updating scan ${scan.id}:`, updateError);
          continue;
        }

        // Write final scan_event marker
        await supabase.from('scan_events').insert({
          scan_id: scan.id,
          provider: 'system',
          stage: 'reconciled',
          status: newStatus,
          duration_ms: Math.round(Date.now() - new Date(scan.created_at).getTime()),
          error_message: hasResults
            ? 'Scan marked as partially complete after timeout'
            : 'Scan timed out with no results',
        });

        // Write audit activity
        await supabase.from('audit_activity').insert({
          workspace_id: scan.workspace_id,
          action: 'scan_reconciled',
          meta: {
            scan_id: scan.id,
            old_status: 'running',
            new_status: newStatus,
            had_results: hasResults,
            reconciled_at: new Date().toISOString(),
            age_minutes: Math.round((Date.now() - new Date(scan.created_at).getTime()) / 60000),
          },
        });

        reconciledScans.push({
          scan_id: scan.id,
          old_status: 'running',
          new_status: newStatus,
          had_results: hasResults,
        });

        console.log(`[scan-reconcile] Successfully reconciled scan ${scan.id}`);
      } catch (error) {
        console.error(`[scan-reconcile] Error processing scan ${scan.id}:`, error);
        // Continue with next scan
      }
    }

    console.log(`[scan-reconcile] Reconciled ${reconciledScans.length}/${stuckScans.length} scans`);

    // Clear stuck gosearch_pending flags (scans older than 10 minutes)
    const goSearchThreshold = new Date();
    goSearchThreshold.setMinutes(goSearchThreshold.getMinutes() - 10);

    const { data: stuckGoSearch, error: goSearchError } = await supabase
      .from('scans')
      .select('id')
      .eq('gosearch_pending', true)
      .lt('created_at', goSearchThreshold.toISOString())
      .limit(50);

    let clearedGoSearch = 0;
    if (!goSearchError && stuckGoSearch && stuckGoSearch.length > 0) {
      const { error: clearError } = await supabase
        .from('scans')
        .update({ gosearch_pending: false })
        .in('id', stuckGoSearch.map(s => s.id));

      if (clearError) {
        console.error('[scan-reconcile] Error clearing stuck gosearch_pending:', clearError);
      } else {
        clearedGoSearch = stuckGoSearch.length;
        console.log(`[scan-reconcile] ✅ Cleared gosearch_pending for ${clearedGoSearch} stuck scans`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reconciled: reconciledScans.length,
        total_stuck: stuckScans.length,
        cleared_gosearch: clearedGoSearch,
        scans: reconciledScans,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[scan-reconcile] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
