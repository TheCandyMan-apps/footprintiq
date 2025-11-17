export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

// Legacy tiers that map to their new equivalents
export type LegacySubscriptionTier = SubscriptionTier | 'premium' | 'analyst' | 'family';

interface PlanQuotas {
  scansPerMonth: number;
  monitorsPerWorkspace: number;
  apiCallsPerHour: number;
  teamMembers: number;
  retentionDays: number;
  aiAnalystQueries: number;
  darkWebAccess: boolean;
  ssoEnabled: boolean;
  prioritySupport: boolean;
}

export const PLAN_QUOTAS: Record<SubscriptionTier, PlanQuotas> = {
  free: {
    scansPerMonth: 5,
    monitorsPerWorkspace: 1,
    apiCallsPerHour: 0,
    teamMembers: 1,
    retentionDays: 30,
    aiAnalystQueries: 0,
    darkWebAccess: false,
    ssoEnabled: false,
    prioritySupport: false,
  },
  pro: {
    scansPerMonth: 100,
    monitorsPerWorkspace: 10,
    apiCallsPerHour: 1000,
    teamMembers: 1,
    retentionDays: 90,
    aiAnalystQueries: 50,
    darkWebAccess: true,
    ssoEnabled: false,
    prioritySupport: false,
  },
  business: {
    scansPerMonth: 500,
    monitorsPerWorkspace: 20,
    apiCallsPerHour: 5000,
    teamMembers: 5,
    retentionDays: 180,
    aiAnalystQueries: 200,
    darkWebAccess: true,
    ssoEnabled: false,
    prioritySupport: false,
  },
  enterprise: {
    scansPerMonth: -1, // unlimited
    monitorsPerWorkspace: -1,
    apiCallsPerHour: 10000,
    teamMembers: -1,
    retentionDays: 730,
    aiAnalystQueries: -1,
    darkWebAccess: true,
    ssoEnabled: true,
    prioritySupport: true,
  },
};

// Credit costs per scan type
export const SCAN_CREDITS: Record<string, number> = {
  basic: 1,
  advanced: 5,
  maigret: 3,
  darkweb: 10,
  batch: 2,
};

export function getQuotas(tier: LegacySubscriptionTier): PlanQuotas {
  // Map legacy tiers to their new equivalents
  let normalizedTier: SubscriptionTier = tier as SubscriptionTier;
  if (tier === 'premium' || tier === 'analyst' || tier === 'family') {
    normalizedTier = 'pro';
  }
  return PLAN_QUOTAS[normalizedTier];
}

export function hasFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  const quotas = getQuotas(tier);
  
  switch (feature) {
    case 'maigret':
    case 'darkweb':
    case 'reverse_image_search':
      return quotas.darkWebAccess;
    case 'advanced_scan':
      return tier !== 'free';
    case 'batch_scan':
      return tier === 'business' || tier === 'enterprise';
    case 'ai_analyst':
      return quotas.aiAnalystQueries > 0;
    case 'priority_support':
      return quotas.prioritySupport;
    case 'sso':
      return quotas.ssoEnabled;
    case 'api_access':
      return tier === 'business' || tier === 'enterprise';
    case 'team_members':
      return tier === 'business' || tier === 'enterprise';
    default:
      return true;
  }
}

export function getScanCost(tier: SubscriptionTier, scanType: string): number {
  // Enterprise gets unlimited scans
  if (tier === 'enterprise') return 0;
  
  return SCAN_CREDITS[scanType] || SCAN_CREDITS.basic;
}

export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof PlanQuotas,
  currentUsage?: number
): boolean {
  const quotas = getQuotas(tier);
  const limit = quotas[action];

  if (typeof limit === 'boolean') {
    return limit;
  }

  if (typeof limit === 'number') {
    if (limit === -1) return true; // unlimited
    if (currentUsage === undefined) return true; // no usage tracking
    return currentUsage < limit;
  }

  return false;
}
