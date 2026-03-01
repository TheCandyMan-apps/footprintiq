/**
 * WhatsApp Signal Adapter
 * 
 * Modular adapter for WhatsApp OSINT signal processing.
 * Follows the same architecture as the Telegram intelligence module.
 * 
 * Produces structured signal JSON including:
 * - Presence detection
 * - Public signals (business profile, web mentions, scam DB, breaches)
 * - Cross-platform reuse indicators
 * - Experimental signals (feature-flagged)
 * - Risk contribution score
 * - Confidence rating
 * 
 * PRIVACY NOTE: Does not surface privacy settings, linked devices,
 * or any data requiring private access. Only public-source signals.
 */

import { flags } from '@/lib/featureFlags';

// ── Types ───────────────────────────────────────────────────────

export type WhatsAppSignalCategory =
  | 'presence'
  | 'business_profile'
  | 'web_mentions'
  | 'scam_db'
  | 'breach_linkage'
  | 'cross_platform'
  | 'experimental';

export type SignalConfidence = 'high' | 'medium' | 'low' | 'unverified';

export interface WhatsAppSignal {
  id: string;
  category: WhatsAppSignalCategory;
  label: string;
  value: string | boolean | number;
  confidence: SignalConfidence;
  confidenceScore: number; // 0–1 decimal
  weight: number; // contribution weight to exposure score
  proOnly: boolean;
  experimental: boolean;
  evidence?: Array<{ key: string; value: string }>;
  observedAt: string;
}

export interface WhatsAppSignalBundle {
  phoneNumber: string;
  signals: WhatsAppSignal[];
  riskContribution: number; // 0–100 weighted score
  overallConfidence: number; // 0–1 decimal
  generatedAt: string;
  featureFlags: {
    basic: boolean;
    experimental: boolean;
  };
}

export interface WhatsAppPresenceResult {
  registered: boolean;
  hasProfilePhoto: boolean;
  hasAboutText: boolean;
  isBusinessAccount: boolean;
  businessName?: string;
  businessCategory?: string;
}

export interface WhatsAppWebMention {
  source: string;
  url?: string;
  context: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WhatsAppScamDBMatch {
  database: string;
  reportCount: number;
  lastReported?: string;
  categories: string[];
}

export interface WhatsAppBreachLinkage {
  breachName: string;
  breachDate: string;
  dataTypes: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WhatsAppCrossPlatformHit {
  platform: string;
  matchType: 'phone' | 'username_correlation' | 'email_linkage';
  confidence: number;
}

// ── Weight Configuration ────────────────────────────────────────

const SIGNAL_WEIGHTS: Record<WhatsAppSignalCategory, number> = {
  presence: 10,
  business_profile: 5,
  web_mentions: 20,
  scam_db: 30,
  breach_linkage: 25,
  cross_platform: 15,
  experimental: 5,
};

const CONFIDENCE_MULTIPLIERS: Record<SignalConfidence, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
  unverified: 0.2,
};

// ── Signal Builders ─────────────────────────────────────────────

function buildPresenceSignals(presence: WhatsAppPresenceResult): WhatsAppSignal[] {
  const now = new Date().toISOString();
  const signals: WhatsAppSignal[] = [];

  signals.push({
    id: 'wa-presence-registered',
    category: 'presence',
    label: 'WhatsApp Registration',
    value: presence.registered,
    confidence: 'high',
    confidenceScore: 0.95,
    weight: SIGNAL_WEIGHTS.presence,
    proOnly: false,
    experimental: false,
    observedAt: now,
  });

  if (presence.registered) {
    signals.push({
      id: 'wa-presence-photo',
      category: 'presence',
      label: 'Profile Photo Present',
      value: presence.hasProfilePhoto,
      confidence: 'high',
      confidenceScore: 0.9,
      weight: 5,
      proOnly: false,
      experimental: false,
      observedAt: now,
    });

    signals.push({
      id: 'wa-presence-about',
      category: 'presence',
      label: 'About Text Present',
      value: presence.hasAboutText,
      confidence: 'high',
      confidenceScore: 0.9,
      weight: 3,
      proOnly: false,
      experimental: false,
      observedAt: now,
    });
  }

  return signals;
}

function buildBusinessProfileSignals(presence: WhatsAppPresenceResult): WhatsAppSignal[] {
  if (!presence.isBusinessAccount) return [];
  const now = new Date().toISOString();

  const signals: WhatsAppSignal[] = [
    {
      id: 'wa-business-detected',
      category: 'business_profile',
      label: 'Business Account Detected',
      value: true,
      confidence: 'high',
      confidenceScore: 0.95,
      weight: SIGNAL_WEIGHTS.business_profile,
      proOnly: false,
      experimental: false,
      evidence: [
        ...(presence.businessName ? [{ key: 'Business Name', value: presence.businessName }] : []),
        ...(presence.businessCategory ? [{ key: 'Category', value: presence.businessCategory }] : []),
      ],
      observedAt: now,
    },
  ];

  return signals;
}

function buildWebMentionSignals(mentions: WhatsAppWebMention[]): WhatsAppSignal[] {
  if (!mentions.length) return [];
  const now = new Date().toISOString();

  return mentions.map((mention, i) => ({
    id: `wa-webmention-${i}`,
    category: 'web_mentions' as WhatsAppSignalCategory,
    label: `Web Mention: ${mention.source}`,
    value: mention.context,
    confidence: 'medium' as SignalConfidence,
    confidenceScore: 0.6,
    weight: SIGNAL_WEIGHTS.web_mentions / Math.max(mentions.length, 1),
    proOnly: true,
    experimental: false,
    evidence: [
      { key: 'Source', value: mention.source },
      ...(mention.url ? [{ key: 'URL', value: mention.url }] : []),
      { key: 'Severity', value: mention.severity },
    ],
    observedAt: now,
  }));
}

function buildScamDBSignals(matches: WhatsAppScamDBMatch[]): WhatsAppSignal[] {
  if (!matches.length) return [];
  const now = new Date().toISOString();

  return matches.map((match, i) => ({
    id: `wa-scamdb-${i}`,
    category: 'scam_db' as WhatsAppSignalCategory,
    label: `Scam DB: ${match.database}`,
    value: match.reportCount,
    confidence: (match.reportCount >= 3 ? 'high' : 'medium') as SignalConfidence,
    confidenceScore: match.reportCount >= 3 ? 0.85 : 0.6,
    weight: SIGNAL_WEIGHTS.scam_db,
    proOnly: true,
    experimental: false,
    evidence: [
      { key: 'Database', value: match.database },
      { key: 'Report Count', value: String(match.reportCount) },
      { key: 'Categories', value: match.categories.join(', ') },
      ...(match.lastReported ? [{ key: 'Last Reported', value: match.lastReported }] : []),
    ],
    observedAt: now,
  }));
}

function buildBreachSignals(breaches: WhatsAppBreachLinkage[]): WhatsAppSignal[] {
  if (!breaches.length) return [];
  const now = new Date().toISOString();

  return breaches.map((breach, i) => ({
    id: `wa-breach-${i}`,
    category: 'breach_linkage' as WhatsAppSignalCategory,
    label: `Breach: ${breach.breachName}`,
    value: breach.dataTypes.join(', '),
    confidence: 'high' as SignalConfidence,
    confidenceScore: 0.9,
    weight: SIGNAL_WEIGHTS.breach_linkage,
    proOnly: true,
    experimental: false,
    evidence: [
      { key: 'Breach', value: breach.breachName },
      { key: 'Date', value: breach.breachDate },
      { key: 'Data Types', value: breach.dataTypes.join(', ') },
      { key: 'Severity', value: breach.severity },
    ],
    observedAt: now,
  }));
}

function buildCrossPlatformSignals(hits: WhatsAppCrossPlatformHit[]): WhatsAppSignal[] {
  if (!hits.length) return [];
  const now = new Date().toISOString();

  return hits.map((hit, i) => ({
    id: `wa-crossplatform-${i}`,
    category: 'cross_platform' as WhatsAppSignalCategory,
    label: `Cross-platform: ${hit.platform}`,
    value: hit.matchType,
    confidence: (hit.confidence >= 0.8 ? 'high' : hit.confidence >= 0.5 ? 'medium' : 'low') as SignalConfidence,
    confidenceScore: hit.confidence,
    weight: SIGNAL_WEIGHTS.cross_platform,
    proOnly: true,
    experimental: false,
    evidence: [
      { key: 'Platform', value: hit.platform },
      { key: 'Match Type', value: hit.matchType },
      { key: 'Confidence', value: `${Math.round(hit.confidence * 100)}%` },
    ],
    observedAt: now,
  }));
}

function buildExperimentalSignals(phoneNumber: string): WhatsAppSignal[] {
  if (!flags.whatsappExperimental) return [];
  const now = new Date().toISOString();

  return [
    {
      id: 'wa-exp-group-visibility',
      category: 'experimental',
      label: 'Public Group Visibility',
      value: 'Analysis pending',
      confidence: 'unverified',
      confidenceScore: 0.2,
      weight: SIGNAL_WEIGHTS.experimental,
      proOnly: true,
      experimental: true,
      observedAt: now,
    },
    {
      id: 'wa-exp-status-exposure',
      category: 'experimental',
      label: 'Status Update Exposure',
      value: 'Analysis pending',
      confidence: 'unverified',
      confidenceScore: 0.2,
      weight: SIGNAL_WEIGHTS.experimental,
      proOnly: true,
      experimental: true,
      observedAt: now,
    },
  ];
}

// ── Scoring ─────────────────────────────────────────────────────

/**
 * Calculate weighted risk contribution score (0–100)
 * contributing to the global Messaging Exposure Score.
 */
export function calculateWhatsAppRiskScore(signals: WhatsAppSignal[]): number {
  if (!signals.length) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    // Skip experimental signals from core scoring
    if (signal.experimental) continue;

    const multiplier = CONFIDENCE_MULTIPLIERS[signal.confidence];
    const effectiveWeight = signal.weight * multiplier;

    // Boolean signals: true = risk present
    const riskValue = typeof signal.value === 'boolean'
      ? (signal.value ? 1 : 0)
      : typeof signal.value === 'number'
        ? Math.min(signal.value / 10, 1) // normalize numeric signals
        : 0.5; // string signals default to moderate

    weightedSum += riskValue * effectiveWeight;
    totalWeight += effectiveWeight;
  }

  if (totalWeight === 0) return 0;

  return Math.round((weightedSum / totalWeight) * 100);
}

/**
 * Calculate overall confidence across all signals (0–1)
 */
export function calculateOverallConfidence(signals: WhatsAppSignal[]): number {
  if (!signals.length) return 0;

  const nonExperimental = signals.filter(s => !s.experimental);
  if (!nonExperimental.length) return 0;

  const sum = nonExperimental.reduce((acc, s) => acc + s.confidenceScore, 0);
  return Math.round((sum / nonExperimental.length) * 100) / 100;
}

// ── Main Adapter ────────────────────────────────────────────────

export interface WhatsAppAdapterInput {
  phoneNumber: string;
  presence?: WhatsAppPresenceResult;
  webMentions?: WhatsAppWebMention[];
  scamDBMatches?: WhatsAppScamDBMatch[];
  breachLinkages?: WhatsAppBreachLinkage[];
  crossPlatformHits?: WhatsAppCrossPlatformHit[];
}

/**
 * Process raw WhatsApp intelligence data into a structured signal bundle.
 * 
 * @example
 * ```ts
 * const bundle = processWhatsAppSignals({
 *   phoneNumber: '+1234567890',
 *   presence: { registered: true, hasProfilePhoto: true, ... },
 *   webMentions: [...],
 * });
 * ```
 */
export function processWhatsAppSignals(input: WhatsAppAdapterInput): WhatsAppSignalBundle {
  const basicEnabled = flags.whatsappBasic;
  const experimentalEnabled = flags.whatsappExperimental;

  if (!basicEnabled) {
    return {
      phoneNumber: input.phoneNumber,
      signals: [],
      riskContribution: 0,
      overallConfidence: 0,
      generatedAt: new Date().toISOString(),
      featureFlags: { basic: false, experimental: false },
    };
  }

  const signals: WhatsAppSignal[] = [];

  // Core signals (always included when basic flag is on)
  if (input.presence) {
    signals.push(...buildPresenceSignals(input.presence));
    signals.push(...buildBusinessProfileSignals(input.presence));
  }

  // Pro-tier signals
  if (input.webMentions) {
    signals.push(...buildWebMentionSignals(input.webMentions));
  }
  if (input.scamDBMatches) {
    signals.push(...buildScamDBSignals(input.scamDBMatches));
  }
  if (input.breachLinkages) {
    signals.push(...buildBreachSignals(input.breachLinkages));
  }
  if (input.crossPlatformHits) {
    signals.push(...buildCrossPlatformSignals(input.crossPlatformHits));
  }

  // Experimental signals (feature-flagged)
  signals.push(...buildExperimentalSignals(input.phoneNumber));

  const riskContribution = calculateWhatsAppRiskScore(signals);
  const overallConfidence = calculateOverallConfidence(signals);

  return {
    phoneNumber: input.phoneNumber,
    signals,
    riskContribution,
    overallConfidence,
    generatedAt: new Date().toISOString(),
    featureFlags: {
      basic: basicEnabled,
      experimental: experimentalEnabled,
    },
  };
}

/**
 * Filter signals by tier access
 */
export function getVisibleSignals(
  bundle: WhatsAppSignalBundle,
  isPro: boolean
): WhatsAppSignal[] {
  return bundle.signals.filter(s => isPro || !s.proOnly);
}

/**
 * Get signals grouped by category
 */
export function groupSignalsByCategory(
  signals: WhatsAppSignal[]
): Record<WhatsAppSignalCategory, WhatsAppSignal[]> {
  const groups: Partial<Record<WhatsAppSignalCategory, WhatsAppSignal[]>> = {};
  for (const signal of signals) {
    (groups[signal.category] ||= []).push(signal);
  }
  return groups as Record<WhatsAppSignalCategory, WhatsAppSignal[]>;
}
