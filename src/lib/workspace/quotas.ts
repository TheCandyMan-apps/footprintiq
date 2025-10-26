type SubscriptionTier = 'free' | 'pro' | 'analyst' | 'enterprise';

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
    scansPerMonth: 10,
    monitorsPerWorkspace: 2,
    apiCallsPerHour: 100,
    teamMembers: 1,
    retentionDays: 30,
    aiAnalystQueries: 5,
    darkWebAccess: false,
    ssoEnabled: false,
    prioritySupport: false,
  },
  pro: {
    scansPerMonth: 100,
    monitorsPerWorkspace: 10,
    apiCallsPerHour: 1000,
    teamMembers: 5,
    retentionDays: 90,
    aiAnalystQueries: 50,
    darkWebAccess: true,
    ssoEnabled: false,
    prioritySupport: false,
  },
  analyst: {
    scansPerMonth: 500,
    monitorsPerWorkspace: 50,
    apiCallsPerHour: 5000,
    teamMembers: 20,
    retentionDays: 365,
    aiAnalystQueries: 500,
    darkWebAccess: true,
    ssoEnabled: true,
    prioritySupport: true,
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

export function getQuotas(tier: SubscriptionTier): PlanQuotas {
  return PLAN_QUOTAS[tier];
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
