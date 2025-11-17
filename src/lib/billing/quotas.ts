/**
 * Quota checking utilities for scan limits and provider gating
 */

import { PLANS, PlanId, getPlan } from './tiers';

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: 'limit_reached' | 'provider_not_allowed' | 'no_workspace';
  message?: string;
  scansUsed?: number;
  scansLimit?: number | null;
}

/**
 * Check if a workspace can run a scan based on monthly quota
 */
export function canRunScan(workspace: {
  plan?: string | null;
  scans_used_monthly?: number;
  scan_limit_monthly?: number | null;
} | null): QuotaCheckResult {
  if (!workspace) {
    return {
      allowed: false,
      reason: 'no_workspace',
      message: 'No workspace found. Please select a workspace.',
    };
  }

  const plan = getPlan(workspace.plan);
  const used = workspace.scans_used_monthly ?? 0;
  const limit = workspace.scan_limit_monthly ?? plan.monthlyScanLimit;

  // Unlimited scans (null limit)
  if (limit === null) {
    return { allowed: true, scansUsed: used, scansLimit: null };
  }

  // Check if limit reached
  if (used >= limit) {
    return {
      allowed: false,
      reason: 'limit_reached',
      message: `Monthly scan limit reached (${used}/${limit}). Upgrade to Pro or Business for more scans.`,
      scansUsed: used,
      scansLimit: limit,
    };
  }

  return { allowed: true, scansUsed: used, scansLimit: limit };
}

/**
 * Filter providers based on plan allowance
 */
export function filterProvidersForPlan(
  planId: string | null | undefined,
  requestedProviders: string[]
): {
  allowed: string[];
  blocked: string[];
} {
  const plan = getPlan(planId);
  const allowedSet = new Set(plan.allowedProviders);
  
  const allowed: string[] = [];
  const blocked: string[] = [];

  requestedProviders.forEach(provider => {
    const normalizedProvider = provider.toLowerCase();
    if (allowedSet.has(normalizedProvider)) {
      allowed.push(provider);
    } else {
      blocked.push(provider);
    }
  });

  return { allowed, blocked };
}

/**
 * Check if a specific provider is allowed for a plan
 */
export function isProviderAllowed(
  planId: string | null | undefined,
  provider: string
): boolean {
  const plan = getPlan(planId);
  return plan.allowedProviders.includes(provider.toLowerCase());
}

/**
 * Get upgrade message for blocked providers
 */
export function getProviderUpgradeMessage(
  blockedProviders: string[],
  currentPlan: string | null | undefined
): string {
  if (blockedProviders.length === 0) return '';
  
  const plan = getPlan(currentPlan);
  const providerList = blockedProviders.join(', ');
  
  if (plan.id === 'free') {
    return `${providerList} requires Pro or Business plan. Upgrade to access advanced OSINT tools.`;
  }
  if (plan.id === 'pro') {
    return `${providerList} requires Business plan for full multi-tool access.`;
  }
  
  return `${providerList} not available on your current plan.`;
}
