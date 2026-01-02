/**
 * Canonical results utilities for deduplication and normalization
 * Key strategy: platform + username = one canonical result
 * URLs are stored as variants within each canonical result
 */

export type PageType = 'profile' | 'directory' | 'api' | 'search' | 'unknown';

export interface UrlVariant {
  url: string;
  page_type: PageType;
  provider: string;
  is_verified: boolean;
  verification_status: string | null;
  last_verified_at: string | null;
  source_finding_id: string | null;
  priority: number;
}

export interface CanonicalResult {
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
}

/**
 * Page type priority for selecting primary URL
 * Lower number = higher priority
 */
const PAGE_TYPE_PRIORITY: Record<PageType, number> = {
  profile: 1,
  directory: 2,
  api: 3,
  search: 4,
  unknown: 5,
};

/**
 * Normalize platform name by stripping common prefixes and standardizing casing
 */
export function normalizePlatformName(raw: string): string {
  if (!raw) return 'Unknown';
  
  return raw
    .replace(/^\[\+\]\s*/i, '')     // Strip [+] prefix from maigret
    .replace(/^\[!\]\s*/i, '')      // Strip [!] prefix
    .replace(/^\[-\]\s*/i, '')      // Strip [-] prefix
    .replace(/^@/, '')              // Strip leading @
    .trim()
    .split(/[\s_-]+/)               // Split on spaces, underscores, hyphens
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');                       // PascalCase: "Twitter", "GitHub", "LinkedIn"
}

/**
 * Generate canonical key from platform and username
 * Format: lower(normalized_platform):lower(username)
 */
export function generateCanonicalKey(platform: string, username: string): string {
  const normalizedPlatform = normalizePlatformName(platform).toLowerCase();
  const normalizedUsername = (username || '').toLowerCase().trim();
  return `${normalizedPlatform}:${normalizedUsername}`;
}

/**
 * Classify page type based on URL patterns
 * Used to demote search results in the UI
 */
export function classifyPageType(url: string): PageType {
  if (!url) return 'unknown';
  
  const lowered = url.toLowerCase();
  
  // OP.GG special case - any URL containing /search MUST be 'search'
  if (
    /op\.gg.*\/search/i.test(lowered) ||
    /op\.gg.*\/summoners\/search/i.test(lowered)
  ) {
    return 'search';
  }
  
  // Search patterns - lowest priority
  // Includes: /search, /results, /find, query params like ?q=, gaming platform search patterns
  if (
    // Query parameter patterns (including gaming platforms like OP.GG)
    /[?&](q|query|search|s|keyword|userName|summonerName)=/.test(lowered) ||
    // Path-based search patterns
    /\/search[/?#]/.test(lowered) ||
    /\/search$/.test(lowered) ||
    /\/summoners\/search/.test(lowered) ||
    /\/results[/?#]/.test(lowered) ||
    /\/find[/?#]/.test(lowered) ||
    /\/lookup[/?#]/.test(lowered) ||
    // Search engine patterns
    /google\.com\/search/.test(lowered) ||
    /bing\.com\/search/.test(lowered) ||
    /duckduckgo\.com\//.test(lowered) ||
    /yahoo\.com\/search/.test(lowered) ||
    // Social/Gaming platform search patterns
    /tracker\.gg.*\/search/.test(lowered) ||
    /u\.gg.*\/search/.test(lowered) ||
    /blitz\.gg.*\/search/.test(lowered)
  ) {
    return 'search';
  }
  
  // API patterns
  if (
    /\/api\//.test(lowered) ||
    /\.json(\?|$)/.test(lowered) ||
    /\/v[0-9]+\//.test(lowered) ||
    /\/graphql/.test(lowered)
  ) {
    return 'api';
  }
  
  // Directory patterns
  if (
    /\/directory\//.test(lowered) ||
    /\/members\//.test(lowered) ||
    /\/people\//.test(lowered) ||
    /\/users\/list/.test(lowered) ||
    /\/browse\//.test(lowered)
  ) {
    return 'directory';
  }
  
  // Profile patterns - highest priority (default)
  if (
    /\/(user|u|profile|@|~)\//.test(lowered) ||
    /@[^/]+$/.test(lowered) ||
    /\/in\/[^/]+\/?$/.test(lowered) ||  // LinkedIn profile
    /twitter\.com\/[^/]+\/?$/.test(lowered) ||
    /x\.com\/[^/]+\/?$/.test(lowered) ||
    /github\.com\/[^/]+\/?$/.test(lowered) ||
    /instagram\.com\/[^/]+\/?$/.test(lowered) ||
    /facebook\.com\/[^/]+\/?$/.test(lowered) ||
    /tiktok\.com\/@[^/]+\/?$/.test(lowered)
  ) {
    return 'profile';
  }
  
  // Default to profile for simple username URLs (e.g., platform.com/username)
  try {
    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      return 'profile';
    }
  } catch {
    // Invalid URL, continue to default
  }
  
  return 'profile'; // Default assumption
}

/**
 * Cap confidence and severity for search results
 * Search results should never have high confidence or severity
 */
export function adjustForSearchPageType(
  pageType: PageType,
  confidence: number,
  severity: string
): { confidence: number; severity: string } {
  if (pageType === 'search') {
    return {
      confidence: Math.min(confidence, 0.3),
      severity: 'info',
    };
  }
  return { confidence, severity };
}

/**
 * Select the primary URL from variants based on page_type priority
 */
export function selectPrimaryUrl(variants: UrlVariant[]): UrlVariant | null {
  if (!variants || variants.length === 0) return null;
  
  // Sort by priority (ascending) then by verification status
  const sorted = [...variants].sort((a, b) => {
    // First by page_type priority
    const priorityDiff = (PAGE_TYPE_PRIORITY[a.page_type] || 5) - (PAGE_TYPE_PRIORITY[b.page_type] || 5);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then prefer verified URLs
    if (a.is_verified && !b.is_verified) return -1;
    if (!a.is_verified && b.is_verified) return 1;
    
    // Then by explicit priority field
    return (a.priority || 99) - (b.priority || 99);
  });
  
  return sorted[0];
}

/**
 * Merge new URL variant into existing variants array
 * Returns updated variants with deduplication
 */
export function mergeUrlVariants(existing: UrlVariant[], newVariant: UrlVariant): UrlVariant[] {
  const existingIndex = existing.findIndex(v => v.url === newVariant.url);
  
  if (existingIndex === -1) {
    // New URL, add it
    return [...existing, newVariant];
  }
  
  // Update existing variant (prefer newer verification data)
  const updated = [...existing];
  updated[existingIndex] = {
    ...updated[existingIndex],
    ...newVariant,
    // Keep the existing page_type if already set, otherwise use new
    page_type: updated[existingIndex].page_type || newVariant.page_type,
  };
  
  return updated;
}

/**
 * Aggregate severity from multiple findings (take highest)
 */
export function aggregateSeverity(severities: string[]): string {
  const order: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  };
  
  let highest = 'info';
  let highestOrder = 1;
  
  for (const sev of severities) {
    const o = order[sev?.toLowerCase()] || 0;
    if (o > highestOrder) {
      highestOrder = o;
      highest = sev.toLowerCase();
    }
  }
  
  return highest;
}

/**
 * Aggregate confidence from multiple findings (take highest)
 */
export function aggregateConfidence(confidences: number[]): number {
  if (!confidences || confidences.length === 0) return 0.5;
  return Math.max(...confidences.filter(c => typeof c === 'number'));
}

/**
 * Categorize platform by type
 */
export function categorizePlatform(platformName: string): string {
  const name = platformName.toLowerCase();
  
  const categories: Record<string, string[]> = {
    social_media: ['twitter', 'x', 'facebook', 'instagram', 'tiktok', 'snapchat', 'threads', 'mastodon', 'bluesky'],
    professional: ['linkedin', 'xing', 'angellist', 'crunchbase', 'about.me'],
    code: ['github', 'gitlab', 'bitbucket', 'stackoverflow', 'codepen', 'replit', 'npm', 'pypi'],
    gaming: ['steam', 'discord', 'twitch', 'xbox', 'playstation', 'epicgames', 'roblox', 'minecraft'],
    dating: ['tinder', 'bumble', 'hinge', 'okcupid', 'match', 'pof'],
    forum: ['reddit', 'hackernews', 'quora', 'disqus', '4chan', 'discourse'],
    creative: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'bandcamp', 'deviantart', 'dribbble', 'behance'],
    messaging: ['telegram', 'whatsapp', 'signal', 'slack', 'keybase'],
    blogging: ['medium', 'substack', 'wordpress', 'blogger', 'tumblr', 'ghost'],
    commerce: ['ebay', 'etsy', 'amazon', 'shopify', 'paypal', 'venmo', 'cashapp'],
    crypto: ['opensea', 'rarible', 'coinbase', 'binance', 'kraken'],
  };
  
  for (const [category, platforms] of Object.entries(categories)) {
    if (platforms.some(p => name.includes(p))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Extract username from URL when not provided directly
 */
export function extractUsernameFromUrl(url: string, platform: string): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    
    // Common patterns: /user/username, /@username, /username
    if (pathParts.length >= 1) {
      const last = pathParts[pathParts.length - 1];
      // Strip @ prefix if present
      return last.replace(/^@/, '');
    }
  } catch {
    // Invalid URL
  }
  
  return null;
}
