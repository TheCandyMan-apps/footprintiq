/**
 * Monitoring Worker
 * Executes scheduled scans and processes diffs
 */

import { supabase } from "@/integrations/supabase/client";
import { Finding } from "@/lib/ufm";
import { compareFindings, shouldAlert, DiffThresholds } from "./diff";
import { startJob, completeJob } from "./queue";

export interface WorkerResult {
  runId: string;
  status: "success" | "failed";
  newFindingsCount: number;
  diff?: any;
  alertSent: boolean;
  error?: string;
}

/**
 * Execute a monitoring run
 */
export async function executeMonitorRun(
  scheduleId: string,
  userId: string,
  scanId: string
): Promise<WorkerResult> {
  let runId: string | null = null;

  try {
    // Start the run
    runId = await startJob(scheduleId);

    // Get previous scan results
    const { data: previousSources } = await supabase
      .from("data_sources")
      .select("*")
      .eq("scan_id", scanId);

    // Trigger new scan via edge function
    // In production, this would call osint-scan with same parameters
    // For now, we'll compare with the most recent scan
    const { data: recentScans } = await supabase
      .from("scans")
      .select("id")
      .eq("user_id", userId)
      .neq("id", scanId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!recentScans || recentScans.length === 0) {
      throw new Error("No recent scan found for comparison");
    }

    const latestScanId = recentScans[0].id;

    // Get current scan results
    const { data: currentSources } = await supabase
      .from("data_sources")
      .select("*")
      .eq("scan_id", latestScanId);

    // Convert sources to findings format
    const prevFindings: Finding[] = (previousSources || []).map(sourceToFinding);
    const currFindings: Finding[] = (currentSources || []).map(sourceToFinding);

    // Calculate diff
    const diff = compareFindings(prevFindings, currFindings);

    // Check alert thresholds
    const thresholds: DiffThresholds = {
      highSeverityThreshold: true,
      newProviderThreshold: 3,
      riskScoreChangeThreshold: 10,
      darkWebScoreThreshold: 60,
    };

    const alertDecision = shouldAlert(diff, thresholds);

    // Send alert if needed
    let alertSent = false;
    if (alertDecision.shouldAlert) {
      alertSent = await sendMonitoringAlert(
        scheduleId,
        userId,
        runId,
        diff,
        alertDecision.reasons
      );
    }

    // Complete the run
    await completeJob(runId, {
      status: "success",
      new_findings_count: diff.summary.totalNew,
      diff_hash: hashDiff(diff),
    });

    return {
      runId,
      status: "success",
      newFindingsCount: diff.summary.totalNew,
      diff,
      alertSent,
    };
  } catch (error: any) {
    console.error("Monitor run failed:", error);

    if (runId) {
      await completeJob(runId, {
        status: "failed",
        new_findings_count: 0,
        error_message: error.message,
      });
    }

    return {
      runId: runId || "",
      status: "failed",
      newFindingsCount: 0,
      alertSent: false,
      error: error.message,
    };
  }
}

/**
 * Send monitoring alert
 */
async function sendMonitoringAlert(
  scheduleId: string,
  userId: string,
  runId: string,
  diff: any,
  reasons: string[]
): Promise<boolean> {
  // Get schedule details
  const { data: schedule } = await supabase
    .from("monitoring_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (!schedule || !schedule.notification_enabled) {
    return false;
  }

  // Create alert record
  const { error: alertError } = await supabase
    .from("monitoring_alerts")
    .insert({
      user_id: userId,
      schedule_id: scheduleId,
      alert_type: "new_findings",
      severity: determineSeverity(diff),
      title: `Monitoring Alert: ${reasons[0]}`,
      description: reasons.join("; "),
      metadata: { diff, run_id: runId },
    });

  if (alertError) {
    console.error("Error creating alert:", alertError);
    return false;
  }

  // Send email if configured
  if (schedule.notification_email) {
    try {
      await supabase.functions.invoke("send-monitoring-alert", {
        body: {
          email: schedule.notification_email,
          reasons,
          diff,
          scheduleId,
        },
      });
      return true;
    } catch (emailError) {
      console.error("Error sending email alert:", emailError);
      return false;
    }
  }

  return true;
}

/**
 * Convert data source to finding format
 */
function sourceToFinding(source: any): Finding {
  return {
    id: source.id,
    type: "identity" as const,
    title: source.name,
    description: `Data found on ${source.name}`,
    severity: source.risk_level as any,
    confidence: 0.8,
    provider: source.name,
    providerCategory: source.category,
    evidence: [],
    impact: "",
    remediation: [],
    tags: [],
    observedAt: source.first_seen,
  };
}

/**
 * Determine alert severity from diff
 */
function determineSeverity(diff: any): string {
  if (diff.summary.totalNew === 0) return "low";
  
  const hasHighSeverity = diff.newFindings.some(
    (f: Finding) => f.severity === "critical" || f.severity === "high"
  );
  
  if (hasHighSeverity) return "high";
  if (diff.summary.totalNew >= 5) return "medium";
  return "low";
}

/**
 * Generate hash for diff comparison
 */
function hashDiff(diff: any): string {
  const str = JSON.stringify({
    new: diff.summary.totalNew,
    removed: diff.summary.totalRemoved,
    changed: diff.summary.totalChanged,
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
