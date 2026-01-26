/**
 * Results View Model Transformer
 * 
 * Transforms raw scan results into a view-layer model with plan-based redaction.
 * Free users see a redacted preview; Pro users see full details.
 * 
 * CRITICAL: Raw results are ALWAYS stored server-side unchanged.
 * This transformer only affects UI rendering - upgrading unlocks
 * the already-run results without re-running any providers.
 */

import { type PlanTier, normalizePlanTier, hasCapability } from '@/lib/billing/planCapabilities';
import { filterOutProviderHealth, isProviderHealthFinding } from '@/lib/providerHealthUtils';
import { maskEmail, maskPhone, maskEvidence, maskUrl, maskUsername } from '@/lib/mask';

// ============ TYPE DEFINITIONS ============

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type BucketType = 'PublicProfiles' | 'ExposureSignals' | 'ReuseIndicators' | 'Connections';

export interface RiskSnapshot {
  status: 'clean' | 'exposed' | 'at_risk';
  riskLevel: RiskLevel;
  signalsFound: number;
  highConfidenceCount: number;
  /** Confidence percentage (hidden for Free) */
  confidencePercentage: number | null;
}

export interface ViewModelFinding {
  id: string;
  platform: string;
  url: string | null;
  status: string;
  /** Confidence score (0 for Free on non-primary items) */
  confidence: number;
  /** Masked if redacted */
  evidence: string | null;
  /** Full evidence (null for Free users) */
  evidenceFull: string | null;
  /** Whether this finding is redacted */
  isRedacted: boolean;
  /** Whether this is a preview item (first 1-2) */
  isPreview: boolean;
  /** Additional metadata (null for Free on sensitive fields) */
  meta: Record<string, any> | null;
  /** Provider name (hidden for Free) */
  provider: string | null;
}

export interface ViewModelBucket {
  type: BucketType;
  label: string;
  /** Visible findings (limited for Free) */
  items: ViewModelFinding[];
  /** Total count (including hidden) */
  totalCount: number;
  /** Number of hidden items */
  hiddenCount: number;
  /** Example items shown in preview (1-2) */
  previewCount: number;
  /** Upgrade prompt text */
  upgradePrompt: string | null;
}

export interface ConnectionsViewModel {
  /** Visible nodes (limited for Free) */
  visibleNodes: Array<{
    id: string;
    platform: string;
    isLocked: boolean;
    /** Label shown (masked for locked nodes) */
    displayLabel: string | null;
  }>;
  /** Total node count */
  totalNodes: number;
  /** Whether the graph is partially locked */
  isPartiallyLocked: boolean;
  /** Max visible nodes for current plan */
  maxVisibleNodes: number;
  /** Number of unlabeled/blurred nodes */
  blurredCount: number;
  /** Upgrade prompt */
  upgradePrompt: string | null;
}

export interface ResultsViewModel {
  plan: PlanTier;
  isFullAccess: boolean;
  riskSnapshot: RiskSnapshot;
  buckets: Record<BucketType, ViewModelBucket>;
  connections: ConnectionsViewModel;
  /** Raw result count for reference */
  rawResultCount: number;
  /** Provider health findings (not redacted) */
  providerHealth: any[];
  /** Total hidden findings across all buckets */
  totalHiddenCount: number;
  /** Whether user can unlock by upgrading (always true for Free) */
  canUnlock: boolean;
}

// ============ CONSTANTS ============

const FREE_BUCKET_LIMITS: Record<BucketType, number> = {
  PublicProfiles: 2,   // Show only 2 examples
  ExposureSignals: 1,  // Show only 1 example
  ReuseIndicators: 1,  // Show only 1 example
  Connections: 3,      // Show only 3 nodes
};

const FREE_PREVIEW_COUNTS: Record<BucketType, number> = {
  PublicProfiles: 2,
  ExposureSignals: 1,
  ReuseIndicators: 1,
  Connections: 3,
};

const FREE_MAX_CONNECTIONS_NODES = 5;
const FREE_VISIBLE_CONNECTIONS = 3; // Only first 3 have labels

// ============ HELPERS ============

/**
 * Mask sensitive data in evidence strings using centralized mask utilities
 */
function maskSensitiveData(text: string): string {
  if (!text) return text;
  return maskEvidence(text);
}

function classifyFinding(finding: any): BucketType {
  const kind = (finding.kind || '').toLowerCase();
  const provider = (finding.provider || '').toLowerCase();
  const site = (finding.site || '').toLowerCase();
  
  // Breach/exposure detection
  const exposureKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised', 'exposure', 'paste'];
  if (exposureKeywords.some(k => kind.includes(k) || provider.includes(k) || site.includes(k))) {
    return 'ExposureSignals';
  }
  
  // Reuse indicators (password reuse, credential stuffing potential)
  const reuseKeywords = ['reuse', 'credential', 'password', 'combo'];
  if (reuseKeywords.some(k => kind.includes(k) || provider.includes(k))) {
    return 'ReuseIndicators';
  }
  
  // Profile presence = public profiles
  if (kind === 'profile_presence' || kind === 'presence.hit' || kind === 'account_found') {
    return 'PublicProfiles';
  }
  
  // Default to public profiles for found accounts
  const status = (finding.status || '').toLowerCase();
  if (status === 'found' || status === 'claimed') {
    return 'PublicProfiles';
  }
  
  return 'PublicProfiles';
}

function calculateConfidence(finding: any): number {
  // Use existing lens score if available
  if (finding.lensScore) return finding.lensScore;
  
  let score = 50; // Base score
  
  const status = (finding.status || '').toLowerCase();
  if (status === 'found') score += 30;
  else if (status === 'claimed') score += 15;
  
  // Has URL = more reliable
  if (finding.url) score += 10;
  
  // Has metadata = more reliable
  const meta = finding.meta || finding.metadata || {};
  if (Object.keys(meta).length > 2) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function deriveRiskLevel(signals: number, highConfidence: number): RiskLevel {
  if (signals === 0) return 'low';
  if (highConfidence >= 5 || signals >= 10) return 'critical';
  if (highConfidence >= 3 || signals >= 5) return 'high';
  if (highConfidence >= 1 || signals >= 2) return 'moderate';
  return 'low';
}

function extractEvidence(finding: any): string {
  const parts: string[] = [];
  
  // Evidence array
  if (Array.isArray(finding.evidence)) {
    finding.evidence.forEach((e: any) => {
      if (e.value && typeof e.value === 'string') {
        parts.push(`${e.key}: ${e.value}`);
      }
    });
  }
  
  // Meta fields
  const meta = finding.meta || finding.metadata || {};
  if (meta.bio) parts.push(`Bio: ${meta.bio}`);
  if (meta.email) parts.push(`Email: ${meta.email}`);
  if (meta.name) parts.push(`Name: ${meta.name}`);
  
  return parts.join(' | ') || 'No additional evidence';
}

// ============ MAIN TRANSFORMER ============

/**
 * Transform raw scan results into a plan-aware view model
 * 
 * Free plan redaction rules:
 * - Show summary counts and high-confidence indicators
 * - Show only 1-2 example findings per category
 * - Mask sensitive values (emails, phones, IDs)
 * - Hide full provider lists and evidence details
 * - Hide confidence scores and percentages
 * - Render connections in preview mode (few unlabeled nodes, rest blurred)
 * - Show labels like "+ N more results (Pro)" where applicable
 * 
 * Pro/Admin: Full unredacted access
 */
export function buildResultsViewModel(
  rawResults: any[],
  plan: PlanTier | string
): ResultsViewModel {
  const normalizedPlan = normalizePlanTier(plan);
  const isFullAccess = normalizedPlan === 'pro' || normalizedPlan === 'business';
  
  // Separate provider health from actual findings
  const providerHealth = rawResults.filter(isProviderHealthFinding);
  const findings = filterOutProviderHealth(rawResults);
  
  // Classify findings into buckets
  const bucketedFindings: Record<BucketType, any[]> = {
    PublicProfiles: [],
    ExposureSignals: [],
    ReuseIndicators: [],
    Connections: [],
  };
  
  let signalsFound = 0;
  let highConfidenceCount = 0;
  let totalConfidence = 0;
  
  findings.forEach(finding => {
    const bucketType = classifyFinding(finding);
    const confidence = calculateConfidence(finding);
    
    bucketedFindings[bucketType].push({
      ...finding,
      _confidence: confidence,
    });
    
    signalsFound++;
    totalConfidence += confidence;
    if (confidence >= 75) highConfidenceCount++;
  });
  
  // Build view model buckets with redaction
  const buckets: Record<BucketType, ViewModelBucket> = {} as any;
  
  const bucketLabels: Record<BucketType, string> = {
    PublicProfiles: 'Public Profiles',
    ExposureSignals: 'Exposure Signals',
    ReuseIndicators: 'Reuse Indicators',
    Connections: 'Connections',
  };
  
  let totalHiddenCount = 0;
  
  (Object.keys(bucketedFindings) as BucketType[]).forEach(bucketType => {
    const rawItems = bucketedFindings[bucketType];
    const limit = isFullAccess ? rawItems.length : FREE_BUCKET_LIMITS[bucketType];
    const previewCount = isFullAccess ? rawItems.length : FREE_PREVIEW_COUNTS[bucketType];
    
    // Sort by confidence descending
    rawItems.sort((a, b) => (b._confidence || 0) - (a._confidence || 0));
    
    const visibleItems = rawItems.slice(0, limit);
    const hiddenCount = Math.max(0, rawItems.length - limit);
    totalHiddenCount += hiddenCount;
    
    const items: ViewModelFinding[] = visibleItems.map((finding, index) => {
      const evidenceFull = extractEvidence(finding);
      const isPreview = index < previewCount;
      // For Free: only first item gets partial detail, rest are more redacted
      const isRedacted = !isFullAccess && index >= 1;
      
      // Mask URL for Free users on non-preview items
      let displayUrl = finding.url;
      if (!isFullAccess && !isPreview && finding.url) {
        displayUrl = maskUrl(finding.url);
      }
      
      return {
        id: finding.id,
        platform: finding.site || 'Unknown',
        url: isFullAccess ? finding.url : displayUrl,
        status: finding.status || 'unknown',
        // Hide confidence for Free users except on first item
        confidence: isFullAccess ? finding._confidence : (isPreview ? finding._confidence : 0),
        evidence: isRedacted ? maskSensitiveData(evidenceFull) : evidenceFull,
        evidenceFull: isFullAccess ? evidenceFull : null,
        isRedacted,
        isPreview,
        meta: isFullAccess ? (finding.meta || finding.metadata || null) : null,
        // Hide provider names for Free users
        provider: isFullAccess ? (finding.provider || null) : null,
      };
    });
    
    buckets[bucketType] = {
      type: bucketType,
      label: bucketLabels[bucketType],
      items,
      totalCount: rawItems.length,
      hiddenCount,
      previewCount: Math.min(previewCount, visibleItems.length),
      upgradePrompt: hiddenCount > 0 
        ? `+ ${hiddenCount} more (Pro)`
        : null,
    };
  });
  
  // Build connections view model with more aggressive redaction for Free
  const allProfiles = bucketedFindings.PublicProfiles;
  const connectionsLimit = isFullAccess ? allProfiles.length : FREE_MAX_CONNECTIONS_NODES;
  const labelLimit = isFullAccess ? allProfiles.length : FREE_VISIBLE_CONNECTIONS;
  
  const visibleNodes = allProfiles.slice(0, connectionsLimit).map((p, i) => {
    const isLocked = !isFullAccess && i >= labelLimit;
    return {
      id: p.id,
      platform: p.site || 'Unknown',
      isLocked,
      // For Free: only first 3 nodes show labels, rest are blurred
      displayLabel: isLocked ? null : (p.site || 'Unknown'),
    };
  });
  
  const blurredCount = visibleNodes.filter(n => n.isLocked).length;
  const lockedCount = Math.max(0, allProfiles.length - connectionsLimit);
  
  const connections: ConnectionsViewModel = {
    visibleNodes,
    totalNodes: allProfiles.length,
    isPartiallyLocked: !isFullAccess && (blurredCount > 0 || lockedCount > 0),
    maxVisibleNodes: connectionsLimit,
    blurredCount,
    upgradePrompt: !isFullAccess && allProfiles.length > labelLimit
      ? `Unlock ${allProfiles.length - labelLimit} more connections with Pro`
      : null,
  };
  
  // Build risk snapshot
  const exposureCount = bucketedFindings.ExposureSignals.length;
  const riskLevel = deriveRiskLevel(signalsFound, highConfidenceCount);
  
  // Calculate average confidence (hidden for Free)
  const avgConfidence = signalsFound > 0 ? Math.round(totalConfidence / signalsFound) : 0;
  
  const riskSnapshot: RiskSnapshot = {
    status: exposureCount > 0 ? 'exposed' : (signalsFound > 0 ? 'at_risk' : 'clean'),
    riskLevel,
    signalsFound,
    highConfidenceCount,
    // Hide confidence percentage for Free users
    confidencePercentage: isFullAccess ? avgConfidence : null,
  };
  
  return {
    plan: normalizedPlan,
    isFullAccess,
    riskSnapshot,
    buckets,
    connections,
    rawResultCount: rawResults.length,
    providerHealth,
    totalHiddenCount,
    canUnlock: !isFullAccess && signalsFound > 0,
  };
}

// ============ REDACTION UTILITIES ============

/**
 * Check if confidence details should be shown
 */
export function shouldShowConfidenceDetails(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

/**
 * Get the upgrade prompt for a specific feature
 */
export function getFeatureUpgradePrompt(feature: string): string {
  const prompts: Record<string, string> = {
    confidence: 'Confidence scoring available in Pro',
    fullEvidence: 'Full evidence details available in Pro',
    allSources: 'View all sources with Pro',
    connections: 'Unlock full connection graph with Pro',
    export: 'Export capabilities available in Pro',
  };
  return prompts[feature] || 'Upgrade to Pro for full access';
}

/**
 * Get bucket visibility limits for a plan
 */
export function getBucketLimits(plan: PlanTier): Record<BucketType, number> {
  if (plan === 'pro' || plan === 'business') {
    return {
      PublicProfiles: Infinity,
      ExposureSignals: Infinity,
      ReuseIndicators: Infinity,
      Connections: Infinity,
    };
  }
  return FREE_BUCKET_LIMITS;
}
