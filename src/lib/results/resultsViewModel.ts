/**
 * Results View Model Transformer
 * 
 * Transforms raw scan results into a view-layer model with plan-based redaction.
 * Free users see a redacted preview; Pro users see full details.
 * Raw results remain intact server-side for unlock after upgrade.
 */

import { type PlanTier, normalizePlanTier, hasCapability } from '@/lib/billing/planCapabilities';
import { filterOutProviderHealth, isProviderHealthFinding } from '@/lib/providerHealthUtils';

// ============ TYPE DEFINITIONS ============

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type BucketType = 'PublicProfiles' | 'ExposureSignals' | 'ReuseIndicators' | 'Connections';

export interface RiskSnapshot {
  status: 'clean' | 'exposed' | 'at_risk';
  riskLevel: RiskLevel;
  signalsFound: number;
  highConfidenceCount: number;
}

export interface ViewModelFinding {
  id: string;
  platform: string;
  url: string | null;
  status: string;
  confidence: number;
  /** Masked if redacted */
  evidence: string | null;
  /** Full evidence (null for Free users) */
  evidenceFull: string | null;
  /** Whether this finding is redacted */
  isRedacted: boolean;
  /** Additional metadata (null for Free on sensitive fields) */
  meta: Record<string, any> | null;
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
  /** Upgrade prompt text */
  upgradePrompt: string | null;
}

export interface ConnectionsViewModel {
  /** Visible nodes (limited for Free) */
  visibleNodes: Array<{ id: string; platform: string; isLocked: boolean }>;
  /** Total node count */
  totalNodes: number;
  /** Whether the graph is partially locked */
  isPartiallyLocked: boolean;
  /** Max visible nodes for current plan */
  maxVisibleNodes: number;
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
}

// ============ CONSTANTS ============

const FREE_BUCKET_LIMITS: Record<BucketType, number> = {
  PublicProfiles: 3,
  ExposureSignals: 2,
  ReuseIndicators: 2,
  Connections: 5,
};

const FREE_MAX_CONNECTIONS_NODES = 8;
const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
  /\+?[1-9]\d{1,14}/, // phone numbers (E.164)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // US phone format
];

// ============ HELPERS ============

function maskSensitiveData(text: string): string {
  if (!text) return text;
  
  let masked = text;
  
  // Mask emails
  masked = masked.replace(
    /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/gi,
    (_, local, domain) => {
      const maskedLocal = local.substring(0, 2) + '***';
      return `${maskedLocal}@${domain}`;
    }
  );
  
  // Mask phone numbers
  masked = masked.replace(
    /(\+?[1-9]\d{0,2})[\s.-]?(\d{3})[\s.-]?(\d{3})[\s.-]?(\d{4})/g,
    '$1 *** *** $4'
  );
  
  return masked;
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
  
  findings.forEach(finding => {
    const bucketType = classifyFinding(finding);
    const confidence = calculateConfidence(finding);
    
    bucketedFindings[bucketType].push({
      ...finding,
      _confidence: confidence,
    });
    
    signalsFound++;
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
  
  (Object.keys(bucketedFindings) as BucketType[]).forEach(bucketType => {
    const rawItems = bucketedFindings[bucketType];
    const limit = isFullAccess ? rawItems.length : FREE_BUCKET_LIMITS[bucketType];
    
    // Sort by confidence descending
    rawItems.sort((a, b) => (b._confidence || 0) - (a._confidence || 0));
    
    const visibleItems = rawItems.slice(0, limit);
    const hiddenCount = Math.max(0, rawItems.length - limit);
    
    const items: ViewModelFinding[] = visibleItems.map((finding, index) => {
      const evidenceFull = extractEvidence(finding);
      const isRedacted = !isFullAccess && index >= 1; // First item gets more detail
      
      return {
        id: finding.id,
        platform: finding.site || 'Unknown',
        url: isFullAccess ? finding.url : (index === 0 ? finding.url : null),
        status: finding.status || 'unknown',
        confidence: isFullAccess ? finding._confidence : (index === 0 ? finding._confidence : 0),
        evidence: isRedacted ? maskSensitiveData(evidenceFull) : evidenceFull,
        evidenceFull: isFullAccess ? evidenceFull : null,
        isRedacted,
        meta: isFullAccess ? (finding.meta || finding.metadata || null) : null,
      };
    });
    
    buckets[bucketType] = {
      type: bucketType,
      label: bucketLabels[bucketType],
      items,
      totalCount: rawItems.length,
      hiddenCount,
      upgradePrompt: hiddenCount > 0 
        ? `+ ${hiddenCount} more sources (Pro)`
        : null,
    };
  });
  
  // Build connections view model
  const allProfiles = bucketedFindings.PublicProfiles;
  const connectionsLimit = isFullAccess ? allProfiles.length : FREE_MAX_CONNECTIONS_NODES;
  
  const connections: ConnectionsViewModel = {
    visibleNodes: allProfiles.slice(0, connectionsLimit).map((p, i) => ({
      id: p.id,
      platform: p.site || 'Unknown',
      isLocked: !isFullAccess && i >= 3, // First 3 fully visible, rest blurred
    })),
    totalNodes: allProfiles.length,
    isPartiallyLocked: !isFullAccess && allProfiles.length > connectionsLimit,
    maxVisibleNodes: connectionsLimit,
    upgradePrompt: !isFullAccess && allProfiles.length > connectionsLimit
      ? `Unlock ${allProfiles.length - connectionsLimit} more connections with Pro`
      : null,
  };
  
  // Build risk snapshot
  const exposureCount = bucketedFindings.ExposureSignals.length;
  const riskLevel = deriveRiskLevel(signalsFound, highConfidenceCount);
  
  const riskSnapshot: RiskSnapshot = {
    status: exposureCount > 0 ? 'exposed' : (signalsFound > 0 ? 'at_risk' : 'clean'),
    riskLevel,
    signalsFound,
    highConfidenceCount,
  };
  
  return {
    plan: normalizedPlan,
    isFullAccess,
    riskSnapshot,
    buckets,
    connections,
    rawResultCount: rawResults.length,
    providerHealth,
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
