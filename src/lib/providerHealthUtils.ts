/**
 * Utility functions for detecting and filtering provider health/config findings
 * These are internal system status messages, not user OSINT data
 */

/**
 * Patterns that indicate a finding is about provider configuration, not actual OSINT data
 */
const PROVIDER_HEALTH_PATTERNS = [
  'api key not configured',
  'not_configured',
  'provider.unconfigured',
  'tier_restricted',
  'limit_exceeded',
  'provider not available',
  'key missing',
  'configuration required',
  'connect provider',
  'provider health',
  'provider status',
];

/**
 * Provider categories that indicate health/config status rather than findings
 */
const PROVIDER_HEALTH_CATEGORIES = [
  'provider.unconfigured',
  'provider.health',
  'provider.status',
  'provider.error',
  'system.status',
];

/**
 * Status values that indicate provider config issues
 */
const PROVIDER_HEALTH_STATUSES = [
  'not_configured',
  'tier_restricted',
  'limit_exceeded',
  'skipped',
  'disabled',
];

export interface ProviderHealthFinding {
  id: string;
  provider: string;
  status: 'not_configured' | 'tier_restricted' | 'limit_exceeded' | 'error' | 'skipped';
  message?: string;
  raw?: any;
}

/**
 * Detect if a finding represents provider health/config state rather than actual OSINT data
 */
export function isProviderHealthFinding(finding: any): boolean {
  if (!finding) return false;

  // Check providerCategory
  const providerCategory = (finding.providerCategory || finding.kind || '').toLowerCase();
  if (PROVIDER_HEALTH_CATEGORIES.some(cat => providerCategory.includes(cat))) {
    return true;
  }

  // Check status field
  const status = (finding.status || '').toLowerCase();
  if (PROVIDER_HEALTH_STATUSES.includes(status)) {
    return true;
  }

  // Check evidence messages
  const evidence = finding.evidence || [];
  if (Array.isArray(evidence)) {
    for (const e of evidence) {
      const message = (e.message || e.value || '').toString().toLowerCase();
      if (PROVIDER_HEALTH_PATTERNS.some(pattern => message.includes(pattern))) {
        return true;
      }
    }
  }

  // Check meta/metadata for status indicators
  const meta = finding.meta || finding.metadata || {};
  const metaStatus = (meta.status || '').toLowerCase();
  if (PROVIDER_HEALTH_STATUSES.includes(metaStatus)) {
    return true;
  }

  // Check for error messages in meta
  const metaMessage = (meta.message || meta.error || '').toLowerCase();
  if (PROVIDER_HEALTH_PATTERNS.some(pattern => metaMessage.includes(pattern))) {
    return true;
  }

  return false;
}

/**
 * Extract provider health findings from results
 */
export function extractProviderHealthFindings(results: any[]): ProviderHealthFinding[] {
  if (!Array.isArray(results)) return [];

  const healthFindings: ProviderHealthFinding[] = [];

  results.forEach((result) => {
    if (!isProviderHealthFinding(result)) return;

    const provider = result.provider || result.site || result.platformName || 'Unknown';
    const status = normalizeHealthStatus(result.status || result.meta?.status || 'not_configured');
    const message = extractHealthMessage(result);

    healthFindings.push({
      id: result.id || `health-${provider}`,
      provider,
      status,
      message,
      raw: result,
    });
  });

  // Deduplicate by provider
  const seen = new Set<string>();
  return healthFindings.filter((f) => {
    const key = f.provider.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Filter out provider health findings from results (for display in Accounts/Breaches tabs)
 */
export function filterOutProviderHealth<T>(results: T[]): T[] {
  if (!Array.isArray(results)) return [];
  return results.filter((r) => !isProviderHealthFinding(r));
}

/**
 * Normalize health status to a known enum
 */
function normalizeHealthStatus(status: string): ProviderHealthFinding['status'] {
  const s = status.toLowerCase();
  if (s.includes('tier') || s.includes('restricted')) return 'tier_restricted';
  if (s.includes('limit') || s.includes('exceeded')) return 'limit_exceeded';
  if (s.includes('error') || s.includes('failed')) return 'error';
  if (s.includes('skip')) return 'skipped';
  return 'not_configured';
}

/**
 * Extract a human-readable message from health finding
 */
function extractHealthMessage(finding: any): string | undefined {
  // Check evidence array
  const evidence = finding.evidence || [];
  if (Array.isArray(evidence)) {
    for (const e of evidence) {
      if (e.message) return e.message;
      if (typeof e.value === 'string' && e.value.length < 100) return e.value;
    }
  }

  // Check meta
  const meta = finding.meta || finding.metadata || {};
  if (meta.message) return meta.message;
  if (meta.error) return meta.error;

  return undefined;
}
