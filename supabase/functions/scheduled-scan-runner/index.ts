import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  console.log('[scheduled-scan-runner] Starting scheduled scan check');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find all scheduled scans that need to run
    const { data: scheduledScans, error: fetchError } = await supabase
      .from('scheduled_scans')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())
      .order('next_run_at', { ascending: true })
      .limit(50); // Process max 50 per run

    if (fetchError) {
      console.error('[scheduled-scan-runner] Error fetching scheduled scans:', fetchError);
      return bad(500, fetchError.message);
    }

    if (!scheduledScans || scheduledScans.length === 0) {
      console.log('[scheduled-scan-runner] No scheduled scans to run');
      return ok({ message: 'No scheduled scans to run', processed: 0 });
    }

    console.log(`[scheduled-scan-runner] Found ${scheduledScans.length} scans to run`);

    const results = [];

    for (const schedule of scheduledScans) {
      try {
        console.log(`[scheduled-scan-runner] Running scan for ${schedule.scan_type}:${schedule.target_value}`);

        // Invoke scan-orchestrate function
        const { data: scanResult, error: scanError } = await supabase.functions.invoke('scan-orchestrate', {
          body: {
            type: schedule.scan_type,
            value: schedule.target_value,
            workspaceId: schedule.workspace_id,
            options: schedule.options || {}
          }
        });

        if (scanError) {
          console.error(`[scheduled-scan-runner] Scan failed for schedule ${schedule.id}:`, scanError);
          results.push({ scheduleId: schedule.id, success: false, error: scanError.message });
          continue;
        }

        const scanId = scanResult?.scanId;
        const currentFindings = scanResult?.findings || [];
        
        // Get previous scan findings to detect new findings
        const { data: previousFindings } = await supabase
          .from('scheduled_scan_findings')
          .select('findings_snapshot')
          .eq('scheduled_scan_id', schedule.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const previousFindingsSnapshot = previousFindings?.findings_snapshot || [];
        
        // Compare findings to detect new ones
        const previousFindingIds = new Set(
          (previousFindingsSnapshot as any[]).map((f: any) => `${f.provider}:${f.kind}`)
        );
        
        const newFindings = currentFindings.filter(
          (f: any) => !previousFindingIds.has(`${f.provider}:${f.kind}`)
        );

        // Store findings snapshot
        await supabase.from('scheduled_scan_findings').insert({
          scheduled_scan_id: schedule.id,
          scan_id: scanId,
          findings_count: currentFindings.length,
          new_findings_count: newFindings.length,
          findings_snapshot: currentFindings
        });

        // Calculate next run time
        let nextRunAt: Date;
        const now = new Date();
        
        switch (schedule.frequency) {
          case 'daily':
            nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case 'weekly':
            nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            nextRunAt = new Date(now);
            nextRunAt.setMonth(nextRunAt.getMonth() + 1);
            break;
          default:
            nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }

        // Update scheduled scan
        await supabase
          .from('scheduled_scans')
          .update({
            last_run_at: now.toISOString(),
            last_scan_id: scanId,
            next_run_at: nextRunAt.toISOString()
          })
          .eq('id', schedule.id);

        // Send email notification if new findings detected
        if (schedule.notify_on_new_findings && newFindings.length > 0) {
          console.log(`[scheduled-scan-runner] Sending notification for ${newFindings.length} new findings`);
          
          await supabase.functions.invoke('send-scan-notification', {
            body: {
              userId: schedule.user_id,
              scanId,
              scheduledScanId: schedule.id,
              targetValue: schedule.target_value,
              newFindingsCount: newFindings.length,
              totalFindingsCount: currentFindings.length
            }
          });
        }

        results.push({
          scheduleId: schedule.id,
          success: true,
          scanId,
          newFindings: newFindings.length
        });

        console.log(`[scheduled-scan-runner] Completed scan for schedule ${schedule.id}`);
      } catch (error) {
        console.error(`[scheduled-scan-runner] Error processing schedule ${schedule.id}:`, error);
        results.push({
          scheduleId: schedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`[scheduled-scan-runner] Processed ${results.length} scheduled scans`);

    return ok({
      message: 'Scheduled scans processed',
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('[scheduled-scan-runner] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
