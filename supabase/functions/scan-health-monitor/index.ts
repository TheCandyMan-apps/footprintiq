import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Scan Health Monitor - Automated reconciliation service
 * Runs hourly to detect and fix scans stuck in pending state
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('[scan-health-monitor] Starting health check...');

    // Find scans that are pending in scans table but completed in scan_progress
    const { data: mismatchedScans, error: queryError } = await supabase
      .from('scans')
      .select('id, workspace_id, user_id, created_at')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Older than 1 hour
      .limit(50);

    if (queryError) {
      console.error('[scan-health-monitor] Query error:', queryError);
      throw queryError;
    }

    if (!mismatchedScans || mismatchedScans.length === 0) {
      console.log('[scan-health-monitor] No stuck scans found');
      return new Response(
        JSON.stringify({ 
          message: 'Health check complete',
          repairedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-health-monitor] Found ${mismatchedScans.length} potentially stuck scans`);
    let repairedCount = 0;
    const errors: string[] = [];

    for (const scan of mismatchedScans) {
      try {
        // Check if scan_progress shows completion
        const { data: progressData } = await supabase
          .from('scan_progress')
          .select('status, completed_at')
          .eq('scan_id', scan.id)
          .maybeSingle();

        if (progressData?.status === 'completed') {
          // Get findings for this scan
          const { data: findings } = await supabase
            .from('findings')
            .select('provider, severity')
            .eq('scan_id', scan.id)
            .neq('kind', 'provider_error');

          const findingsCount = findings?.length || 0;
          const highRisk = findings?.filter(f => f.severity === 'high').length || 0;
          const mediumRisk = findings?.filter(f => f.severity === 'medium').length || 0;
          const lowRisk = findings?.filter(f => f.severity === 'low').length || 0;
          const privacyScore = Math.max(0, Math.min(100, 100 - (highRisk * 10 + mediumRisk * 5 + lowRisk * 2)));

          // Calculate provider counts
          const providerCounts: Record<string, number> = {};
          findings?.forEach(f => {
            providerCounts[f.provider] = (providerCounts[f.provider] || 0) + 1;
          });

          // Reconcile scan status
          const { error: updateError } = await supabase
            .from('scans')
            .update({
              status: 'completed',
              completed_at: progressData.completed_at || new Date().toISOString(),
              high_risk_count: highRisk,
              medium_risk_count: mediumRisk,
              low_risk_count: lowRisk,
              privacy_score: privacyScore,
              total_sources_found: findingsCount,
              provider_counts: providerCounts,
              updated_at: new Date().toISOString()
            })
            .eq('id', scan.id);

          if (updateError) {
            console.error(`[scan-health-monitor] Failed to repair scan ${scan.id}:`, updateError);
            errors.push(`${scan.id}: ${updateError.message}`);
          } else {
            console.log(`[scan-health-monitor] Repaired scan ${scan.id} with ${findingsCount} findings`);
            repairedCount++;

            // Log to system_errors for tracking
            await supabase.from('system_errors').insert({
              error_code: 'SCAN_AUTO_RECONCILED',
              error_message: `Auto-repaired stuck scan with ${findingsCount} findings`,
              function_name: 'scan-health-monitor',
              scan_id: scan.id,
              workspace_id: scan.workspace_id,
              user_id: scan.user_id,
              severity: 'info',
              metadata: { findingsCount, providerCounts }
            });
          }
        } else if (Date.now() - new Date(scan.created_at).getTime() > 2 * 60 * 60 * 1000) {
          // If scan is older than 2 hours and not completed, mark as error
          await supabase
            .from('scans')
            .update({
              status: 'error',
              completed_at: new Date().toISOString(),
              error_message: 'Scan timed out (health monitor)',
              updated_at: new Date().toISOString()
            })
            .eq('id', scan.id);

          console.log(`[scan-health-monitor] Marked scan ${scan.id} as error (timeout)`);
          repairedCount++;

          await supabase.from('system_errors').insert({
            error_code: 'SCAN_TIMEOUT',
            error_message: 'Scan exceeded 2 hour timeout',
            function_name: 'scan-health-monitor',
            scan_id: scan.id,
            workspace_id: scan.workspace_id,
            user_id: scan.user_id,
            severity: 'warn'
          });
        }
      } catch (scanError) {
        console.error(`[scan-health-monitor] Error processing scan ${scan.id}:`, scanError);
        errors.push(`${scan.id}: ${scanError instanceof Error ? scanError.message : 'Unknown error'}`);
      }
    }

    console.log(`[scan-health-monitor] Health check complete. Repaired: ${repairedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        message: 'Health check complete',
        repairedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[scan-health-monitor] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});