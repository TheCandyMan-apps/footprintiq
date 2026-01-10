import { supabase } from "@/integrations/supabase/client";
import type { Finding, Severity } from "@/lib/ufm";

/**
 * Page type for canonical results
 * Used for UI sorting and demotion of search results
 */
export type PageType = 'profile' | 'directory' | 'api' | 'search' | 'unknown';

/**
 * Priority order for page types (lower = higher priority)
 */
export const PAGE_TYPE_PRIORITY: Record<PageType, number> = {
  profile: 1,
  directory: 2,
  api: 3,
  search: 4,
  unknown: 5,
};

/**
 * URL variant from canonical_results
 */
export interface UrlVariant {
  url: string;
  page_type: PageType;
  provider: string;
  is_verified: boolean;
  verification_status: string | null;
  source_finding_id: string | null;
  priority: number;
}

/**
 * Canonical result from database
 */
export interface CanonicalResult {
  id: string;
  scan_id: string;
  workspace_id: string;
  canonical_key: string;
  platform_name: string;
  canonical_username: string;
  primary_url: string | null;
  page_type: PageType;
  url_variants: UrlVariant[];
  severity: string;
  confidence: number;
  is_verified: boolean;
  verification_status: string | null;
  risk_score: number | null;
  ai_summary: string | null;
  remediation_priority: string | null;
  platform_category: string | null;
  source_finding_ids: string[];
  source_providers: string[];
  observed_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Extended Finding type with page_type for canonical results
 */
export interface CanonicalFinding extends Finding {
  pageType?: PageType;
  urlVariants?: UrlVariant[];
  isCanonical?: boolean;
  platformCategory?: string;
  platformName?: string;
  riskScore?: number | null;
  aiSummary?: string | null;
  remediationPriority?: string | null;
}

/**
 * Fetch canonical results for a scan
 */
export async function fetchCanonicalResults(scanId: string): Promise<CanonicalResult[]> {
  const { data, error } = await supabase
    .from('canonical_results')
    .select('*')
    .eq('scan_id', scanId)
    .order('page_type', { ascending: true });

  if (error) {
    console.error('[canonical] Error fetching canonical results:', error);
    return [];
  }

  // Map the database response to our typed interface
  return (data || []).map((row): CanonicalResult => ({
    id: row.id,
    scan_id: row.scan_id,
    workspace_id: row.workspace_id,
    canonical_key: row.canonical_key,
    platform_name: row.platform_name,
    canonical_username: row.canonical_username,
    primary_url: row.primary_url,
    page_type: row.page_type as PageType,
    url_variants: (row.url_variants as unknown as UrlVariant[]) || [],
    severity: row.severity,
    confidence: row.confidence,
    is_verified: row.is_verified ?? false,
    verification_status: row.verification_status,
    risk_score: row.risk_score,
    ai_summary: row.ai_summary,
    remediation_priority: row.remediation_priority,
    platform_category: row.platform_category,
    source_finding_ids: (row.source_finding_ids as string[]) || [],
    source_providers: (row.source_providers as string[]) || [],
    observed_at: row.observed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Convert canonical result to Finding format
 */
export function canonicalToFinding(result: CanonicalResult): CanonicalFinding {
  const severityMap: Record<string, Severity> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    info: 'info',
  };

  return {
    id: result.id,
    type: 'social_media',
    title: `${result.platform_name}: ${result.canonical_username}`,
    description: result.ai_summary || `Found on ${result.platform_name}`,
    severity: severityMap[result.severity] || 'info',
    confidence: result.confidence,
    provider: result.source_providers[0] || 'canonical',
    // Set kind to 'profile_presence' so title extraction works correctly
    providerCategory: 'profile_presence',
    evidence: [
      { key: 'platform', value: result.platform_name },
      { key: 'username', value: result.canonical_username },
      ...(result.primary_url ? [{ key: 'url', value: result.primary_url }] : []),
      ...(result.is_verified ? [{ key: 'verified', value: 'true' }] : []),
    ],
    impact: result.ai_summary || `Found on ${result.platform_name}`,
    remediation: [],
    tags: [
      result.platform_name.toLowerCase(),
      result.platform_category || 'other',
      ...(result.page_type === 'search' ? ['search-result'] : []),
    ],
    observedAt: result.observed_at,
    url: result.primary_url || undefined,
    raw: result,
    // Canonical-specific fields
    pageType: result.page_type as PageType,
    urlVariants: result.url_variants as UrlVariant[],
    isCanonical: true,
    platformCategory: result.platform_category || undefined,
    riskScore: result.risk_score,
    aiSummary: result.ai_summary,
    remediationPriority: result.remediation_priority,
    // Store the actual platform_name in a way FindingCard can access
    platformName: result.platform_name,
  };
}

/**
 * Sort findings by page type priority (profiles first, search last)
 */
export function sortByPageType<T extends { pageType?: PageType }>(findings: T[]): T[] {
  return [...findings].sort((a, b) => {
    const priorityA = PAGE_TYPE_PRIORITY[a.pageType || 'unknown'] || 5;
    const priorityB = PAGE_TYPE_PRIORITY[b.pageType || 'unknown'] || 5;
    return priorityA - priorityB;
  });
}

/**
 * Check if a finding is a search result (should be demoted in UI)
 */
export function isSearchResult(finding: CanonicalFinding): boolean {
  return finding.pageType === 'search' || finding.tags?.includes('search-result');
}

/**
 * Filter to show only non-search results
 */
export function filterOutSearchResults<T extends { pageType?: PageType }>(findings: T[]): T[] {
  return findings.filter(f => f.pageType !== 'search');
}

/**
 * Get display label for page type
 */
export function getPageTypeLabel(pageType: PageType): string {
  const labels: Record<PageType, string> = {
    profile: 'Profile',
    directory: 'Directory',
    api: 'API',
    search: 'Search Result',
    unknown: 'Unknown',
  };
  return labels[pageType] || 'Unknown';
}

/**
 * Get badge variant for page type
 */
export function getPageTypeBadgeVariant(pageType: PageType): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (pageType) {
    case 'profile':
      return 'default';
    case 'directory':
      return 'secondary';
    case 'search':
      return 'outline';
    default:
      return 'secondary';
  }
}
