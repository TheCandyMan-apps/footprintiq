/**
 * Results Aggregation Layer
 * 
 * Transforms raw per-provider scan results into a unified, deduplicated model.
 * Produces authoritative counts and clusters findings by entity.
 * 
 * Key responsibilities:
 * - Deduplicate profiles across providers (by platform + username/URL)
 * - Cluster findings by entity type (username, email, phone)
 * - Calculate authoritative totals
 * - Provide structured profile data for UI consumption
 */

// ============ TYPE DEFINITIONS ============

export interface AggregatedProfile {
  /** Unique key for deduplication (platform_username or URL hash) */
  id: string;
  /** Normalized platform name */
  platform: string;
  /** Primary URL to the profile */
  url: string | null;
  /** Extracted username/handle */
  username: string | null;
  /** Profile display name */
  displayName: string | null;
  /** Profile bio/description */
  bio: string | null;
  /** Profile image URL */
  avatarUrl: string | null;
  /** Status: found, claimed, not_found */
  status: 'found' | 'claimed' | 'not_found' | 'unknown';
  /** Aggregated confidence score (0-100) */
  confidence: number;
  /** Additional metadata (non-sensitive) */
  metadata: {
    followers?: number;
    following?: number;
    location?: string;
    joined?: string;
    website?: string;
  };
  /** Source providers that found this (for Pro display) */
  sources: string[];
  /** Whether this is an exposure (breach/leak) */
  isExposure: boolean;
  /** Exposure details if applicable */
  exposureDetails?: {
    breachName?: string;
    breachDate?: string;
    exposedDataTypes?: string[];
  };
}

export interface AggregatedResults {
  /** All unique profiles after deduplication */
  profiles: AggregatedProfile[];
  
  /** Counts by category */
  counts: {
    totalProfiles: number;
    totalExposures: number;
    totalBreaches: number;
    publicProfiles: number;
    highConfidence: number;
  };
  
  /** Raw result count before aggregation */
  rawCount: number;
  
  /** Deduplication stats */
  deduplication: {
    originalCount: number;
    duplicatesRemoved: number;
    mergedCount: number;
  };
}

// ============ HELPER FUNCTIONS ============

/**
 * Normalize platform name for consistent matching
 */
function normalizePlatformName(name: string | undefined): string {
  if (!name) return 'unknown';
  
  const lower = name.toLowerCase().trim();
  
  // Platform aliases
  const aliases: Record<string, string> = {
    'x.com': 'twitter',
    'x': 'twitter',
    'github.com': 'github',
    'linkedin.com': 'linkedin',
    'facebook.com': 'facebook',
    'instagram.com': 'instagram',
    'reddit.com': 'reddit',
    'youtube.com': 'youtube',
  };
  
  return aliases[lower] || lower;
}

/**
 * Extract username from various data structures
 */
function extractUsername(finding: any): string | null {
  const meta = finding.meta || finding.metadata || {};
  
  // Check explicit fields
  const usernameFields = ['username', 'handle', 'screen_name', 'login', 'user'];
  for (const field of usernameFields) {
    if (meta[field] && typeof meta[field] === 'string' && meta[field].length > 1) {
      return meta[field].replace(/^@/, '');
    }
  }
  
  // Try to extract from URL
  const url = finding.url || meta.url;
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      for (const part of parts) {
        const cleaned = part.replace(/[?#].*$/, '');
        if (cleaned.length >= 2 && cleaned.length <= 30 && !/^\d+$/.test(cleaned)) {
          return cleaned;
        }
      }
    } catch {}
  }
  
  return null;
}

/**
 * Generate a unique key for deduplication
 */
function generateDedupeKey(finding: any): string {
  const platform = normalizePlatformName(finding.site);
  const username = extractUsername(finding);
  const url = finding.url || '';
  
  // Prefer platform + username combo
  if (username) {
    return `${platform}_${username.toLowerCase()}`;
  }
  
  // Fall back to URL-based key
  if (url) {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/+$/, '');
    } catch {}
  }
  
  // Last resort: use ID
  return `${platform}_${finding.id}`;
}

/**
 * Calculate aggregated confidence score
 */
function calculateConfidence(finding: any): number {
  if (finding.lensScore) return finding.lensScore;
  
  let score = 50;
  
  const status = (finding.status || '').toLowerCase();
  if (status === 'found') score += 30;
  else if (status === 'claimed') score += 20;
  
  // Has URL = more reliable
  if (finding.url) score += 10;
  
  // Has metadata = more reliable
  const meta = finding.meta || finding.metadata || {};
  if (Object.keys(meta).length > 2) score += 10;
  if (meta.avatar_url || meta.profile_image) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Determine if a finding represents an exposure
 */
function isExposureFinding(finding: any): boolean {
  const kind = (finding.kind || '').toLowerCase();
  const provider = (finding.provider || '').toLowerCase();
  const site = (finding.site || '').toLowerCase();
  
  const exposureKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised', 'exposure', 'paste', 'dehashed'];
  return exposureKeywords.some(k => 
    kind.includes(k) || provider.includes(k) || site.includes(k)
  );
}

/**
 * Derive status from finding data
 */
function deriveStatus(finding: any): 'found' | 'claimed' | 'not_found' | 'unknown' {
  if (finding.status) {
    const s = finding.status.toLowerCase();
    if (s === 'found') return 'found';
    if (s === 'claimed') return 'claimed';
    if (s === 'not_found' || s === 'notfound') return 'not_found';
  }
  
  const kind = (finding.kind || '').toLowerCase();
  if (kind === 'profile_presence' || kind === 'presence.hit' || kind === 'account_found') {
    return 'found';
  }
  if (kind === 'presence.miss' || kind === 'not_found') {
    return 'not_found';
  }
  
  // Check evidence for exists flag
  if (finding.evidence && Array.isArray(finding.evidence)) {
    const existsEvidence = finding.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  
  return 'unknown';
}

/**
 * Merge two findings for the same profile
 */
function mergeFindings(existing: AggregatedProfile, newFinding: any): AggregatedProfile {
  const meta = newFinding.meta || newFinding.metadata || {};
  const newConfidence = calculateConfidence(newFinding);
  
  return {
    ...existing,
    // Take higher confidence
    confidence: Math.max(existing.confidence, newConfidence),
    // Prefer non-null values
    username: existing.username || extractUsername(newFinding),
    displayName: existing.displayName || meta.display_name || meta.name,
    bio: existing.bio || meta.bio || meta.about,
    avatarUrl: existing.avatarUrl || meta.avatar_url || meta.profile_image || meta.image,
    url: existing.url || newFinding.url || meta.url,
    // Merge sources
    sources: [...new Set([...existing.sources, newFinding.provider || 'unknown'])],
    // Merge metadata
    metadata: {
      ...existing.metadata,
      followers: existing.metadata.followers ?? meta.followers,
      following: existing.metadata.following ?? meta.following,
      location: existing.metadata.location || meta.location,
      joined: existing.metadata.joined || meta.joined,
      website: existing.metadata.website || meta.website,
    },
    // Keep exposure data if any source shows exposure
    isExposure: existing.isExposure || isExposureFinding(newFinding),
  };
}

/**
 * Convert a finding to an AggregatedProfile
 */
function findingToProfile(finding: any): AggregatedProfile {
  const meta = finding.meta || finding.metadata || {};
  const isExposure = isExposureFinding(finding);
  
  return {
    id: generateDedupeKey(finding),
    platform: normalizePlatformName(finding.site),
    url: finding.url || meta.url || null,
    username: extractUsername(finding),
    displayName: meta.display_name || meta.name || null,
    bio: meta.bio || meta.about || meta.description || null,
    avatarUrl: meta.avatar_url || meta.profile_image || meta.image || null,
    status: deriveStatus(finding),
    confidence: calculateConfidence(finding),
    metadata: {
      followers: meta.followers,
      following: meta.following,
      location: meta.location !== 'Unknown' ? meta.location : undefined,
      joined: meta.joined,
      website: meta.website,
    },
    sources: [finding.provider || 'unknown'],
    isExposure,
    exposureDetails: isExposure ? {
      breachName: meta.breach_name || meta.Name || finding.site,
      breachDate: meta.breach_date || meta.BreachDate,
      exposedDataTypes: meta.data_types || meta.DataClasses || [],
    } : undefined,
  };
}

// ============ MAIN AGGREGATION FUNCTION ============

/**
 * Aggregate raw scan results into a unified, deduplicated model
 * 
 * @param rawResults - Raw findings from all providers
 * @returns Aggregated results with authoritative counts
 */
export function aggregateResults(rawResults: any[]): AggregatedResults {
  // Filter out provider health findings
  const findings = rawResults.filter(r => {
    const kind = (r.kind || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    return !['provider_error', 'unconfigured', 'not_configured', 'rate_limited'].includes(status) &&
           !kind.includes('provider_health');
  });
  
  // Deduplicate by key
  const profileMap = new Map<string, AggregatedProfile>();
  
  for (const finding of findings) {
    const key = generateDedupeKey(finding);
    const existing = profileMap.get(key);
    
    if (existing) {
      profileMap.set(key, mergeFindings(existing, finding));
    } else {
      profileMap.set(key, findingToProfile(finding));
    }
  }
  
  const profiles = Array.from(profileMap.values());
  
  // Sort by confidence descending
  profiles.sort((a, b) => b.confidence - a.confidence);
  
  // Calculate counts
  const publicProfiles = profiles.filter(p => !p.isExposure && p.status === 'found');
  const exposures = profiles.filter(p => p.isExposure);
  const highConfidence = profiles.filter(p => p.confidence >= 75);
  
  return {
    profiles,
    counts: {
      totalProfiles: profiles.length,
      totalExposures: exposures.length,
      totalBreaches: exposures.length, // Simplified: all exposures count as breaches
      publicProfiles: publicProfiles.length,
      highConfidence: highConfidence.length,
    },
    rawCount: rawResults.length,
    deduplication: {
      originalCount: findings.length,
      duplicatesRemoved: findings.length - profiles.length,
      mergedCount: profiles.filter(p => p.sources.length > 1).length,
    },
  };
}

/**
 * Get profiles for display, with plan-based limiting
 */
export function getDisplayProfiles(
  aggregated: AggregatedResults,
  isFullAccess: boolean,
  limit: number = 3
): {
  visible: AggregatedProfile[];
  hiddenCount: number;
  totalCount: number;
} {
  const allProfiles = aggregated.profiles.filter(p => p.status === 'found' || p.status === 'claimed');
  
  if (isFullAccess) {
    return {
      visible: allProfiles,
      hiddenCount: 0,
      totalCount: allProfiles.length,
    };
  }
  
  return {
    visible: allProfiles.slice(0, limit),
    hiddenCount: Math.max(0, allProfiles.length - limit),
    totalCount: allProfiles.length,
  };
}

/**
 * Get exposure summaries for display
 */
export function getExposureSummaries(
  aggregated: AggregatedResults,
  isFullAccess: boolean,
  limit: number = 2
): {
  visible: AggregatedProfile[];
  hiddenCount: number;
  totalCount: number;
} {
  const exposures = aggregated.profiles.filter(p => p.isExposure);
  
  if (isFullAccess) {
    return {
      visible: exposures,
      hiddenCount: 0,
      totalCount: exposures.length,
    };
  }
  
  return {
    visible: exposures.slice(0, limit),
    hiddenCount: Math.max(0, exposures.length - limit),
    totalCount: exposures.length,
  };
}
