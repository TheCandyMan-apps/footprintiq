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
  shared_domain: { label: 'Shared link/domain', weight: 0.7, icon: '🔗' },
  shared_link: { label: 'Shared link', weight: 0.7, icon: '🔗' },
  shared_email: { label: 'Shared email', weight: 0.85, icon: '📧' },
  shared_id: { label: 'Shared platform ID', weight: 0.85, icon: '🆔' },
  cross_reference: { label: 'Cross-reference', weight: 0.8, icon: '↔️' },
  username_reuse: { label: 'Username reuse', weight: 0.9, icon: '🔁' },
  image_reuse: { label: 'Image reuse', weight: 0.95, icon: '🖼️' },
  bio_similarity: { label: 'Bio similarity', weight: 0.6, icon: '📝' },
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
      shared_link: 0,
      shared_email: 0,
      shared_id: 0,
      cross_reference: 0,
      username_reuse: 0,
      image_reuse: 0,
      bio_similarity: 0,
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
    const MIN_CONFIDENCE = 60; // Only generate edges >= 60% confidence

    // Helper to add an edge with deduplication
    const addAccountEdge = (
      sourceId: string,
      targetId: string,
      reason: EdgeReason,
      confidence: number,
      details: string
    ) => {
      if (confidence < MIN_CONFIDENCE) return;
      
      const pairKey = [sourceId, targetId].sort().join('-');
      const edgeKey = `${pairKey}-${reason}`;
      
      if (!processedPairs.has(edgeKey)) {
        processedPairs.add(edgeKey);
        const config = EDGE_REASON_CONFIG[reason];
        reasonStats[reason]++;
        
        edges.push({
          id: `edge-${reason}-${pairKey}`,
          source: sourceId,
          target: targetId,
          reason,
          reasonLabel: config.label,
          weight: config.weight,
          confidence,
          details,
        });
      }
    };

    // Get node data for signal extraction
    const getNodeData = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      return node ? {
        username: node.meta?.username as string | undefined,
        bio: node.meta?.bio as string | undefined,
        platform: node.platform,
        imageUrl: node.imageUrl,
      } : null;
    };

    // 1. Username reuse edges (weight: 0.9)
    usernameMap.forEach((nodeIds, normalizedUsername) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const node1 = getNodeData(nodeIds[i]);
            const node2 = getNodeData(nodeIds[j]);
            const rawUsername = node1?.username || normalizedUsername;
            
            addAccountEdge(
              nodeIds[i],
              nodeIds[j],
              'username_reuse',
              90,
              `Same username "${rawUsername}" used on ${node1?.platform || 'platform'} and ${node2?.platform || 'platform'}`
            );
          }
        }
      }
    });

    // 2. Image reuse edges (weight: 0.95)
    imageMap.forEach((nodeIds) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const node1 = getNodeData(nodeIds[i]);
            const node2 = getNodeData(nodeIds[j]);
            
            addAccountEdge(
              nodeIds[i],
              nodeIds[j],
              'image_reuse',
              95,
              `Same profile image detected on ${node1?.platform || 'platform'} and ${node2?.platform || 'platform'}`
            );
          }
        }
      }
    });

    // 3. Shared domain/link edges (weight: 0.7)
    const COMMON_DOMAINS = new Set([
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com',
      'icloud.com', 'aol.com', 'live.com', 'msn.com', 'mail.com',
      'linktr.ee', 'linktree.com', 'bit.ly', 'goo.gl', 't.co',
    ]);
    
    domainMap.forEach((nodeIds, domain) => {
      // Skip common/non-distinctive domains
      if (COMMON_DOMAINS.has(domain)) return;
      
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const node1 = getNodeData(nodeIds[i]);
            const node2 = getNodeData(nodeIds[j]);
            
            addAccountEdge(
              nodeIds[i],
              nodeIds[j],
              'shared_link',
              70,
              `Shared link to "${domain}" found in ${node1?.platform || 'platform'} and ${node2?.platform || 'platform'} profiles`
            );
          }
        }
      }
    });

    // 4. Bio similarity edges (weight: 0.6)
    // Simple keyword-based similarity for bio text
    const accountNodes = nodes.filter(n => n.type === 'account');
    const bioKeywordsMap = new Map<string, string[]>();
    
    // Extract keywords from bios
    accountNodes.forEach(node => {
      const bio = (node.meta?.bio as string) || '';
      if (bio.length >= 20) {
        const keywords = bio
          .toLowerCase()
          .replace(/https?:\/\/[^\s]+/g, '')
          .replace(/[@#]\w+/g, '')
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 4)
          .filter(w => !['the', 'and', 'for', 'with', 'that', 'this', 'have', 'from', 'they', 'been', 'about', 'would', 'their', 'will', 'what', 'when', 'where', 'which', 'your', 'just', 'more', 'some', 'than', 'them', 'into', 'only'].includes(w));
        
        if (keywords.length >= 3) {
          bioKeywordsMap.set(node.id, [...new Set(keywords)]);
        }
      }
    });
    
    // Compare bios pairwise
    const bioNodeIds = Array.from(bioKeywordsMap.keys());
    for (let i = 0; i < bioNodeIds.length; i++) {
      for (let j = i + 1; j < bioNodeIds.length; j++) {
        const keywords1 = bioKeywordsMap.get(bioNodeIds[i]) || [];
        const keywords2 = bioKeywordsMap.get(bioNodeIds[j]) || [];
        
        const set1 = new Set(keywords1);
        const set2 = new Set(keywords2);
        const intersection = keywords1.filter(k => set2.has(k));
        const union = new Set([...keywords1, ...keywords2]);
        
        if (intersection.length >= 3) {
          const similarity = intersection.length / union.size;
          const confidence = Math.round(60 + similarity * 30); // 60-90% range
          
          if (confidence >= MIN_CONFIDENCE) {
            const node1 = getNodeData(bioNodeIds[i]);
            const node2 = getNodeData(bioNodeIds[j]);
            const sharedWords = intersection.slice(0, 4).join(', ');
            
            addAccountEdge(
              bioNodeIds[i],
              bioNodeIds[j],
              'bio_similarity',
              confidence,
              `Similar bio content: shared keywords "${sharedWords}" between ${node1?.platform || 'platform'} and ${node2?.platform || 'platform'}`
            );
          }
        }
      }
    }

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
