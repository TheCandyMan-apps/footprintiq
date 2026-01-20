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
  reasons: EdgeReason[]; // All correlation signals
  reasonLabel: string;
  reasonLabels: string[]; // All signal labels
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
    identityEdges: number;
    correlationEdges: number;
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
          identityEdges: 0,
          correlationEdges: 0,
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

    // =========================================================================
    // STEP 1: Extract normalized signals using the advanced extraction library
    // =========================================================================
    const signalsMap = new Map<string, ReturnType<typeof extractSignals>>();
    foundProfiles.forEach(result => {
      signalsMap.set(result.id, extractSignals(result));
    });

    // Create account nodes
    const normalizedSearch = normalizeUsername(searchedUsername);
    const nodeIdMap = new Map<string, string>(); // result.id -> nodeId

    foundProfiles.forEach((result) => {
      const category = categorizePlatform(result.site || '');
      const signals = signalsMap.get(result.id)!;
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
      nodeIdMap.set(result.id, nodeId);
      
      const node: GraphNode = {
        id: nodeId,
        type: 'account',
        label: result.site || 'Unknown',
        platform: result.site,
        category,
        url: result.url,
        imageUrl: signals.profileImageUrl,
        confidence,
        lensStatus,
        meta: {
          username: signals.rawUsername,
          bio: signals.rawBio,
          followers: meta.followers,
          location: meta.location,
          joined: meta.joined || meta.created_at,
          // Include extracted signals for debugging/tooltips
          extractedDomains: signals.extractedDomains,
          extractedEmails: signals.extractedEmails,
          bioKeywords: signals.bioKeywords?.slice(0, 10),
        },
        result,
      };
      nodes.push(node);

      // Track category stats
      categoryStats[category] = (categoryStats[category] || 0) + 1;

      // Create edge from identity to this account
      const isSameUsername = signals.normalizedUsername === normalizedSearch;
      const isSimilarUsername = signals.normalizedUsername && 
        (normalizedSearch.includes(signals.normalizedUsername) || 
         signals.normalizedUsername.includes(normalizedSearch) ||
         signals.usernameVariants.includes(normalizedSearch));

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
        reasons: [reason],
        reasonLabel: edgeConfig.label,
        reasonLabels: [edgeConfig.label],
        weight: edgeConfig.weight,
        confidence: confidence,
      });
    });

    // =========================================================================
    // STEP 2: Compute account-to-account correlation edges using advanced logic
    // =========================================================================
    const MIN_WEIGHT = 0.60; // Only create edges with weight >= 0.60
    
    interface SignalData {
      reason: EdgeReason;
      weight: number;
      confidence: number;
      detail: string;
    }
    
    const pairSignals = new Map<string, SignalData[]>();
    
    // Helper to collect a signal for a pair
    const collectSignal = (
      sourceId: string,
      targetId: string,
      reason: EdgeReason,
      weight: number,
      confidence: number,
      detail: string
    ) => {
      if (weight < MIN_WEIGHT) return;
      
      const pairKey = [sourceId, targetId].sort().join('::');
      if (!pairSignals.has(pairKey)) {
        pairSignals.set(pairKey, []);
      }
      
      // Avoid duplicate signals of same reason
      const signals = pairSignals.get(pairKey)!;
      if (!signals.some(s => s.reason === reason)) {
        signals.push({ reason, weight, confidence, detail });
      }
    };

    // Use the advanced correlation computation
    const { edges: computedCorrelationEdges } = computeAllCorrelations(foundProfiles);
    
    // Map correlation edges to our format with proper edge reasons
    computedCorrelationEdges.forEach(corrEdge => {
      const sourceNodeId = nodeIdMap.get(corrEdge.sourceId);
      const targetNodeId = nodeIdMap.get(corrEdge.targetId);
      
      if (!sourceNodeId || !targetNodeId) return;
      
      // Map correlation reason to our EdgeReason type
      let reason: EdgeReason = corrEdge.reason as EdgeReason;
      
      // Map specific reasons for better labeling
      if (corrEdge.reason === 'same_username') reason = 'username_reuse';
      if (corrEdge.reason === 'same_image') reason = 'image_reuse';
      if (corrEdge.reason === 'similar_bio') reason = 'bio_similarity';
      
      collectSignal(
        sourceNodeId,
        targetNodeId,
        reason,
        corrEdge.weight,
        corrEdge.confidence,
        corrEdge.details || CORRELATION_CONFIG[corrEdge.reason]?.label || 'Correlation detected'
      );
    });

    // Also do our own index-based correlation for additional signals
    // Build indexes for faster lookup
    const usernameIndex = new Map<string, string[]>(); // normalized username -> nodeIds
    const imageIndex = new Map<string, string[]>(); // image fingerprint -> nodeIds
    const domainIndex = new Map<string, string[]>(); // domain -> nodeIds
    const emailIndex = new Map<string, string[]>(); // email -> nodeIds

    signalsMap.forEach((signals, resultId) => {
      const nodeId = nodeIdMap.get(resultId);
      if (!nodeId) return;

      // Index by normalized username
      if (signals.normalizedUsername) {
        const key = signals.normalizedUsername;
        if (!usernameIndex.has(key)) usernameIndex.set(key, []);
        usernameIndex.get(key)!.push(nodeId);
      }

      // Index by image fingerprint
      if (signals.imageFingerprint) {
        const key = signals.imageFingerprint;
        if (!imageIndex.has(key)) imageIndex.set(key, []);
        imageIndex.get(key)!.push(nodeId);
      }

      // Index by domains
      signals.extractedDomains.forEach(domain => {
        if (!domainIndex.has(domain)) domainIndex.set(domain, []);
        domainIndex.get(domain)!.push(nodeId);
      });

      // Index by emails
      signals.extractedEmails.forEach(email => {
        if (!emailIndex.has(email)) emailIndex.set(email, []);
        emailIndex.get(email)!.push(nodeId);
      });
    });

    // Collect additional signals from indexes (may add signals missed by computeAllCorrelations)
    
    // 1. Username reuse (weight: 0.90)
    usernameIndex.forEach((nodeIds, normalizedUsername) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            const node = nodes.find(n => n.id === nodeIds[i]);
            const rawUsername = node?.meta?.username || normalizedUsername;
            
            collectSignal(
              nodeIds[i],
              nodeIds[j],
              'username_reuse',
              0.90,
              90,
              `Same username "${rawUsername}"`
            );
          }
        }
      }
    });

    // 2. Image reuse (weight: 0.95)
    imageIndex.forEach((nodeIds) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            collectSignal(
              nodeIds[i],
              nodeIds[j],
              'image_reuse',
              0.95,
              95,
              'Same profile image'
            );
          }
        }
      }
    });

    // 3. Shared email (weight: 0.85)
    emailIndex.forEach((nodeIds, email) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            collectSignal(
              nodeIds[i],
              nodeIds[j],
              'shared_email',
              0.85,
              85,
              `Shared email "${email}"`
            );
          }
        }
      }
    });

    // 4. Shared domain/link (weight: 0.70)
    const COMMON_DOMAINS = new Set([
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com',
      'icloud.com', 'aol.com', 'live.com', 'msn.com', 'mail.com',
      'linktr.ee', 'linktree.com', 'bit.ly', 'goo.gl', 't.co', 'youtu.be',
    ]);
    
    domainIndex.forEach((nodeIds, domain) => {
      if (COMMON_DOMAINS.has(domain)) return;
      
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            collectSignal(
              nodeIds[i],
              nodeIds[j],
              'shared_link',
              0.70,
              70,
              `Shared link "${domain}"`
            );
          }
        }
      }
    });

    // 5. Bio similarity - use keyword overlap (weight: 0.60)
    const accountNodes = nodes.filter(n => n.type === 'account');
    const bioKeywordsMap = new Map<string, string[]>();
    
    accountNodes.forEach(node => {
      const resultId = node.result?.id;
      if (!resultId) return;
      const signals = signalsMap.get(resultId);
      if (signals && signals.bioKeywords.length >= 3) {
        bioKeywordsMap.set(node.id, signals.bioKeywords);
      }
    });
    
    const bioNodeIds = Array.from(bioKeywordsMap.keys());
    for (let i = 0; i < bioNodeIds.length; i++) {
      for (let j = i + 1; j < bioNodeIds.length; j++) {
        const keywords1 = bioKeywordsMap.get(bioNodeIds[i]) || [];
        const keywords2 = bioKeywordsMap.get(bioNodeIds[j]) || [];
        
        const set2 = new Set(keywords2);
        const intersection = keywords1.filter(k => set2.has(k));
        const union = new Set([...keywords1, ...keywords2]);
        
        if (intersection.length >= 3) {
          const similarity = intersection.length / union.size;
          const weight = 0.50 + similarity * 0.25; // 0.50 - 0.75 range
          const confidence = Math.round(50 + similarity * 40); // 50-90 range
          
          if (weight >= MIN_WEIGHT) {
            const sharedWords = intersection.slice(0, 3).join(', ');
            
            collectSignal(
              bioNodeIds[i],
              bioNodeIds[j],
              'bio_similarity',
              weight,
              confidence,
              `Similar bio ("${sharedWords}")`
            );
          }
        }
      }
    }

    // =========================================================================
    // STEP 3: Merge signals into deduplicated edges
    // =========================================================================
    pairSignals.forEach((signals, pairKey) => {
      if (signals.length === 0) return;
      
      const [sourceId, targetId] = pairKey.split('::');
      const node1 = nodes.find(n => n.id === sourceId);
      const node2 = nodes.find(n => n.id === targetId);
      
      // Sort by weight descending
      const sortedSignals = signals.sort((a, b) => b.weight - a.weight);
      
      const reasons = sortedSignals.map(s => s.reason);
      const reasonLabels = sortedSignals.map(s => EDGE_REASON_CONFIG[s.reason]?.label || s.reason);
      const primaryReason = reasons[0];
      const maxWeight = Math.max(...sortedSignals.map(s => s.weight));
      const maxConfidence = Math.max(...sortedSignals.map(s => s.confidence));
      
      // Build combined details
      const details = sortedSignals.map(s => s.detail).join(' + ');
      const platformInfo = node1?.platform && node2?.platform 
        ? ` (${node1.platform} ↔ ${node2.platform})` 
        : '';
      
      // Build reason label
      const reasonLabel = reasons.length > 1
        ? reasonLabels.join(' + ')
        : reasonLabels[0];
      
      // Update stats for all reasons
      reasons.forEach(r => reasonStats[r]++);
      
      edges.push({
        id: `edge-${pairKey}`,
        source: sourceId,
        target: targetId,
        reason: primaryReason,
        reasons,
        reasonLabel,
        reasonLabels,
        weight: maxWeight,
        confidence: maxConfidence,
        details: details + platformInfo,
      });
    });

    // Calculate identity vs correlation edge counts
    const identityEdges = edges.filter(e => e.source === 'identity-root' || e.target === 'identity-root').length;
    const correlationEdges = edges.filter(e => e.source !== 'identity-root' && e.target !== 'identity-root').length;

    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        identityEdges,
        correlationEdges,
        byCategory: categoryStats,
        byReason: reasonStats,
      },
    };
  }, [results, searchedUsername, verifiedEntities]);
}
