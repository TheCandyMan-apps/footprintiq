/**
 * Correlation Signal Extraction for OSINT Graph
 * 
 * Extracts and normalizes identity signals from scan results to power
 * the correlation graph with meaningful edges between accounts.
 */

import { ScanResult } from '@/hooks/useScanResultsData';

// ============================================================================
// Types
// ============================================================================

export interface NormalizedSignals {
  id: string;
  platform: string;
  url?: string;
  
  // Username signals
  rawUsername?: string;
  normalizedUsername?: string;
  usernameVariants: string[];
  
  // Image signals
  profileImageUrl?: string;
  imageFingerprint?: string; // Simple hash of URL for matching
  
  // Bio/text signals
  rawBio?: string;
  normalizedBio?: string;
  bioKeywords: string[];
  
  // Link/domain signals
  extractedLinks: string[];
  extractedDomains: string[];
  
  // ID signals
  platformId?: string;
  userId?: string;
  numericId?: string;
  
  // Email signals
  extractedEmails: string[];
}

export type CorrelationStrength = 'strong' | 'medium' | 'weak';

export interface CorrelationEdge {
  sourceId: string;
  targetId: string;
  reason: CorrelationReason;
  strength: CorrelationStrength;
  weight: number; // 0-1
  confidence: number; // 0-100
  details?: string;
}

export type CorrelationReason = 
  | 'same_username'
  | 'similar_username'
  | 'same_image'
  | 'similar_bio'
  | 'shared_domain'
  | 'shared_link'
  | 'shared_email'
  | 'shared_id'
  | 'cross_reference'
  | 'username_reuse'
  | 'image_reuse'
  | 'bio_similarity';

export const CORRELATION_CONFIG: Record<CorrelationReason, { 
  label: string; 
  weight: number; 
  strength: CorrelationStrength;
  icon: string;
}> = {
  same_username: { label: 'Same username', weight: 0.95, strength: 'strong', icon: '🔤' },
  similar_username: { label: 'Similar username', weight: 0.7, strength: 'medium', icon: '🔤' },
  same_image: { label: 'Same profile image', weight: 0.98, strength: 'strong', icon: '🖼️' },
  similar_bio: { label: 'Similar bio content', weight: 0.5, strength: 'weak', icon: '📝' },
  shared_domain: { label: 'Shared link/domain', weight: 0.75, strength: 'medium', icon: '🔗' },
  shared_link: { label: 'Shared link', weight: 0.7, strength: 'medium', icon: '🔗' },
  shared_email: { label: 'Shared email', weight: 0.9, strength: 'strong', icon: '📧' },
  shared_id: { label: 'Shared platform ID', weight: 0.85, strength: 'strong', icon: '🆔' },
  cross_reference: { label: 'Profile cross-reference', weight: 0.8, strength: 'medium', icon: '↔️' },
  username_reuse: { label: 'Username reuse', weight: 0.9, strength: 'strong', icon: '🔁' },
  image_reuse: { label: 'Image reuse', weight: 0.95, strength: 'strong', icon: '🖼️' },
  bio_similarity: { label: 'Bio similarity', weight: 0.6, strength: 'medium', icon: '📝' },
};

// ============================================================================
// Signal Extraction
// ============================================================================

/**
 * Normalize a username for comparison
 */
function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special chars
    .replace(/^(the|mr|ms|dr|prof)/, '') // Remove common prefixes
    .trim();
}

/**
 * Generate username variants for fuzzy matching
 */
function generateUsernameVariants(username: string): string[] {
  const normalized = normalizeUsername(username);
  const variants = new Set<string>([normalized]);
  
  // Add common variations
  variants.add(normalized.replace(/[0-9]+$/, '')); // Without trailing numbers
  variants.add(normalized.replace(/^[0-9]+/, '')); // Without leading numbers
  variants.add(normalized.replace(/[_-]/g, '')); // Without separators
  
  // Common substitutions
  variants.add(normalized.replace(/0/g, 'o'));
  variants.add(normalized.replace(/1/g, 'i').replace(/1/g, 'l'));
  variants.add(normalized.replace(/3/g, 'e'));
  variants.add(normalized.replace(/4/g, 'a'));
  variants.add(normalized.replace(/5/g, 's'));
  
  return Array.from(variants).filter(v => v.length >= 2);
}

/**
 * Create a simple fingerprint from an image URL
 * In production, this would use perceptual hashing
 */
function createImageFingerprint(url: string): string {
  // Extract the significant parts of the URL
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    
    // Remove size parameters and query strings for comparison
    const cleanPath = path
      .replace(/[_-]?\d{2,4}x\d{2,4}/g, '') // Size suffixes
      .replace(/[_-]?(small|medium|large|thumb|avatar)/gi, '')
      .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    
    return `${parsed.hostname}${cleanPath}`;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Normalize bio text for comparison
 */
function normalizeBio(bio: string): string {
  return bio
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[@#]\w+/g, '') // Remove mentions/hashtags
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// Stopwords for bio keyword extraction
const BIO_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
  'she', 'it', 'they', 'them', 'their', 'who', 'what', 'which', 'where',
  'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so',
  'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'about',
  'like', 'get', 'got', 'make', 'made', 'know', 'think', 'take', 'see',
  'come', 'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'try',
  'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin',
  'seem', 'help', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe',
]);

// Generic bio terms that appear frequently and don't indicate identity correlation
const BIO_GENERIC_TERMS = new Set([
  // Common interests/hobbies (too generic)
  'music', 'love', 'lover', 'loving', 'fan', 'fans',
  'photography', 'photographer', 'photo', 'photos',
  'gaming', 'gamer', 'games', 'game', 'player',
  'travel', 'traveler', 'traveling', 'travels',
  'fitness', 'gym', 'workout', 'health', 'healthy',
  'food', 'foodie', 'cooking', 'chef', 'cook',
  'art', 'artist', 'creative', 'design', 'designer',
  'tech', 'technology', 'developer', 'dev', 'coder', 'coding', 'programmer', 'programming',
  'writer', 'writing', 'author', 'blogger', 'blog',
  'student', 'learning', 'learner', 'studying',
  'entrepreneur', 'business', 'founder', 'startup',
  'engineer', 'engineering', 'software',
  // Common descriptors
  'passionate', 'enthusiast', 'professional', 'expert',
  'official', 'verified', 'real', 'original',
  'life', 'lifestyle', 'living', 'world',
  'best', 'good', 'great', 'amazing', 'awesome',
  'new', 'old', 'young', 'first', 'last',
  'free', 'full', 'open', 'public', 'private',
  'digital', 'online', 'social', 'media', 'content', 'creator',
  // Common roles
  'dad', 'mom', 'father', 'mother', 'parent', 'wife', 'husband',
  'friend', 'friends', 'family',
  // Generic actions
  'follow', 'following', 'follower', 'followers',
  'subscribe', 'support', 'contact', 'connect',
  'share', 'sharing', 'post', 'posts', 'posting',
  // Filler words
  'just', 'really', 'thing', 'things', 'stuff', 'way', 'always', 'never',
  'everything', 'anything', 'something', 'nothing',
  'everyone', 'anyone', 'someone', 'nobody',
  'everyday', 'daily', 'weekly', 'monthly', 'yearly',
]);

/**
 * Check if a token is meaningful for bio correlation
 * (not a stopword, not generic, and meets minimum length)
 */
function isMeaningfulBioToken(token: string): boolean {
  if (token.length < 3) return false;
  if (/^\d+$/.test(token)) return false; // Pure numbers
  if (BIO_STOPWORDS.has(token)) return false;
  if (BIO_GENERIC_TERMS.has(token)) return false;
  return true;
}

/**
 * Extract keywords from bio for matching
 * Only returns meaningful tokens that can indicate identity correlation
 */
function extractBioKeywords(bio: string): string[] {
  const normalized = normalizeBio(bio);
  const words = normalized.split(/\s+/).filter(isMeaningfulBioToken);

  // Also extract potential identifiers (CamelCase, etc.) - these are high value
  const identifiers = bio.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g) || [];
  const normalizedIdentifiers = identifiers
    .map(i => i.toLowerCase())
    .filter(i => i.length >= 4); // Identifiers should be at least 4 chars
  
  return [...new Set([...words, ...normalizedIdentifiers])];
}

/**
 * Extract URLs and domains from text
 */
function extractLinksAndDomains(text: string): { links: string[]; domains: string[] } {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;
  
  const links: string[] = [];
  const domains = new Set<string>();
  
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].replace(/[.,;:!?)]+$/, ''); // Clean trailing punctuation
    links.push(url);
    
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.replace(/^www\./, '').toLowerCase();
      // Skip common platforms (they're not distinctive)
      if (!isCommonPlatform(domain)) {
        domains.add(domain);
      }
    } catch {}
  }
  
  // Also match bare domains
  const text2 = text;
  while ((match = domainRegex.exec(text2)) !== null) {
    const domain = match[1].toLowerCase();
    if (!isCommonPlatform(domain) && !domains.has(domain)) {
      domains.add(domain);
    }
  }
  
  return { links, domains: Array.from(domains) };
}

/**
 * Check if a domain is a common social platform (not distinctive for correlation)
 */
function isCommonPlatform(domain: string): boolean {
  const common = [
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com',
    'youtube.com', 'tiktok.com', 'reddit.com', 'github.com', 'medium.com',
    'twitch.tv', 'discord.com', 'discord.gg', 'telegram.org', 't.me',
    'patreon.com', 'ko-fi.com', 'buymeacoffee.com', 'linktr.ee', 'linktree.com',
    'bit.ly', 'goo.gl', 't.co', 'youtu.be', 'fb.me', 'wa.me',
  ];
  return common.some(c => domain.includes(c) || c.includes(domain));
}

/**
 * Extract email addresses from text
 */
function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches.map(e => e.toLowerCase()))];
}

/**
 * Extract platform IDs from URL or metadata
 */
function extractPlatformIds(result: ScanResult): { platformId?: string; userId?: string; numericId?: string } {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  // Try to extract from metadata
  const platformId = meta.id || meta.user_id || meta.account_id;
  const userId = meta.uid || meta.user_id;
  
  // Try to extract numeric ID from URL
  let numericId: string | undefined;
  if (result.url) {
    const numericMatch = result.url.match(/\/(\d{5,})\/?(?:\?|$)/);
    if (numericMatch) {
      numericId = numericMatch[1];
    }
  }
  
  return {
    platformId: platformId?.toString(),
    userId: userId?.toString(),
    numericId,
  };
}

/**
 * Extract all normalized signals from a scan result
 */
export function extractSignals(result: ScanResult): NormalizedSignals {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  // Extract raw values
  const rawUsername = meta.username || meta.handle || meta.screen_name || meta.user || meta.name;
  const rawBio = meta.bio || meta.description || meta.about || meta.summary || '';
  const profileImageUrl = meta.avatar_url || meta.profile_image || meta.image || meta.avatar;
  
  // Normalize username
  const normalizedUsername = rawUsername ? normalizeUsername(rawUsername) : undefined;
  const usernameVariants = rawUsername ? generateUsernameVariants(rawUsername) : [];
  
  // Normalize bio and extract keywords
  const normalizedBio = rawBio ? normalizeBio(rawBio) : undefined;
  const bioKeywords = rawBio ? extractBioKeywords(rawBio) : [];
  
  // Extract links and domains from bio and metadata
  const bioLinks = rawBio ? extractLinksAndDomains(rawBio) : { links: [], domains: [] };
  const websiteLinks = meta.website ? extractLinksAndDomains(meta.website) : { links: [], domains: [] };
  const urlLinks = meta.url ? extractLinksAndDomains(meta.url) : { links: [], domains: [] };
  
  const extractedLinks = [...new Set([...bioLinks.links, ...websiteLinks.links, ...urlLinks.links])];
  const extractedDomains = [...new Set([...bioLinks.domains, ...websiteLinks.domains, ...urlLinks.domains])];
  
  // Extract emails
  const bioEmails = rawBio ? extractEmails(rawBio) : [];
  const metaEmail = meta.email ? [meta.email.toLowerCase()] : [];
  const extractedEmails = [...new Set([...bioEmails, ...metaEmail])];
  
  // Extract platform IDs
  const ids = extractPlatformIds(result);
  
  // Create image fingerprint
  const imageFingerprint = profileImageUrl ? createImageFingerprint(profileImageUrl) : undefined;
  
  return {
    id: result.id,
    platform: result.site || 'unknown',
    url: result.url,
    rawUsername,
    normalizedUsername,
    usernameVariants,
    profileImageUrl,
    imageFingerprint,
    rawBio,
    normalizedBio,
    bioKeywords,
    extractedLinks,
    extractedDomains,
    ...ids,
    extractedEmails,
  };
}

// ============================================================================
// Correlation Computation
// ============================================================================

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: string[], set2: string[]): number {
  if (set1.length === 0 || set2.length === 0) return 0;
  
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  
  let intersection = 0;
  s1.forEach(item => {
    if (s2.has(item)) intersection++;
  });
  
  const union = s1.size + s2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate simple string similarity (Dice coefficient on bigrams)
 */
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;
  
  const bigrams1 = new Set<string>();
  const bigrams2 = new Set<string>();
  
  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }
  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2));
  }
  
  let matches = 0;
  bigrams1.forEach(b => {
    if (bigrams2.has(b)) matches++;
  });
  
  return (2 * matches) / (bigrams1.size + bigrams2.size);
}

/**
 * Compute correlation edges between two signal sets
 */
function computeCorrelation(
  sig1: NormalizedSignals,
  sig2: NormalizedSignals
): CorrelationEdge[] {
  const edges: CorrelationEdge[] = [];

  // Same normalized username (strong)
  if (sig1.normalizedUsername && sig2.normalizedUsername) {
    if (sig1.normalizedUsername === sig2.normalizedUsername) {
      edges.push({
        sourceId: sig1.id,
        targetId: sig2.id,
        reason: 'same_username',
        strength: 'strong',
        weight: CORRELATION_CONFIG.same_username.weight,
        confidence: 95,
        details: `Exact username match: "${sig1.rawUsername}"`,
      });
    } else {
      // Check for similar usernames via variants
      const sharedVariants = sig1.usernameVariants.filter(v => 
        sig2.usernameVariants.includes(v)
      );
      if (sharedVariants.length > 0) {
        const similarity = stringSimilarity(sig1.normalizedUsername, sig2.normalizedUsername);
        if (similarity >= 0.6) {
          edges.push({
            sourceId: sig1.id,
            targetId: sig2.id,
            reason: 'similar_username',
            strength: 'medium',
            weight: CORRELATION_CONFIG.similar_username.weight * similarity,
            confidence: Math.round(similarity * 80),
            details: `Similar: "${sig1.rawUsername}" ↔ "${sig2.rawUsername}"`,
          });
        }
      }
    }
  }

  // Same profile image (strong)
  if (sig1.imageFingerprint && sig2.imageFingerprint) {
    if (sig1.imageFingerprint === sig2.imageFingerprint) {
      edges.push({
        sourceId: sig1.id,
        targetId: sig2.id,
        reason: 'same_image',
        strength: 'strong',
        weight: CORRELATION_CONFIG.same_image.weight,
        confidence: 90,
        details: 'Matching profile image detected',
      });
    }
  }

  // Shared email (strong)
  const sharedEmails = sig1.extractedEmails.filter(e => sig2.extractedEmails.includes(e));
  if (sharedEmails.length > 0) {
    edges.push({
      sourceId: sig1.id,
      targetId: sig2.id,
      reason: 'shared_email',
      strength: 'strong',
      weight: CORRELATION_CONFIG.shared_email.weight,
      confidence: 92,
      details: `Shared email: ${sharedEmails[0]}`,
    });
  }

  // Shared platform ID (strong)
  if (sig1.numericId && sig2.numericId && sig1.numericId === sig2.numericId) {
    edges.push({
      sourceId: sig1.id,
      targetId: sig2.id,
      reason: 'shared_id',
      strength: 'strong',
      weight: CORRELATION_CONFIG.shared_id.weight,
      confidence: 85,
      details: `Shared ID: ${sig1.numericId}`,
    });
  }

  // Shared domain (medium)
  const sharedDomains = sig1.extractedDomains.filter(d => sig2.extractedDomains.includes(d));
  if (sharedDomains.length > 0) {
    edges.push({
      sourceId: sig1.id,
      targetId: sig2.id,
      reason: 'shared_domain',
      strength: 'medium',
      weight: CORRELATION_CONFIG.shared_domain.weight,
      confidence: 70,
      details: `Shared domain: ${sharedDomains[0]}`,
    });
  }

  // Bio similarity - STRICT matching to avoid "everyone connected" graphs
  // Only create edge if: Jaccard >= 0.75 OR at least 3 shared meaningful tokens
  if (sig1.bioKeywords.length >= 2 && sig2.bioKeywords.length >= 2) {
    const sharedKeywords = sig1.bioKeywords.filter(k => sig2.bioKeywords.includes(k));
    const jaccardScore = jaccardSimilarity(sig1.bioKeywords, sig2.bioKeywords);
    
    // STRICT THRESHOLD: Require high Jaccard OR multiple shared meaningful tokens
    const hasEnoughSharedTokens = sharedKeywords.length >= 3;
    const hasHighSimilarity = jaccardScore >= 0.75;
    
    if (hasEnoughSharedTokens || hasHighSimilarity) {
      // Calculate effective confidence based on which threshold was met
      const effectiveScore = hasHighSimilarity 
        ? jaccardScore 
        : Math.min(1, sharedKeywords.length / 5); // 5 shared = 100%
      
      edges.push({
        sourceId: sig1.id,
        targetId: sig2.id,
        reason: 'similar_bio',
        strength: effectiveScore >= 0.8 ? 'strong' : 'medium',
        weight: CORRELATION_CONFIG.similar_bio.weight * (0.6 + effectiveScore * 0.4),
        confidence: Math.round(effectiveScore * 70 + 25), // 25-95 range
        details: hasHighSimilarity 
          ? `High bio similarity (${Math.round(jaccardScore * 100)}%): ${sharedKeywords.slice(0, 4).join(', ')}`
          : `Shared meaningful terms: ${sharedKeywords.slice(0, 4).join(', ')}`,
      });
    }
  }

  // Cross-reference detection (check if one profile links to another)
  const sig1LinksToSig2 = sig1.extractedLinks.some(link => {
    if (!sig2.url) return false;
    try {
      return new URL(link).hostname === new URL(sig2.url).hostname;
    } catch {
      return false;
    }
  });
  const sig2LinksToSig1 = sig2.extractedLinks.some(link => {
    if (!sig1.url) return false;
    try {
      return new URL(link).hostname === new URL(sig1.url).hostname;
    } catch {
      return false;
    }
  });

  if (sig1LinksToSig2 || sig2LinksToSig1) {
    edges.push({
      sourceId: sig1.id,
      targetId: sig2.id,
      reason: 'cross_reference',
      strength: 'medium',
      weight: CORRELATION_CONFIG.cross_reference.weight,
      confidence: 75,
      details: sig1LinksToSig2 && sig2LinksToSig1 
        ? 'Mutual cross-reference' 
        : 'One-way profile link',
    });
  }

  return edges;
}

/**
 * Compute all correlation edges for a set of results
 */
export function computeAllCorrelations(results: ScanResult[]): {
  signals: Map<string, NormalizedSignals>;
  edges: CorrelationEdge[];
} {
  // Extract signals for all results
  const signals = new Map<string, NormalizedSignals>();
  const foundResults = results.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'found' || status === 'claimed';
  });

  foundResults.forEach(result => {
    signals.set(result.id, extractSignals(result));
  });

  // Compute pairwise correlations
  const edges: CorrelationEdge[] = [];
  const signalList = Array.from(signals.values());
  const processedPairs = new Set<string>();

  for (let i = 0; i < signalList.length; i++) {
    for (let j = i + 1; j < signalList.length; j++) {
      const pairKey = [signalList[i].id, signalList[j].id].sort().join('|');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const correlations = computeCorrelation(signalList[i], signalList[j]);
      edges.push(...correlations);
    }
  }

  // Sort edges by weight (strongest first)
  edges.sort((a, b) => b.weight - a.weight);

  return { signals, edges };
}

/**
 * Get a human-readable summary of correlations for an account
 */
export function getCorrelationSummary(
  accountId: string, 
  edges: CorrelationEdge[]
): { 
  totalConnections: number;
  strongConnections: number;
  primaryReason: string | null;
  reasons: string[];
} {
  const accountEdges = edges.filter(e => e.sourceId === accountId || e.targetId === accountId);
  
  const reasonCounts: Record<string, number> = {};
  accountEdges.forEach(e => {
    reasonCounts[e.reason] = (reasonCounts[e.reason] || 0) + 1;
  });

  const sortedReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason]) => CORRELATION_CONFIG[reason as CorrelationReason]?.label || reason);

  return {
    totalConnections: accountEdges.length,
    strongConnections: accountEdges.filter(e => e.strength === 'strong').length,
    primaryReason: sortedReasons[0] || null,
    reasons: sortedReasons,
  };
}
