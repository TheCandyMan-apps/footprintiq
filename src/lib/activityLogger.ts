import { supabase } from "@/integrations/supabase/client";

/**
 * Centralized activity logging utility
 * Logs user actions to the activity_logs table for audit and analytics
 */

export type ActivityAction = 
  | "scan.started"
  | "scan.completed"
  | "scan.failed"
  | "scan.cancelled"
  | "case.created"
  | "case.updated"
  | "case.deleted"
  | "monitoring.created"
  | "monitoring.updated"
  | "monitoring.deleted"
  | "export.pdf"
  | "export.csv"
  | "export.json"
  | "graph.viewed"
  | "graph.expanded"
  | "analytics.viewed"
  | "settings.updated"
  | "api_key.created"
  | "api_key.revoked"
  | "workflow.created"
  | "workflow.executed"
  | "referral.created"
  | "user.login"
  | "user.logout";

export type EntityType =
  | "scan"
  | "case"
  | "monitor"
  | "graph"
  | "export"
  | "analytics"
  | "settings"
  | "api_key"
  | "workflow"
  | "referral"
  | "user";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an activity to the database
 */
export async function logActivity({
  action,
  entityType,
  entityId,
  organizationId,
  metadata,
  ipAddress,
  userAgent,
}: LogActivityParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("Cannot log activity: No authenticated user");
      return;
    }

    // Get IP and user agent if not provided
    const finalIpAddress = ipAddress || await getClientIP();
    const finalUserAgent = userAgent || navigator.userAgent;

    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      organization_id: organizationId,
      metadata: metadata || {},
      ip_address: finalIpAddress,
      user_agent: finalUserAgent,
    });

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Error in logActivity:", err);
  }
}

/**
 * Gets the client's IP address (best effort)
 */
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
}

/**
 * Convenience functions for common activities
 */

export const ActivityLogger = {
  scanStarted: (scanId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "scan.started",
      entityType: "scan",
      entityId: scanId,
      metadata,
    }),

  scanCompleted: (scanId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "scan.completed",
      entityType: "scan",
      entityId: scanId,
      metadata,
    }),

  scanFailed: (scanId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "scan.failed",
      entityType: "scan",
      entityId: scanId,
      metadata,
    }),

  caseCreated: (caseId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "case.created",
      entityType: "case",
      entityId: caseId,
      metadata,
    }),

  caseUpdated: (caseId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "case.updated",
      entityType: "case",
      entityId: caseId,
      metadata,
    }),

  exportGenerated: (format: "pdf" | "csv" | "json", entityId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: `export.${format}` as ActivityAction,
      entityType: "export",
      entityId,
      metadata,
    }),

  graphViewed: (metadata?: Record<string, any>) =>
    logActivity({
      action: "graph.viewed",
      entityType: "graph",
      metadata,
    }),

  analyticsViewed: (metadata?: Record<string, any>) =>
    logActivity({
      action: "analytics.viewed",
      entityType: "analytics",
      metadata,
    }),

  apiKeyCreated: (keyId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "api_key.created",
      entityType: "api_key",
      entityId: keyId,
      metadata,
    }),

  workflowExecuted: (workflowId: string, metadata?: Record<string, any>) =>
    logActivity({
      action: "workflow.executed",
      entityType: "workflow",
      entityId: workflowId,
      metadata,
    }),
};
