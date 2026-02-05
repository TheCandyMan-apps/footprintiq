/**
 * Centralized filter logic for OSINT findings
 * Supports canonical_results, findings, and scan_findings data sources
 * Works with both raw and normalized findings
 */

/**
 * Known gaming/lookup sites that generate regional duplicates
 * These are search engines or lookup tools, not actual user profiles
 */
const GAMING_LOOKUP_SITES = [
  'op.gg',
  'u.gg',
  'blitz.gg',
  'mobalytics',
  'tracker.gg',
  'dotabuff',
  'stratz',
  'overbuff',
  'r6tracker',
  'destinytracker',
];

/**
 * URL patterns that indicate a search/lookup page, not a profile
 */
const SEARCH_URL_PATTERNS = [
  /\/search\?/i,
  /\/lookup\//i,
  /\/summoners?\//i,  // League of Legends summoner lookup
  /\/players?\//i,    // Generic player lookup
  /\?q=/i,
  /\?query=/i,
  /\?username=/i,
  /\?search=/i,
];

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

  // ScanResultRow fields (from useRealtimeResults)
  url?: string;
  site?: string;
  
  raw?: {
    severity?: string;
    verdict?: string;
    source_providers?: string[];
    page_type?: string;
    primary_url?: string;
    platform_name?: string;
    url?: string;
  };
}

/**
 * Get URL with fallbacks (defined early for use by other functions)
 */
function getItemUrl(item: FilterableItem): string {
  return (
    item.platformUrl ?? 
    item.platform_url ?? 
    item.primary_url ?? 
    item.url ??
    (item as any).raw?.primary_url ?? 
    (item as any).raw?.url ??
    ''
  );
}

/**
 * Get platform name with fallbacks (defined early for use by other functions)
 */
function getPlatformNameEarly(item: FilterableItem): string {
  return (
    item.platformName ??
    item.platform_name ??
    item.site ??
    (item as any).raw?.platform_name ??
    (item as any).raw?.platformName ??
    ''
  ).toLowerCase();
}

/**
 * Check if a platform/URL is a known gaming lookup site
 */
function isGamingLookupSite(item: FilterableItem): boolean {
  const platformName = getPlatformNameEarly(item);
  const url = getItemUrl(item).toLowerCase();

  // Check if platform name matches known gaming lookup sites
  for (const site of GAMING_LOOKUP_SITES) {
    if (platformName.includes(site) || url.includes(site)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if URL matches search/lookup patterns
 */
function hasSearchUrlPattern(url: string | undefined | null): boolean {
  if (!url) return false;
  
  for (const pattern of SEARCH_URL_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  return false;
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
  const url = getItemUrl(item);
  
  return (
    pageType === 'search' ||
    pageType === 'lookup' ||
    tags.includes('search-result') ||
    tags.includes('lookup') ||
    isGamingLookupSite(item) ||
    hasSearchUrlPattern(url)
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
 * FOCUS MODE RULES:
 * 1. Exclude search/lookup results (gaming lookup sites, search URLs)
 * 2. Include everything else (profiles are valid findings)
 * 
 * The goal is to remove "rubbish" like OP.GG regional duplicates,
 * NOT to aggressively filter by confidence thresholds.
 */
function passesFocusModeFilter(item: FilterableItem): boolean {
  // Rule 1: Always exclude search/lookup results
  if (isSearchResult(item)) {
    return false;
  }

  // Rule 2: Include everything else - valid profile findings
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
