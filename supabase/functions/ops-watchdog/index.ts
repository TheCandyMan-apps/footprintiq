import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Thresholds ──
const STUCK_SCAN_MINUTES = 15; // scan running > 15 min = stuck (matches cleanup_stuck_scans default)
const MISSING_TRANSITION_MINUTES = 5; // no heartbeat in 5 min after start
const BILLING_DESYNC_MINUTES = 10; // payment succeeded but plan not upgraded within 10 min

interface Alert {
  severity: string;
  type: string;
  message: string;
  dedupe_key: string;
  meta: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const alerts: Alert[] = [];

  try {
    // ═══════════════════════════════════════════════
    // 1. STUCK SCANS — running state with no progress
    // ═══════════════════════════════════════════════
    const stuckCutoff = new Date(Date.now() - STUCK_SCAN_MINUTES * 60 * 1000).toISOString();

    const { data: stuckScans } = await supabase
      .from("scan_health")
      .select("scan_id, state, last_stage, last_heartbeat_at, started_at, workspace_id")
      .in("state", ["running", "pending"])
      .lt("last_heartbeat_at", stuckCutoff);

    if (stuckScans && stuckScans.length > 0) {
      for (const scan of stuckScans) {
        const ageMin = scan.last_heartbeat_at
          ? Math.round((Date.now() - new Date(scan.last_heartbeat_at).getTime()) / 60000)
          : STUCK_SCAN_MINUTES;

        alerts.push({
          severity: ageMin > 30 ? "critical" : "warning",
          type: "stuck_scan",
          message: `Scan ${scan.scan_id.slice(0, 8)}… stuck in "${scan.state}" at stage "${scan.last_stage || "unknown"}" for ${ageMin}m`,
          dedupe_key: `stuck_scan:${scan.scan_id}`,
          meta: {
            scan_id: scan.scan_id,
            state: scan.state,
            last_stage: scan.last_stage,
            age_minutes: ageMin,
            workspace_id: scan.workspace_id,
          },
        });
      }

      console.log(`[ops-watchdog] Found ${stuckScans.length} stuck scan(s)`);

      // Auto-remediate: mark stuck scans as failed/timeout
      const { data: cleaned, error: cleanupErr } = await supabase.rpc("cleanup_stuck_scans", {
        timeout_minutes: STUCK_SCAN_MINUTES,
      });

      if (cleanupErr) {
        console.error("[ops-watchdog] cleanup_stuck_scans error:", cleanupErr.message);
      } else if (cleaned && cleaned.length > 0) {
        console.log(`[ops-watchdog] Auto-remediated ${cleaned.length} stuck scan(s)`);
        for (const s of cleaned) {
          console.log(`  → ${s.cleaned_scan_id}: ${s.old_status} → ${s.new_status}`);
        }
      }
    }

    // ═══════════════════════════════════════════════
    // 2. MISSING STAGE TRANSITIONS
    //    Scans that started but have no heartbeat
    // ═══════════════════════════════════════════════
    const transitionCutoff = new Date(Date.now() - MISSING_TRANSITION_MINUTES * 60 * 1000).toISOString();

    const { data: noTransition } = await supabase
      .from("scan_health")
      .select("scan_id, state, last_stage, started_at, last_heartbeat_at, workspace_id")
      .eq("state", "running")
      .eq("last_stage", "init")
      .lt("started_at", transitionCutoff);

    if (noTransition && noTransition.length > 0) {
      for (const scan of noTransition) {
        alerts.push({
          severity: "warning",
          type: "missing_transition",
          message: `Scan ${scan.scan_id.slice(0, 8)}… stuck at "init" — no worker started after ${MISSING_TRANSITION_MINUTES}m`,
          dedupe_key: `missing_transition:${scan.scan_id}`,
          meta: {
            scan_id: scan.scan_id,
            started_at: scan.started_at,
            workspace_id: scan.workspace_id,
          },
        });
      }

      console.log(`[ops-watchdog] Found ${noTransition.length} scan(s) with missing transitions`);
    }

    // ═══════════════════════════════════════════════
    // 3. BILLING DESYNC — payment succeeded but
    //    plan not upgraded within threshold
    // ═══════════════════════════════════════════════
    const billingCutoff = new Date(Date.now() - BILLING_DESYNC_MINUTES * 60 * 1000).toISOString();
    const billingLookback = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // last 30 min

    // Find recent completed checkout sessions
    const { data: recentCheckouts } = await supabase
      .from("checkout_sessions")
      .select("id, workspace_id, plan, completed_at, user_id")
      .eq("status", "completed")
      .gte("completed_at", billingLookback)
      .lt("completed_at", billingCutoff);

    if (recentCheckouts && recentCheckouts.length > 0) {
      for (const checkout of recentCheckouts) {
        // Check if billing_customers was updated for this workspace
        const { data: billing } = await supabase
          .from("billing_customers")
          .select("plan, status, updated_at")
          .eq("workspace_id", checkout.workspace_id)
          .maybeSingle();

        const expectedPlan = checkout.plan;
        const actualPlan = billing?.plan || "free";
        const billingStatus = billing?.status || "unknown";

        // If plan doesn't match and billing wasn't updated after checkout
        if (
          actualPlan !== expectedPlan &&
          (!billing?.updated_at || new Date(billing.updated_at) < new Date(checkout.completed_at!))
        ) {
          alerts.push({
            severity: "critical",
            type: "billing_desync",
            message: `Payment completed for "${expectedPlan}" but workspace still on "${actualPlan}" (status: ${billingStatus})`,
            dedupe_key: `billing_desync:${checkout.workspace_id}:${checkout.id}`,
            meta: {
              workspace_id: checkout.workspace_id,
              checkout_id: checkout.id,
              expected_plan: expectedPlan,
              actual_plan: actualPlan,
              billing_status: billingStatus,
              completed_at: checkout.completed_at,
            },
          });
        }
      }
    }

    // ═══════════════════════════════════════════════
    // 4. FIRE ALERTS via ops-notify
    // ═══════════════════════════════════════════════
    let sent = 0;
    let deduped = 0;

    for (const alert of alerts) {
      const { data } = await supabase.functions.invoke("ops-notify", {
        body: alert,
      });

      if (data?.deduped) {
        deduped++;
      } else {
        sent++;
      }
    }

    const summary = {
      ok: true,
      checked_at: new Date().toISOString(),
      stuck_scans: stuckScans?.length || 0,
      missing_transitions: noTransition?.length || 0,
      billing_desyncs: recentCheckouts?.filter(() => true).length || 0,
      alerts_total: alerts.length,
      alerts_sent: sent,
      alerts_deduped: deduped,
    };

    console.log("[ops-watchdog] Complete:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ops-watchdog] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
