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

    // Log each stuck scan with full details for visibility in edge function logs
    for (const scan of stuckScans) {
      const ageMinutes = Math.round(
        (Date.now() - new Date(scan.created_at).getTime()) / 60000,
      );
      console.warn(
        `[monitor-stuck-telegram] STUCK SCAN ALERT: scan_id=${scan.id} username=${scan.username} age=${ageMinutes}m workspace=${scan.workspace_id}`,
      );
    }

    console.log(`[monitor-stuck-telegram] Detected ${stuckScans.length} stuck scan(s).`);

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
