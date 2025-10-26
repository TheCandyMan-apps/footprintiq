/**
 * Monitoring Queue Manager
 * Handles scheduling and execution of monitoring jobs
 */

import { supabase } from "@/integrations/supabase/client";
import { monitoringConfig } from "@/lib/config";

export interface MonitorJob {
  id: string;
  schedule_id: string;
  user_id: string;
  entity_ids: string[];
  scan_config: any;
  scheduled_for: string;
}

/**
 * Get due monitoring jobs
 */
export async function getDueJobs(): Promise<MonitorJob[]> {
  const now = new Date().toISOString();
  
  const { data: schedules, error } = await supabase
    .from("monitoring_schedules")
    .select("*")
    .eq("is_active", true)
    .lte("next_run", now)
    .limit(monitoringConfig.maxConcurrency);

  if (error) {
    console.error("Error fetching due jobs:", error);
    return [];
  }

  // Convert schedules to jobs
  const jobs: MonitorJob[] = (schedules || []).map(schedule => ({
    id: `job_${schedule.id}_${Date.now()}`,
    schedule_id: schedule.id,
    user_id: schedule.user_id,
    entity_ids: [], // Would be populated from scan_id
    scan_config: {
      scan_id: schedule.scan_id,
      frequency: schedule.frequency,
    },
    scheduled_for: schedule.next_run,
  }));

  return jobs;
}

/**
 * Mark job as started
 */
export async function startJob(scheduleId: string): Promise<string> {
  const { data, error } = await supabase
    .from("monitor_runs")
    .insert({
      schedule_id: scheduleId,
      started_at: new Date().toISOString(),
      status: "running",
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Mark job as completed
 */
export async function completeJob(
  runId: string,
  result: {
    status: "success" | "failed";
    new_findings_count: number;
    diff_hash?: string;
    error_message?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("monitor_runs")
    .update({
      finished_at: new Date().toISOString(),
      status: result.status,
      new_findings_count: result.new_findings_count,
      diff_hash: result.diff_hash,
    })
    .eq("id", runId);

  if (error) throw error;

  // Update schedule's next run time
  if (result.status === "success") {
    const { data: run } = await supabase
      .from("monitor_runs")
      .select("schedule_id, schedules:schedule_id(frequency)")
      .eq("id", runId)
      .single();

    if (run) {
      const schedule = run.schedules as any;
      const nextRun = calculateNextRun(schedule.frequency);
      
      await supabase
        .from("monitoring_schedules")
        .update({
          last_run: new Date().toISOString(),
          next_run: nextRun,
        })
        .eq("id", run.schedule_id);
    }
  }
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRun(frequency: string): string {
  const now = new Date();
  
  switch (frequency) {
    case "hourly":
      now.setHours(now.getHours() + 1);
      break;
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }
  
  return now.toISOString();
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  pending: number;
  running: number;
  failedLast24h: number;
}> {
  const { data: pending } = await supabase
    .from("monitoring_schedules")
    .select("id", { count: "exact" })
    .eq("is_active", true)
    .lte("next_run", new Date().toISOString());

  const { data: running } = await supabase
    .from("monitor_runs")
    .select("id", { count: "exact" })
    .eq("status", "running");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: failed } = await supabase
    .from("monitor_runs")
    .select("id", { count: "exact" })
    .eq("status", "failed")
    .gte("started_at", yesterday.toISOString());

  return {
    pending: pending?.length || 0,
    running: running?.length || 0,
    failedLast24h: failed?.length || 0,
  };
}
