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
  tags?: string[];
  confidence?: number;
  severity?: string;
  verdict?: string;
  raw?: {
    severity?: string;
    verdict?: string;
  };
}

/**
 * Check if an item is a search/lookup result
 */
function isSearchResult(item: FilterableItem): boolean {
  return item.pageType === 'search' || item.tags?.includes('search-result') || false;
}

/**
 * Check if an item passes the focus mode filter
 * Rules:
 * 1. Always exclude search results
 * 2. If verdict exists → include only 'high' or 'medium'
 * 3. Else if confidence OR severity exists → include if confidence >= 0.65 OR severity in ['critical', 'high', 'medium']
 * 4. Else (legacy item with no verdict/confidence/severity) → INCLUDE (don't hide legacy data)
 */
function passesFocusModeFilter(item: FilterableItem): boolean {
  // Always exclude search results in focus mode
  if (isSearchResult(item)) {
    return false;
  }

  // Check for verdict field (future-proof)
  const verdict = item.verdict ?? item.raw?.verdict;
  if (verdict !== undefined && verdict !== null) {
    return ['high', 'medium'].includes(verdict.toLowerCase());
  }

  // Get confidence and severity
  const confidence = item.confidence;
  const severity = item.severity ?? item.raw?.severity;

  const hasConfidence = confidence !== undefined && confidence !== null;
  const hasSeverity = severity !== undefined && severity !== null && severity !== '';

  // If we have confidence OR severity fields, apply the threshold check
  if (hasConfidence || hasSeverity) {
    const meetsConfidence = hasConfidence && confidence >= 0.65;
    const meetsSeverity = hasSeverity && ['critical', 'high', 'medium'].includes(severity.toLowerCase());
    return meetsConfidence || meetsSeverity;
  }

  // Legacy item with no verdict/confidence/severity → INCLUDE (don't exclude legacy data)
  return true;
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
