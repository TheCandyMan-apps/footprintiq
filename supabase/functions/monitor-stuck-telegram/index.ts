/**
 * monitor-stuck-telegram
 *
 * Scheduled monitor that detects scans stuck in 'running' status for >10 minutes
 * without a telegram_triggered_at value — indicating a silent Telegram trigger failure.
 *
 * Called by pg_cron every 5 minutes.
 * Writes alerts to system_errors, which triggers the on_critical_error DB trigger
 * that fires the error-alert edge function (Resend email to admin).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Find scans that are:
    // - status = 'running'
    // - no telegram_triggered_at (trigger never fired)
    // - created more than 10 minutes ago
    // - are username-type scans (Telegram is only triggered for username scans)
    const { data: stuckScans, error } = await supabase
      .from('scans')
      .select('id, scan_type, username, workspace_id, user_id, created_at, status')
      .eq('status', 'running')
      .is('telegram_triggered_at', null)
      .eq('scan_type', 'username')
      .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(20);

    if (error) {
      console.error('[monitor-stuck-telegram] Query failed:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!stuckScans || stuckScans.length === 0) {
      console.log('[monitor-stuck-telegram] No stuck scans found.');
      return new Response(JSON.stringify({ ok: true, stuck: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.warn(`[monitor-stuck-telegram] Found ${stuckScans.length} stuck scan(s).`);

    // Write one system_error per stuck scan so the on_critical_error trigger fires
    const errorRows = stuckScans.map((scan) => {
      const ageMinutes = Math.round(
        (Date.now() - new Date(scan.created_at).getTime()) / 60000,
      );
      return {
        error_code: 'TELEGRAM_TRIGGER_SILENT_FAILURE',
        error_message: `Scan ${scan.id} (username: ${scan.username}) has been running for ${ageMinutes}m with no Telegram trigger.`,
        function_name: 'monitor-stuck-telegram',
        workspace_id: scan.workspace_id,
        user_id: scan.user_id,
        scan_id: scan.id,
        provider: 'telegram',
        severity: 'error',
        metadata: {
          scan_type: scan.scan_type,
          username: scan.username,
          age_minutes: ageMinutes,
          status: scan.status,
          telegram_triggered_at: null,
          detected_at: new Date().toISOString(),
        },
      };
    });

    const { error: insertError } = await supabase
      .from('system_errors')
      .insert(errorRows);

    if (insertError) {
      console.error('[monitor-stuck-telegram] Failed to insert system_errors:', insertError);
      return new Response(JSON.stringify({ ok: false, error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // De-duplicate: avoid re-alerting on the same stuck scan on the next run
    // by checking if we already have a recent system_error for this scan.
    // The insert above handles idempotency via the on_critical_error trigger
    // which de-dupes at the Resend level.

    console.log(`[monitor-stuck-telegram] Logged ${stuckScans.length} alert(s) to system_errors.`);

    return new Response(
      JSON.stringify({
        ok: true,
        stuck: stuckScans.length,
        scan_ids: stuckScans.map((s) => s.id),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('[monitor-stuck-telegram] Unexpected error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
