import { useSubscription } from './useSubscription';
import {
  type PlanTier,
  type PlanCapabilities,
  type ProviderAccessResult,
  normalizePlanTier,
  hasCapability,
  canUseLimit,
  getCapabilities,
  getCapabilityLimit,
  enforceProviderAccess,
  getTierLabel,
  getUpgradeMessage,
} from '@/lib/billing/planCapabilities';
import type { ProviderConfig } from '@/lib/providers/registry';

interface TierGateResult {
  hasAccess: boolean;
  requiresTier: PlanTier | null;
  reason?: string;
}

// Feature to capability mapping for backwards compatibility
const FEATURE_CAPABILITY_MAP: Record<string, keyof PlanCapabilities> = {
  maigret: 'providerToggles', // Basic provider access
  darkweb: 'darkWebMonitoring',
  advanced_scan: 'providerToggles',
  batch_scan: 'batchScanning',
  ai_analyst: 'aiInsights',
  priority_support: 'priorityQueue',
  sso: 'sharedWorkspaces', // SSO is a business feature
  export: 'exportsPdfCsv',
  identity_graph: 'identityGraph',
  api_access: 'apiAccess',
  audit_logs: 'auditLogs',
};

// Features that require specific tiers (for features not in capability map)
const FEATURE_TIER_REQUIREMENTS: Record<string, PlanTier> = {
  maigret: 'free', // Maigret is available on free
  sherlock: 'pro',
  gosearch: 'business',
  sso: 'business',
  priority_support: 'business',
};

export function useTierGating() {
  const { subscriptionTier, isLoading } = useSubscription();

  const userTier = normalizePlanTier(subscriptionTier);

  const checkFeatureAccess = (feature: string): TierGateResult => {
    if (isLoading) {
      return { hasAccess: false, requiresTier: null, reason: 'Loading...' };
    }

    // Check if feature maps to a capability
    const capability = FEATURE_CAPABILITY_MAP[feature];
    if (capability) {
      const access = hasCapability(userTier, capability);
      if (access) {
        return { hasAccess: true, requiresTier: null };
      }

      // Determine required tier
      const requiredTier = FEATURE_TIER_REQUIREMENTS[feature] || 'pro';
      return {
        hasAccess: false,
        requiresTier: requiredTier,
        reason: getUpgradeMessage(requiredTier, feature),
      };
    }

    // Check direct tier requirements
    const requiredTier = FEATURE_TIER_REQUIREMENTS[feature];
    if (requiredTier) {
      const tierOrder: PlanTier[] = ['free', 'pro', 'business'];
      const userTierIndex = tierOrder.indexOf(userTier);
      const requiredTierIndex = tierOrder.indexOf(requiredTier);

      if (userTierIndex >= requiredTierIndex) {
        return { hasAccess: true, requiresTier: null };
      }

      return {
        hasAccess: false,
        requiresTier: requiredTier,
        reason: getUpgradeMessage(requiredTier, feature),
      };
    }

    // Default: allow if no specific rule
    return { hasAccess: true, requiresTier: null };
  };

  const getQuotasForTier = (tier?: PlanTier) => {
    return getCapabilities(tier || userTier);
  };

  const canPerformAction = (action: string, currentUsage?: number): boolean => {
    const capability = action as keyof PlanCapabilities;
    const capabilities = getCapabilities(userTier);

    if (!(capability in capabilities)) {
      return true; // Unknown action = allow
    }

    const limit = capabilities[capability];

    if (typeof limit === 'boolean') {
      return limit;
    }

    if (typeof limit === 'number') {
      if (limit === -1) return true; // unlimited
      if (currentUsage === undefined) return true;
      return currentUsage < limit;
    }

    return true;
  };

  const checkProviderAccess = (
    provider: Pick<ProviderConfig, 'id' | 'name' | 'minTier' | 'enabled' | 'requiresKey'>,
    isKeyConfigured?: boolean
  ): ProviderAccessResult => {
    return enforceProviderAccess({
      plan: userTier,
      provider,
      isKeyConfigured,
    });
  };

  const getLimit = (limitKey: keyof PlanCapabilities): number => {
    return getCapabilityLimit(userTier, limitKey);
  };

  return {
    subscriptionTier: userTier,
    isLoading,
    checkFeatureAccess,
    getQuotasForTier,
    canPerformAction,
    checkProviderAccess,
    getLimit,
    hasCapability: (cap: keyof PlanCapabilities) => hasCapability(userTier, cap),
    canUseLimit: (limitKey: keyof PlanCapabilities, usage: number) => 
      canUseLimit(userTier, limitKey, usage),
    getTierLabel: () => getTierLabel(userTier),
    isFree: userTier === 'free',
    isPro: userTier === 'pro',
    isBusiness: userTier === 'business',
  };
}

// Re-export types and functions for convenience
export type { PlanTier, PlanCapabilities, ProviderAccessResult };
export { getTierLabel, getUpgradeMessage, hasCapability, canUseLimit };
