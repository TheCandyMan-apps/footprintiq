/**
 * Central Plan Capabilities Module (Backend)
 * Mirrors src/lib/billing/planCapabilities.ts for edge function enforcement
 */

// ============ TYPE DEFINITIONS ============

export type PlanTier = 'free' | 'pro' | 'business';

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
    phoneProvidersMax: 2,
    usernameProvidersMax: 1,
    emailProvidersMax: 1,
    scansPerMonth: 10,
    monitorsPerWorkspace: 1,
    teamMembers: 1,
    aiQueriesPerMonth: 0,
    apiCallsPerHour: 0,
  },
  pro: {
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

export const TIER_HIERARCHY: Record<PlanTier, PlanTier[]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  business: ['free', 'pro', 'business'],
};

const LEGACY_TIER_MAP: Record<string, PlanTier> = {
  premium: 'pro',
  analyst: 'pro',
  enterprise: 'business',
};

// ============ HELPER FUNCTIONS ============

export function normalizePlanTier(planId: string | null | undefined): PlanTier {
  if (!planId) return 'free';
  
  const normalized = planId.toLowerCase().trim();
  
  if (normalized in LEGACY_TIER_MAP) {
    return LEGACY_TIER_MAP[normalized];
  }
  
  if (normalized === 'free' || normalized === 'pro' || normalized === 'business') {
    return normalized as PlanTier;
  }
  
  return 'free';
}

export function hasCapability(
  plan: PlanTier,
  capability: keyof PlanCapabilities
): boolean {
  const capabilities = CAPABILITIES_BY_PLAN[plan];
  const value = capabilities[capability];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return value === -1 || value > 0;
}

export function getCapabilityLimit(
  plan: PlanTier,
  capability: keyof PlanCapabilities
): number {
  const value = CAPABILITIES_BY_PLAN[plan][capability];
  return typeof value === 'number' ? value : (value ? -1 : 0);
}

export function canUseLimit(
  plan: PlanTier,
  limitKey: keyof PlanCapabilities,
  currentUsage: number
): boolean {
  const limit = CAPABILITIES_BY_PLAN[plan][limitKey];
  
  if (typeof limit === 'boolean') {
    return limit;
  }
  
  if (limit === -1) {
    return true;
  }
  
  return currentUsage < limit;
}

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

export function meetsTierRequirement(userTier: PlanTier, minTier: PlanTier): boolean {
  const allowedTiers = TIER_HIERARCHY[userTier];
  return allowedTiers.includes(minTier);
}

export function enforceProviderAccess(params: {
  plan: PlanTier;
  provider: { id: string; name: string; minTier: string; enabled: boolean; requiresKey?: string };
  isKeyConfigured?: boolean;
}): ProviderAccessResult {
  const { plan, provider, isKeyConfigured = true } = params;
  
  if (!provider.enabled) {
    return {
      allowed: false,
      reason: 'disabled',
      message: `${provider.name} is currently disabled`,
    };
  }
  
  if (!meetsTierRequirement(plan, provider.minTier as PlanTier)) {
    const tierLabel = provider.minTier === 'business' ? 'Business' : 'Pro';
    return {
      allowed: false,
      reason: 'tier_restricted',
      requiredTier: provider.minTier as PlanTier,
      message: `${provider.name} requires ${tierLabel} plan`,
    };
  }
  
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

export function getTierLabel(tier: PlanTier): string {
  switch (tier) {
    case 'business': return 'Business';
    case 'pro': return 'Pro';
    case 'free': return 'Free';
    default: return 'Free';
  }
}

export function getUpgradeMessage(requiredTier: PlanTier, feature?: string): string {
  const tierLabel = getTierLabel(requiredTier);
  if (feature) {
    return `Upgrade to ${tierLabel} to unlock ${feature}`;
  }
  return `Upgrade to ${tierLabel} to access this feature`;
}
