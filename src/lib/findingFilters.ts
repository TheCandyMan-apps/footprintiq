/**
 * Centralized filter logic for OSINT findings
 * Supports canonical_results, findings, and scan_findings data sources
 * Works with both raw and normalized findings
 */

export interface FilterOptions {
  hideSearch: boolean;
  focusMode: boolean;
}

export interface FilterableItem {
  // Normalized fields (preferred)
  platformName?: string;
  platformUrl?: string;
  pageType?: string;
  sourceProviders?: string[];
  
  // Legacy snake_case variants
  page_type?: string;
  platform_name?: string;
  platform_url?: string;
  primary_url?: string;
  source_providers?: string[];
  providers?: string[];
  
  // Common fields
  tags?: string[];
  confidence?: number;
  severity?: string;
  verdict?: string;
  
  raw?: {
    severity?: string;
    verdict?: string;
    source_providers?: string[];
    page_type?: string;
    primary_url?: string;
    platform_name?: string;
  };
}

/**
 * Check if an item is a search/lookup result
 * Supports both pageType and page_type schemas
 */
export function isSearchResult(item: FilterableItem): boolean {
  const pageType = (
    item.pageType ?? 
    item.page_type ?? 
    (item as any).raw?.page_type ?? 
    (item as any).raw?.pageType ?? 
    ''
  ).toLowerCase();
  
  const tags = item.tags ?? [];
  
  return (
    pageType === 'search' ||
    pageType === 'lookup' ||
    tags.includes('search-result') ||
    tags.includes('lookup')
  );
}

/**
 * Check if a URL is generic/low-signal (homepage, shallow path, non-user paths)
 */
function isGenericUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, '');
    
    // Generic if: homepage or root path
    if (path === '' || path === '/') return true;
    
    // Check for common non-user paths
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1) {
      const lowercaseSegment = segments[0]?.toLowerCase();
      if (['search', 'explore', 'discover', 'about', 'help', 'login', 'signup', 'register'].includes(lowercaseSegment)) {
        return true;
      }
    }
    
    return false;
  } catch {
    return true; // Invalid URL = treat as generic
  }
}

/**
 * Check if item has provider agreement (2+ sources confirmed)
 */
function hasProviderAgreement(item: FilterableItem): boolean {
  const providers = (
    item.sourceProviders ?? 
    item.source_providers ?? 
    item.providers ?? 
    (item as any).raw?.source_providers ?? 
    []
  );
  return Array.isArray(providers) && providers.length >= 2;
}

/**
 * Get platform name with fallbacks
 */
function getPlatformName(item: FilterableItem): string {
  return (
    item.platformName ??
    item.platform_name ??
    (item as any).raw?.platform_name ??
    (item as any).raw?.platformName ??
    ''
  ).toLowerCase();
}

/**
 * Check if an item passes the focus mode filter
 * 
 * FOCUS MODE RULES (in order):
 * 1. Always exclude search/lookup results
 * 2. If verdict exists → include only 'high' or 'medium'
 * 3. If severity is critical/high → include
 * 4. If confidence >= 0.90 → include
 * 5. If multi-provider (2+) AND confidence >= 0.80 → include
 * 6. If platformName is NOT "other" AND confidence >= 0.85 → include
 * 7. If platformName IS "other" AND confidence < 0.90 → exclude (noise)
 * 8. Legacy safety: no verdict, no confidence, no severity → include
 * 9. Default: exclude (info severity with moderate confidence = noise)
 */
function passesFocusModeFilter(item: FilterableItem): boolean {
  // Rule 1: Always exclude search/lookup results
  if (isSearchResult(item)) {
    return false;
  }

  // Rule 2: If verdict exists, use it (future-proof)
  const verdict = (item.verdict ?? (item as any).raw?.verdict ?? '').toLowerCase();
  if (verdict && verdict !== '') {
    return ['high', 'medium'].includes(verdict);
  }

  // Get fields with defensive access
  const confidence = item.confidence;
  const severity = (item.severity ?? (item as any).raw?.severity ?? '').toLowerCase();
  const platformName = getPlatformName(item);
  const url = item.platformUrl ?? item.platform_url ?? item.primary_url ?? (item as any).raw?.primary_url;
  const isOther = platformName === 'other' || platformName === 'unknown' || platformName === '';
  const multiProvider = hasProviderAgreement(item);

  // Rule 3: Always include critical/high severity
  if (severity && ['critical', 'high'].includes(severity)) {
    return true;
  }

  // Rule 4: Very high confidence always passes
  if (confidence !== undefined && confidence !== null && confidence >= 0.90) {
    return true;
  }

  // Rule 5: Multi-provider with good confidence
  if (multiProvider && confidence !== undefined && confidence !== null && confidence >= 0.80) {
    return true;
  }

  // Rule 6: Non-"Other" platform with high-ish confidence
  if (!isOther && confidence !== undefined && confidence !== null && confidence >= 0.85) {
    return true;
  }

  // Rule 7: "Other" platforms need very high confidence
  if (isOther && (confidence === undefined || confidence === null || confidence < 0.90)) {
    return false;
  }

  // Rule 8: Exclude generic URLs
  if (isGenericUrl(url)) {
    return false;
  }

  // Rule 9: Legacy safety - no confidence AND no severity = include
  const hasConfidence = confidence !== undefined && confidence !== null;
  const hasSeverity = severity !== '';
  
  if (!hasConfidence && !hasSeverity) {
    return true; // Don't hide legacy data
  }

  // Rule 10: Default exclude (info severity with moderate confidence = noise)
  return false;
}

/**
 * Filter findings based on hideSearch and focusMode options
 * @param findings Array of findings to filter
 * @param options Filter options
 * @returns Filtered array of findings
 */
export function filterFindings<T extends FilterableItem>(
  findings: T[],
  options: FilterOptions
): T[] {
  return findings.filter(item => {
    // Apply hideSearch filter first
    if (options.hideSearch && isSearchResult(item)) {
      return false;
    }

    // Apply focusMode filter (includes its own search exclusion)
    if (options.focusMode && !passesFocusModeFilter(item)) {
      return false;
    }

    return true;
  });
}

/**
 * Count search results in a findings array
 */
export function countSearchResults<T extends FilterableItem>(findings: T[]): number {
  return findings.filter(isSearchResult).length;
}

/**
 * Get filter statistics
 */
export function getFilterStats<T extends FilterableItem>(
  findings: T[],
  options: FilterOptions
): {
  total: number;
  displayed: number;
  filtered: number;
  searchResultCount: number;
} {
  const displayed = filterFindings(findings, options);
  const searchResultCount = countSearchResults(findings);

  return {
    total: findings.length,
    displayed: displayed.length,
    filtered: findings.length - displayed.length,
    searchResultCount,
  };
}
