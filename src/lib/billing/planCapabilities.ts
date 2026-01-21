/**
 * Central Plan Capabilities Module
 * Single source of truth for ALL plan gating used by UI and backend
 */

import type { ProviderConfig } from '@/lib/providers/registry';

// ============ TYPE DEFINITIONS ============

export type PlanTier = 'free' | 'pro' | 'business';

/**
 * Legacy tier names that map to current tiers
 */
export type LegacyTierName = 'premium' | 'analyst' | 'enterprise';

/**
 * All plan capability definitions - both boolean flags and numeric limits
 */
export interface PlanCapabilities {
  // Feature toggles (boolean)
  aiInsights: boolean;
  evidencePack: boolean;
  providerToggles: boolean;
  exportsPdfCsv: boolean;
  identityGraph: boolean;
  darkWebMonitoring: boolean;
  highRiskIntelligence: boolean; // High-Risk Intelligence module (Pro+)
  batchScanning: boolean;
  apiAccess: boolean;
  auditLogs: boolean;
  sharedWorkspaces: boolean;
  priorityQueue: boolean;
  riskScoring: boolean;
  caseNotes: boolean;
  contextEnrichment: boolean;
  
  // Numeric limits (-1 = unlimited)
  phoneProvidersMax: number;
  usernameProvidersMax: number;
  emailProvidersMax: number;
  scansPerMonth: number;
  monitorsPerWorkspace: number;
  teamMembers: number;
  aiQueriesPerMonth: number;
  apiCallsPerHour: number;
}

// ============ CAPABILITIES BY PLAN ============

export const CAPABILITIES_BY_PLAN: Record<PlanTier, PlanCapabilities> = {
  free: {
    // Features
    aiInsights: false,
    evidencePack: false,
    providerToggles: false,
    exportsPdfCsv: false,
    identityGraph: false,
    darkWebMonitoring: false,
    highRiskIntelligence: false,
    batchScanning: false,
    apiAccess: false,
    auditLogs: false,
    sharedWorkspaces: false,
    priorityQueue: false,
    riskScoring: false,
    caseNotes: false,
    contextEnrichment: false,
    
    // Limits
    phoneProvidersMax: 2,
    usernameProvidersMax: 1,
    emailProvidersMax: 1,
    scansPerMonth: 1,
    monitorsPerWorkspace: 1,
    teamMembers: 1,
    aiQueriesPerMonth: 0,
    apiCallsPerHour: 0,
  },
  pro: {
    // Features
    aiInsights: true,
    evidencePack: false,
    providerToggles: true,
    exportsPdfCsv: true,
    identityGraph: false,
    darkWebMonitoring: true,
    highRiskIntelligence: true,
    batchScanning: false,
    apiAccess: false,
    auditLogs: false,
    sharedWorkspaces: false,
    priorityQueue: true,
    riskScoring: true,
    caseNotes: false,
    contextEnrichment: true,
    
    // Limits
    phoneProvidersMax: 6,
    usernameProvidersMax: 2,
    emailProvidersMax: 2,
    scansPerMonth: 100,
    monitorsPerWorkspace: 10,
    teamMembers: 1,
    aiQueriesPerMonth: 50,
    apiCallsPerHour: 100,
  },
  business: {
    // Features
    aiInsights: true,
    evidencePack: true,
    providerToggles: true,
    exportsPdfCsv: true,
    identityGraph: true,
    darkWebMonitoring: true,
    highRiskIntelligence: true,
    batchScanning: true,
    apiAccess: true,
    auditLogs: true,
    sharedWorkspaces: true,
    priorityQueue: true,
    riskScoring: true,
    caseNotes: true,
    contextEnrichment: true,
    
    // Limits (-1 = unlimited)
    phoneProvidersMax: -1,
    usernameProvidersMax: -1,
    emailProvidersMax: -1,
    scansPerMonth: -1,
    monitorsPerWorkspace: -1,
    teamMembers: -1,
    aiQueriesPerMonth: -1,
    apiCallsPerHour: -1,
  },
};

// ============ TIER HIERARCHY ============

/**
 * Tier hierarchy for access control - higher tiers inherit lower tier access
 */
export const TIER_HIERARCHY: Record<PlanTier, PlanTier[]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  business: ['free', 'pro', 'business'],
};

/**
 * Legacy tier name mappings
 */
const LEGACY_TIER_MAP: Record<string, PlanTier> = {
  premium: 'pro',
  analyst: 'pro',
  enterprise: 'business',
};

// ============ HELPER FUNCTIONS ============

/**
 * Normalize any tier string to a valid PlanTier
 * Handles legacy names, null, undefined, and case variations
 */
export function getPlanTier(user: { plan?: string | null } | null): PlanTier {
  if (!user?.plan) return 'free';
  
  const normalized = user.plan.toLowerCase().trim();
  
  // Check for legacy names first
  if (normalized in LEGACY_TIER_MAP) {
    return LEGACY_TIER_MAP[normalized];
  }
  
  // Check for valid plan tier
  if (normalized === 'free' || normalized === 'pro' || normalized === 'business') {
    return normalized as PlanTier;
  }
  
  return 'free';
}

/**
 * Normalize a raw plan string to PlanTier (simpler version for direct strings)
 */
export function normalizePlanTier(planId: string | null | undefined): PlanTier {
  return getPlanTier({ plan: planId });
}

/**
 * Check if a plan has a specific boolean capability
 */
export function hasCapability(
  plan: PlanTier,
  capability: keyof PlanCapabilities
): boolean {
  const capabilities = CAPABILITIES_BY_PLAN[plan];
  if (!capabilities) {
    console.warn(`[planCapabilities] Unknown plan tier: ${plan}, falling back to 'free'`);
    return hasCapability('free', capability);
  }
  const value = capabilities[capability];
  
  // For boolean capabilities, return the value directly
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For numeric limits, return true if > 0 or unlimited (-1)
  return value === -1 || value > 0;
}

/**
 * Get the numeric limit for a capability
 * Returns -1 for unlimited, 0 if not available
 */
export function getCapabilityLimit(
  plan: PlanTier,
  capability: keyof PlanCapabilities
): number {
  const capabilities = CAPABILITIES_BY_PLAN[plan];
  if (!capabilities) {
    console.warn(`[planCapabilities] Unknown plan tier: ${plan}, falling back to 'free'`);
    return getCapabilityLimit('free', capability);
  }
  const value = capabilities[capability];
  return typeof value === 'number' ? value : (value ? -1 : 0);
}

/**
 * Check if a plan can perform an action within its limits
 */
export function canUseLimit(
  plan: PlanTier,
  limitKey: keyof PlanCapabilities,
  currentUsage: number
): boolean {
  const limit = CAPABILITIES_BY_PLAN[plan][limitKey];
  
  // Boolean capability - check if enabled
  if (typeof limit === 'boolean') {
    return limit;
  }
  
  // Unlimited
  if (limit === -1) {
    return true;
  }
  
  // Check against limit
  return currentUsage < limit;
}

/**
 * Get all capabilities for a plan
 */
export function getCapabilities(plan: PlanTier): PlanCapabilities {
  return CAPABILITIES_BY_PLAN[plan];
}

// ============ PROVIDER ACCESS ENFORCEMENT ============

export type ProviderAccessReason = 
  | 'allowed'
  | 'tier_restricted' 
  | 'not_configured' 
  | 'limit_exceeded'
  | 'disabled';

export interface ProviderAccessResult {
  allowed: boolean;
  reason: ProviderAccessReason;
  requiredTier?: PlanTier;
  message?: string;
}

/**
 * Check if a plan tier meets the minimum tier requirement
 */
export function meetsTierRequirement(userTier: PlanTier, minTier: PlanTier): boolean {
  const allowedTiers = TIER_HIERARCHY[userTier];
  return allowedTiers.includes(minTier);
}

/**
 * Enforce provider access based on plan tier
 * Returns structured result for UI display (🔒 + tooltip)
 */
export function enforceProviderAccess(params: {
  plan: PlanTier;
  provider: Pick<ProviderConfig, 'id' | 'name' | 'minTier' | 'enabled' | 'requiresKey'>;
  isKeyConfigured?: boolean;
}): ProviderAccessResult {
  const { plan, provider, isKeyConfigured = true } = params;
  
  // Check if provider is enabled
  if (!provider.enabled) {
    return {
      allowed: false,
      reason: 'disabled',
      message: `${provider.name} is currently disabled`,
    };
  }
  
  // Check tier requirement
  if (!meetsTierRequirement(plan, provider.minTier as PlanTier)) {
    const tierLabel = provider.minTier === 'business' ? 'Business' : 'Pro';
    return {
      allowed: false,
      reason: 'tier_restricted',
      requiredTier: provider.minTier as PlanTier,
      message: `${provider.name} requires ${tierLabel} plan`,
    };
  }
  
  // Check if API key is required and configured
  if (provider.requiresKey && !isKeyConfigured) {
    return {
      allowed: false,
      reason: 'not_configured',
      message: `${provider.name} requires API key configuration`,
    };
  }
  
  return {
    allowed: true,
    reason: 'allowed',
  };
}

/**
 * Filter providers by plan tier, returning allowed and blocked lists
 */
export function filterProvidersByTier<T extends { id: string; minTier: string }>(
  providers: T[],
  userPlan: PlanTier
): { allowed: T[]; blocked: T[] } {
  const allowed: T[] = [];
  const blocked: T[] = [];
  
  for (const provider of providers) {
    if (meetsTierRequirement(userPlan, provider.minTier as PlanTier)) {
      allowed.push(provider);
    } else {
      blocked.push(provider);
    }
  }
  
  return { allowed, blocked };
}

/**
 * Get human-readable tier label
 */
export function getTierLabel(tier: PlanTier): string {
  switch (tier) {
    case 'business': return 'Business';
    case 'pro': return 'Pro';
    case 'free': return 'Free';
    default: return 'Free';
  }
}

/**
 * Get upgrade message for a required tier
 */
export function getUpgradeMessage(requiredTier: PlanTier, feature?: string): string {
  const tierLabel = getTierLabel(requiredTier);
  if (feature) {
    return `Upgrade to ${tierLabel} to unlock ${feature}`;
  }
  return `Upgrade to ${tierLabel} to access this feature`;
}
