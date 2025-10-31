/**
 * Audit Logging
 * 
 * Anonymized audit logs for compliance and debugging.
 * Logs user actions WITHOUT storing PII.
 */

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  userId?: string; // Hashed user ID, not raw email
  sessionId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddressHash?: string;
}

const AUDIT_LOG_KEY = "footprintiq_audit_log";
const MAX_LOG_SIZE = 1000; // Keep last 1000 events in localStorage

/**
 * Log an audit event
 */
export function logAuditEvent(
  eventType: string,
  action: string,
  metadata?: Record<string, unknown>
): void {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    eventType,
    sessionId: getOrCreateSessionId(),
    action,
    metadata,
  };

  const logs = getAuditLogs();
  logs.push(event);

  // Trim to max size
  if (logs.length > MAX_LOG_SIZE) {
    logs.splice(0, logs.length - MAX_LOG_SIZE);
  }

  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

/**
 * Get all audit logs
 */
export function getAuditLogs(): AuditEvent[] {
  const json = sessionStorage.getItem(AUDIT_LOG_KEY);
  if (!json) return [];

  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Get audit logs by event type
 */
export function getAuditLogsByType(eventType: string): AuditEvent[] {
  return getAuditLogs().filter((e) => e.eventType === eventType);
}

/**
 * Get audit logs in time range
 */
export function getAuditLogsByTimeRange(startDate: Date, endDate: Date): AuditEvent[] {
  return getAuditLogs().filter((e) => {
    const ts = new Date(e.timestamp);
    return ts >= startDate && ts <= endDate;
  });
}

/**
 * Clear all audit logs
 */
export function clearAuditLogs(): void {
  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([]));
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogs(): string {
  return JSON.stringify(getAuditLogs(), null, 2);
}

/**
 * Get or create session ID
 */
function getOrCreateSessionId(): string {
  const SESSION_KEY = "footprintiq_session_id";
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Common audit event types
 */
export const AuditEventTypes = {
  SCAN_STARTED: "scan.started",
  SCAN_COMPLETED: "scan.completed",
  SCAN_FAILED: "scan.failed",
  EVIDENCE_DOWNLOADED: "evidence.downloaded",
  WATCHLIST_ADDED: "watchlist.added",
  WATCHLIST_REMOVED: "watchlist.removed",
  PLUGIN_ENABLED: "plugin.enabled",
  PLUGIN_DISABLED: "plugin.disabled",
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  PROFILE_UPDATED: "profile.updated",
  EXPORT_GENERATED: "export.generated",
} as const;
