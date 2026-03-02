import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Append a scan_event row and upsert scan_health in one call.
 * Uses the service-role client so RLS is bypassed.
 */
export async function writeScanEvent(
  supabase: SupabaseClient,
  event: {
    scan_id: string;
    workspace_id?: string | null;
    user_id?: string | null;
    provider: string;
    stage: string;
    status?: string;
    message?: string;
    duration_ms?: number | null;
    findings_count?: number | null;
    error_message?: string | null;
    metadata?: Record<string, unknown> | null;
  },
) {
  const now = new Date().toISOString();

  // 1. Append scan_event
  const { error: evtErr } = await supabase.from("scan_events").insert({
    scan_id: event.scan_id,
    workspace_id: event.workspace_id ?? null,
    user_id: event.user_id ?? null,
    provider: event.provider,
    stage: event.stage,
    status: event.status ?? null,
    message: event.message ?? null,
    duration_ms: event.duration_ms ?? null,
    findings_count: event.findings_count ?? null,
    error_message: event.error_message ?? null,
    metadata: event.metadata ?? null,
    created_at: now,
  });

  if (evtErr) {
    console.error("[scanHealthWriter] scan_events insert failed:", evtErr);
  }

  // 2. Upsert scan_health
  const healthUpdate: Record<string, unknown> = {
    scan_id: event.scan_id,
    workspace_id: event.workspace_id ?? null,
    user_id: event.user_id ?? null,
    last_stage: event.stage,
    last_heartbeat_at: now,
    updated_at: now,
  };

  // Map stage to state
  if (event.stage === "init" || event.stage === "start") {
    healthUpdate.state = "running";
    healthUpdate.started_at = now;
  } else if (event.stage === "complete" || event.stage === "completed") {
    healthUpdate.state = event.status === "failed" ? "failed" : "completed";
    healthUpdate.completed_at = now;
    if (event.error_message) {
      healthUpdate.error_code = event.status ?? "error";
      healthUpdate.error_detail = event.error_message;
    }
  } else if (event.stage === "error" || event.status === "failed") {
    healthUpdate.state = "failed";
    healthUpdate.completed_at = now;
    healthUpdate.error_code = event.status ?? "error";
    healthUpdate.error_detail = event.error_message ?? event.message ?? null;
  }

  if (event.duration_ms != null) {
    healthUpdate.latency_ms_total = event.duration_ms;
  }

  const { error: healthErr } = await supabase
    .from("scan_health")
    .upsert(healthUpdate, { onConflict: "scan_id" });

  if (healthErr) {
    console.error("[scanHealthWriter] scan_health upsert failed:", healthErr);
  }
}
