/**
 * Export Monitoring & Health Tracking
 * Logs export attempts for analytics and troubleshooting
 */

import { supabase } from '@/integrations/supabase/client';

export type ExportType = 'pdf' | 'csv' | 'json';
export type ExportStatus = 'success' | 'failure';

interface ExportAttemptMetadata {
  error?: string;
  findingsCount?: number;
  fileSize?: number;
  template?: string;
  duration?: number;
}

/**
 * Log an export attempt to audit_activity table
 */
export async function logExportAttempt(
  type: ExportType,
  status: ExportStatus,
  metadata: ExportAttemptMetadata = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('[Export Monitoring] No authenticated user, skipping audit log');
      return;
    }

    // Get user's workspace (if exists)
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle();

    const workspaceId = workspaces?.id;

    // Log to audit_activity
    await supabase.from('audit_activity').insert({
      workspace_id: workspaceId,
      user_id: user.id,
      action: `export_${type}_${status}`,
      meta: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    });

    console.log(`[Export Monitoring] Logged ${type} export ${status}`);
  } catch (error) {
    console.error('[Export Monitoring] Failed to log export attempt:', error);
    // Don't throw - monitoring failures shouldn't break exports
  }
}

/**
 * Track export success with duration
 */
export async function trackExportSuccess(
  type: ExportType,
  startTime: number,
  metadata: Omit<ExportAttemptMetadata, 'duration'> = {}
): Promise<void> {
  const duration = Date.now() - startTime;
  await logExportAttempt(type, 'success', { ...metadata, duration });
}

/**
 * Track export failure with error details
 */
export async function trackExportFailure(
  type: ExportType,
  error: Error | string,
  metadata: ExportAttemptMetadata = {}
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  await logExportAttempt(type, 'failure', { ...metadata, error: errorMessage });
}

/**
 * Helper to wrap export functions with monitoring
 */
export async function monitoredExport<T>(
  type: ExportType,
  exportFn: () => Promise<T>,
  metadata?: ExportAttemptMetadata
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await exportFn();
    await trackExportSuccess(type, startTime, metadata);
    return result;
  } catch (error) {
    await trackExportFailure(type, error as Error, metadata);
    throw error;
  }
}
