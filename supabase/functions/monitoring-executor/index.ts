import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[monitoring-executor] Processing monitoring schedules');

    // Get due monitoring schedules
    const now = new Date();
    const { data: schedules, error: schedulesError } = await supabase
      .from('monitoring_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now.toISOString())
      .limit(50);

    if (schedulesError) throw schedulesError;

    console.log(`[monitoring-executor] Found ${schedules?.length || 0} due schedules`);

    let executed = 0;
    let failed = 0;

    for (const schedule of schedules || []) {
      try {
        // Create a monitoring run record
        const { data: run, error: runError } = await supabase
          .from('monitoring_runs')
          .insert({
            schedule_id: schedule.id,
            status: 'running',
          })
          .select()
          .single();

        if (runError) throw runError;

        // Execute the scan
        const { data: newScan, error: scanError } = await supabase
          .from('scans')
          .insert({
            user_id: schedule.user_id,
            ...schedule.scan_config,
            status: 'pending',
          })
          .select()
          .single();

        if (scanError) throw scanError;

        // Trigger the scan orchestration
        await supabase.functions.invoke('scan-orchestrate', {
          body: { scanId: newScan.id },
        });

        // Compare with previous scan if available
        if (schedule.last_scan_id) {
          const { data: comparison, error: compareError } = await supabase.functions.invoke(
            'fusion-compare',
            {
              body: {
                scanId1: schedule.last_scan_id,
                scanId2: newScan.id,
              },
            }
          );

          if (!compareError && comparison?.hasChanges) {
            // Send alert
            await supabase.functions.invoke('send-monitoring-alert', {
              body: {
                scheduleId: schedule.id,
                userId: schedule.user_id,
                changes: comparison.changes,
              },
            });
          }
        }

        // Update monitoring run
        await supabase
          .from('monitoring_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            new_findings_count: 0, // Would be calculated from comparison
          })
          .eq('id', run.id);

        // Update schedule
        const nextRun = calculateNextRun(schedule.frequency);
        await supabase
          .from('monitoring_schedules')
          .update({
            last_run: now.toISOString(),
            next_run: nextRun.toISOString(),
            last_scan_id: newScan.id,
          })
          .eq('id', schedule.id);

        executed++;
        console.log(`[monitoring-executor] Executed schedule ${schedule.id}`);

      } catch (error) {
        console.error(`[monitoring-executor] Failed schedule ${schedule.id}:`, error);
        failed++;

        // Mark run as failed
        await supabase
          .from('monitoring_runs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('schedule_id', schedule.id)
          .eq('status', 'running');
      }
    }

    console.log(`[monitoring-executor] Completed: ${executed} executed, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        executed,
        failed,
        message: 'Monitoring execution completed',
      }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[monitoring-executor] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function calculateNextRun(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
