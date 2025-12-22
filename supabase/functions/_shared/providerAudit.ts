/**
 * Provider Audit Logging Utility
 * Provides consistent logging for provider execution (start, complete, failed, skipped, timeout)
 * to the scan_events table for debugging and transparency.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export type ProviderStage = 'started' | 'complete' | 'failed' | 'skipped' | 'timeout' | 'validation' | 'scan_summary';
export type ProviderAuditStatus = 'success' | 'failed' | 'running' | 'skipped' | 'timeout' | 'not_configured' | 'tier_restricted' | 'limit_exceeded' | 'disabled';

export interface ProviderAuditEvent {
  scanId: string;
  provider: string;
  stage: ProviderStage;
  status: ProviderAuditStatus;
  durationMs?: number;
  findingsCount?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface ScanSummaryData {
  totalProviders: number;
  successfulProviders: number;
  failedProviders: number;
  skippedProviders: number;
  totalDurationMs: number;
  totalFindings: number;
  providerBreakdown?: Record<string, {
    status: string;
    durationMs: number;
    findingsCount: number;
  }>;
}

/**
 * Log a provider execution event to scan_events table
 */
export async function logProviderExecution(
  supabase: SupabaseClient,
  event: ProviderAuditEvent
): Promise<void> {
  try {
    const payload: Record<string, unknown> = {
      scan_id: event.scanId,
      provider: event.provider,
      stage: event.stage,
      status: event.status,
      created_at: new Date().toISOString(),
    };

    if (event.durationMs !== undefined) {
      payload.duration_ms = event.durationMs;
    }

    if (event.findingsCount !== undefined) {
      payload.findings_count = event.findingsCount;
    }

    if (event.errorMessage) {
      payload.error_message = event.errorMessage;
    }

    if (event.metadata) {
      payload.metadata = event.metadata;
    }

    await supabase.from('scan_events').insert(payload);
    
    console.log(`[providerAudit] ${event.provider}:${event.stage}:${event.status}${event.durationMs ? ` (${event.durationMs}ms)` : ''}${event.findingsCount !== undefined ? ` [${event.findingsCount} findings]` : ''}`);
  } catch (error) {
    console.error(`[providerAudit] Failed to log event for ${event.provider}:`, error);
  }
}

/**
 * Log provider execution start
 */
export async function logProviderStart(
  supabase: SupabaseClient,
  scanId: string,
  provider: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  const startTime = Date.now();
  
  await logProviderExecution(supabase, {
    scanId,
    provider,
    stage: 'started',
    status: 'running',
    metadata,
  });
  
  return startTime;
}

/**
 * Log provider execution completion (success)
 */
export async function logProviderComplete(
  supabase: SupabaseClient,
  scanId: string,
  provider: string,
  startTime: number,
  findingsCount: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const durationMs = Date.now() - startTime;
  
  await logProviderExecution(supabase, {
    scanId,
    provider,
    stage: 'complete',
    status: 'success',
    durationMs,
    findingsCount,
    metadata,
  });
}

/**
 * Log provider execution failure
 */
export async function logProviderFailed(
  supabase: SupabaseClient,
  scanId: string,
  provider: string,
  startTime: number,
  errorMessage: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const durationMs = Date.now() - startTime;
  
  await logProviderExecution(supabase, {
    scanId,
    provider,
    stage: 'failed',
    status: 'failed',
    durationMs,
    findingsCount: 0,
    errorMessage,
    metadata,
  });
}

/**
 * Log provider skipped (not configured, tier restricted, etc.)
 */
export async function logProviderSkipped(
  supabase: SupabaseClient,
  scanId: string,
  provider: string,
  reason: 'not_configured' | 'tier_restricted' | 'limit_exceeded' | 'disabled' | 'skipped',
  message: string
): Promise<void> {
  await logProviderExecution(supabase, {
    scanId,
    provider,
    stage: 'skipped',
    status: reason,
    durationMs: 0,
    findingsCount: 0,
    errorMessage: message,
  });
}

/**
 * Log provider timeout
 */
export async function logProviderTimeout(
  supabase: SupabaseClient,
  scanId: string,
  provider: string,
  startTime: number,
  timeoutMs: number
): Promise<void> {
  const durationMs = Date.now() - startTime;
  
  await logProviderExecution(supabase, {
    scanId,
    provider,
    stage: 'timeout',
    status: 'timeout',
    durationMs,
    findingsCount: 0,
    errorMessage: `Provider timed out after ${timeoutMs}ms`,
  });
}

/**
 * Log scan summary event (aggregated stats)
 */
export async function logScanSummary(
  supabase: SupabaseClient,
  scanId: string,
  summary: ScanSummaryData
): Promise<void> {
  await logProviderExecution(supabase, {
    scanId,
    provider: 'orchestrator',
    stage: 'scan_summary',
    status: summary.failedProviders > 0 ? 'failed' : 'success',
    durationMs: summary.totalDurationMs,
    findingsCount: summary.totalFindings,
    metadata: {
      total_providers: summary.totalProviders,
      successful_providers: summary.successfulProviders,
      failed_providers: summary.failedProviders,
      skipped_providers: summary.skippedProviders,
      provider_breakdown: summary.providerBreakdown,
    },
  });
}
