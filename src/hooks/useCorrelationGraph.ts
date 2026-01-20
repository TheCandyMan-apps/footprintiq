import { useMemo } from 'react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { 
  computeAllCorrelations, 
  extractSignals,
  CorrelationEdge as SignalEdge,
  CorrelationReason,
  CORRELATION_CONFIG,
} from '@/lib/correlationSignals';

export type EdgeReason = CorrelationReason | 'identity_search';

export interface GraphNode {
  id: string;
  type: 'identity' | 'account' | 'signal';
  label: string;
  platform?: string;
  category: string;
  url?: string;
  imageUrl?: string;
  confidence: number;
  lensStatus?: 'verified' | 'likely' | 'unclear' | null;
  meta?: Record<string, any>;
  result?: ScanResult;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  reason: EdgeReason;
  reasonLabel: string;
  weight: number;
  confidence: number;
  details?: string;
}

export interface CorrelationGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    byCategory: Record<string, number>;
    byReason: Record<EdgeReason, number>;
  };
}

const PLATFORM_CATEGORIES: Record<string, string[]> = {
  social: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'mastodon', 'threads', 'pinterest', 'x'],
  professional: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow', 'npm', 'pypi', 'codepen', 'bitbucket'],
  media: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'deviantart', 'flickr', 'medium', 'substack', 'bandcamp', 'mixcloud'],
  gaming: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox', 'epic', 'battlenet', 'minecraft', 'origin', 'ubisoft'],
  forum: ['reddit', 'quora', 'hackernews', 'lobsters', '4chan', 'discourse', 'stackexchange'],
};

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  social: { label: 'Social', color: '#3b82f6', icon: '👥' },
  professional: { label: 'Professional', color: '#8b5cf6', icon: '💼' },
  media: { label: 'Media', color: '#ec4899', icon: '🎬' },
  gaming: { label: 'Gaming', color: '#10b981', icon: '🎮' },
  forum: { label: 'Forums', color: '#f59e0b', icon: '💬' },
  other: { label: 'Other', color: '#6b7280', icon: '🌐' },
};

export const EDGE_REASON_CONFIG: Record<EdgeReason, { label: string; weight: number; icon: string }> = {
  same_username: { label: 'Same username', weight: 0.9, icon: '🔤' },
  similar_username: { label: 'Similar username', weight: 0.7, icon: '🔤' },
  same_image: { label: 'Same profile image', weight: 0.95, icon: '🖼️' },
  similar_bio: { label: 'Similar bio', weight: 0.6, icon: '📝' },
  shared_domain: { label: 'Shared link/domain', weight: 0.75, icon: '🔗' },
  shared_email: { label: 'Shared email', weight: 0.85, icon: '📧' },
  shared_id: { label: 'Shared platform ID', weight: 0.85, icon: '🆔' },
  cross_reference: { label: 'Cross-reference', weight: 0.8, icon: '↔️' },
  identity_search: { label: 'Search identity', weight: 1.0, icon: '🔍' },
};

function categorizePlatform(site: string): string {
  const siteLower = site.toLowerCase();
  for (const [category, platforms] of Object.entries(PLATFORM_CATEGORIES)) {
    if (platforms.some(p => siteLower.includes(p))) {
      return category;
    }
  }
  return 'other';
}

function extractUsername(result: ScanResult): string | null {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const candidates = [
    meta.username,
    meta.handle,
    meta.screen_name,
    meta.user,
    meta.name,
  ].filter(Boolean);
  
  // Try to extract from URL
  if (result.url) {
    try {
      const url = new URL(result.url);
      const parts = url.pathname.split('/').filter(Boolean);
      for (const part of parts) {
        const cleaned = part.replace(/[?#].*$/, '');
        if (cleaned && !/^\d+$/.test(cleaned) && cleaned.length > 1) {
          candidates.push(cleaned);
          break;
        }
      }
    } catch {}
  }
  
  return candidates[0] || null;
}

function extractImageUrl(result: ScanResult): string | null {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  return meta.avatar_url || meta.profile_image || meta.image || meta.avatar || null;
}

function normalizeUsername(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function calculateLensScore(result: ScanResult): number {
  let score = 50; // Base score
  
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const status = (result.status || '').toLowerCase();
  
  // Status certainty
  if (status === 'found') score += 20;
  else if (status === 'claimed') score += 15;
  
  // URL presence
  if (result.url) score += 10;
  
  // Metadata richness
  if (meta.bio) score += 5;
  if (meta.followers !== undefined) score += 5;
  if (meta.avatar_url || meta.profile_image) score += 5;
  if (meta.location) score += 3;
  if (meta.created_at || meta.joined) score += 2;
  
  return Math.min(100, score);
}

function getLensStatus(score: number): 'verified' | 'likely' | 'unclear' {
  if (score >= 80) return 'verified';
  if (score >= 60) return 'likely';
  return 'unclear';
}

export function useCorrelationGraph(
  results: ScanResult[],
  searchedUsername: string,
  verifiedEntities?: Map<string, any>
): CorrelationGraphData {
  return useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const categoryStats: Record<string, number> = {};
    const reasonStats: Record<EdgeReason, number> = {
      same_username: 0,
      similar_username: 0,
      same_image: 0,
      similar_bio: 0,
      shared_domain: 0,
      shared_email: 0,
      shared_id: 0,
      cross_reference: 0,
      identity_search: 0,
    };

    // Filter to found/claimed profiles
    const foundProfiles = results.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'found' || status === 'claimed';
    });

    if (foundProfiles.length === 0) {
      return {
        nodes: [],
        edges: [],
        stats: {
          totalNodes: 0,
          totalEdges: 0,
          byCategory: {},
          byReason: reasonStats,
        },
      };
    }

    // Create identity node (root)
    const identityNode: GraphNode = {
      id: 'identity-root',
      type: 'identity',
      label: searchedUsername,
      category: 'identity',
      confidence: 100,
      lensStatus: 'verified',
    };
    nodes.push(identityNode);

    // Create account nodes
    const normalizedSearch = normalizeUsername(searchedUsername);
    const usernameMap = new Map<string, string[]>(); // normalized username -> node ids
    const imageMap = new Map<string, string[]>(); // image url -> node ids
    const domainMap = new Map<string, string[]>(); // domain -> node ids

    foundProfiles.forEach((result, idx) => {
      const category = categorizePlatform(result.site || '');
      const username = extractUsername(result);
      const imageUrl = extractImageUrl(result);
      const confidence = calculateLensScore(result);
      const meta = (result.meta || result.metadata || {}) as Record<string, any>;
      
      // Check for verification status
      const verificationResult = verifiedEntities?.get(result.id);
      let lensStatus = getLensStatus(confidence);
      if (verificationResult) {
        lensStatus = verificationResult.confidenceScore >= 75 ? 'verified' :
                     verificationResult.confidenceScore >= 50 ? 'likely' : 'unclear';
      }

      const nodeId = `account-${result.id}`;
      
      const node: GraphNode = {
        id: nodeId,
        type: 'account',
        label: result.site || 'Unknown',
        platform: result.site,
        category,
        url: result.url,
        imageUrl,
        confidence,
        lensStatus,
        meta: {
          username,
          bio: meta.bio || meta.description,
          followers: meta.followers,
          location: meta.location,
          joined: meta.joined || meta.created_at,
        },
        result,
      };
      nodes.push(node);

      // Track category stats
      categoryStats[category] = (categoryStats[category] || 0) + 1;

      // Index for correlation detection
      if (username) {
        const normalized = normalizeUsername(username);
        if (!usernameMap.has(normalized)) {
          usernameMap.set(normalized, []);
        }
        usernameMap.get(normalized)!.push(nodeId);
      }

      if (imageUrl) {
        if (!imageMap.has(imageUrl)) {
          imageMap.set(imageUrl, []);
        }
        imageMap.get(imageUrl)!.push(nodeId);
      }

      // Extract domains from bio/links
      if (meta.bio || meta.website) {
        const text = `${meta.bio || ''} ${meta.website || ''}`;
        const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
        let match;
        while ((match = domainRegex.exec(text)) !== null) {
          const domain = match[1].toLowerCase();
          if (!domainMap.has(domain)) {
            domainMap.set(domain, []);
          }
          domainMap.get(domain)!.push(nodeId);
        }
      }

      // Create edge from identity to this account
      const usernameNorm = username ? normalizeUsername(username) : null;
      const isSameUsername = usernameNorm === normalizedSearch;
      const isSimilarUsername = usernameNorm && 
        (normalizedSearch.includes(usernameNorm) || usernameNorm.includes(normalizedSearch));

      let reason: EdgeReason = 'identity_search';
      if (isSameUsername) {
        reason = 'same_username';
        reasonStats.same_username++;
      } else if (isSimilarUsername) {
        reason = 'similar_username';
        reasonStats.similar_username++;
      } else {
        reasonStats.identity_search++;
      }

      const edgeConfig = EDGE_REASON_CONFIG[reason];
      edges.push({
        id: `edge-root-${nodeId}`,
        source: 'identity-root',
        target: nodeId,
        reason,
        reasonLabel: edgeConfig.label,
        weight: edgeConfig.weight,
        confidence: confidence,
      });
    });

    // Create account-to-account edges based on shared signals
    const processedPairs = new Set<string>();

    // Same username connections
    usernameMap.forEach((nodeIds) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const pairKey = [nodeIds[i], nodeIds[j]].sort().join('-');
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              reasonStats.same_username++;
              edges.push({
                id: `edge-${pairKey}`,
                source: nodeIds[i],
                target: nodeIds[j],
                reason: 'same_username',
                reasonLabel: EDGE_REASON_CONFIG.same_username.label,
                weight: EDGE_REASON_CONFIG.same_username.weight,
                confidence: 85,
              });
            }
          }
        }
      }
    });

    // Same image connections
    imageMap.forEach((nodeIds) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const pairKey = [nodeIds[i], nodeIds[j]].sort().join('-');
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              reasonStats.same_image++;
              edges.push({
                id: `edge-img-${pairKey}`,
                source: nodeIds[i],
                target: nodeIds[j],
                reason: 'same_image',
                reasonLabel: EDGE_REASON_CONFIG.same_image.label,
                weight: EDGE_REASON_CONFIG.same_image.weight,
                confidence: 90,
              });
            }
          }
        }
      }
    });

    // Shared domain connections
    domainMap.forEach((nodeIds, domain) => {
      // Skip common domains
      if (['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain)) return;
      
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const pairKey = [nodeIds[i], nodeIds[j]].sort().join('-');
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              reasonStats.shared_domain++;
              edges.push({
                id: `edge-domain-${pairKey}`,
                source: nodeIds[i],
                target: nodeIds[j],
                reason: 'shared_domain',
                reasonLabel: `${EDGE_REASON_CONFIG.shared_domain.label} (${domain})`,
                weight: EDGE_REASON_CONFIG.shared_domain.weight,
                confidence: 70,
              });
            }
          }
        }
      }
    });

    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        byCategory: categoryStats,
        byReason: reasonStats,
      },
    };
  }, [results, searchedUsername, verifiedEntities]);
}
