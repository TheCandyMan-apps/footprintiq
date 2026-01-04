/**
 * Centralized filter logic for OSINT findings
 * Supports canonical_results, findings, and scan_findings data sources
 */

export interface FilterOptions {
  hideSearch: boolean;
  focusMode: boolean;
}

export interface FilterableItem {
  pageType?: string;
  page_type?: string;           // snake_case variant for canonical_results
  tags?: string[];
  confidence?: number;
  severity?: string;
  verdict?: string;
  primary_url?: string;         // For URL analysis
  platform_url?: string;        // Legacy variant
  source_providers?: string[];  // Multi-provider detection
  providers?: string[];         // Legacy variant
  raw?: {
    severity?: string;
    verdict?: string;
    source_providers?: string[];
    page_type?: string;
    primary_url?: string;
  };
}

/**
 * Check if an item is a search/lookup result
 * Supports both pageType and page_type schemas
 */
function isSearchResult(item: FilterableItem): boolean {
  const pageType = item.pageType ?? item.page_type ?? (item as any).raw?.page_type;
  return pageType === 'search' || item.tags?.includes('search-result') || false;
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
  const providers = item.source_providers ?? item.providers ?? (item as any).raw?.source_providers ?? [];
  return Array.isArray(providers) && providers.length >= 2;
}

/**
 * Check if an item passes the focus mode filter
 * 
 * NEW STRICTER RULES:
 * 1. Always exclude search/lookup results
 * 2. If verdict exists → include only 'high' or 'medium' (future-proof)
 * 3. Always include critical/high/medium severity (important findings)
 * 4. Exclude generic/low-signal URLs
 * 5. Include if confidence >= 0.90 OR has 2+ provider agreement
 * 6. Legacy safety: no verdict, no confidence, no severity → include
 * 7. Default: exclude (info severity with moderate confidence = noise)
 */
function passesFocusModeFilter(item: FilterableItem): boolean {
  // Rule 1: Always exclude search/lookup results
  if (isSearchResult(item)) {
    return false;
  }

  // Rule 2: If verdict exists, use it (future-proof)
  const verdict = item.verdict ?? item.raw?.verdict;
  if (verdict !== undefined && verdict !== null && verdict !== '') {
    return ['high', 'medium'].includes(verdict.toLowerCase());
  }

  // Get fields with defensive access
  const confidence = item.confidence;
  const severity = (item.severity ?? item.raw?.severity)?.toLowerCase();
  const url = item.primary_url ?? item.platform_url ?? (item as any).raw?.primary_url;

  // Rule 3: Always include critical/high/medium severity
  if (severity && ['critical', 'high', 'medium'].includes(severity)) {
    return true;
  }

  // Rule 4: Exclude generic/low-signal URLs
  if (isGenericUrl(url)) {
    return false;
  }

  // Rule 5: Include if strong signals exist
  const hasStrongConfidence = confidence !== undefined && confidence >= 0.90;
  const hasMultiProvider = hasProviderAgreement(item);
  
  if (hasStrongConfidence || hasMultiProvider) {
    return true;
  }

  // Rule 6: Legacy safety - no confidence AND no severity = include
  const hasConfidence = confidence !== undefined && confidence !== null;
  const hasSeverity = severity !== undefined && severity !== '';
  
  if (!hasConfidence && !hasSeverity) {
    return true; // Don't hide legacy data
  }

  // Rule 7: Default exclude (info severity with moderate confidence = noise)
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
