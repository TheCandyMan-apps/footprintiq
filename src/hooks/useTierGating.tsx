import { useSubscription } from './useSubscription';
import { hasFeatureAccess, getQuotas } from '@/lib/workspace/quotas';
import type { SubscriptionTier } from '@/lib/workspace/quotas';

interface TierGateResult {
  hasAccess: boolean;
  requiresTier: SubscriptionTier | null;
  reason?: string;
}

export function useTierGating() {
  const { subscriptionTier, isLoading } = useSubscription();

  const checkFeatureAccess = (feature: string): TierGateResult => {
    if (isLoading) {
      return { hasAccess: false, requiresTier: null, reason: 'Loading...' };
    }

    const tier = subscriptionTier as SubscriptionTier;
    const hasAccess = hasFeatureAccess(tier, feature);

    if (hasAccess) {
      return { hasAccess: true, requiresTier: null };
    }

    // Determine required tier for this feature
    let requiresTier: SubscriptionTier = 'pro';
    let reason = 'Upgrade to Pro to access this feature';

    switch (feature) {
      case 'maigret':
        requiresTier = 'pro';
        reason = 'Maigret username scanning requires Pro or Enterprise';
        break;
      case 'darkweb':
        requiresTier = 'pro';
        reason = 'Dark web monitoring requires Pro or Enterprise';
        break;
      case 'advanced_scan':
        requiresTier = 'pro';
        reason = 'Advanced scanning features require Pro or Enterprise';
        break;
      case 'batch_scan':
        requiresTier = 'enterprise';
        reason = 'Batch scanning is an Enterprise-only feature';
        break;
      case 'ai_analyst':
        requiresTier = 'pro';
        reason = 'AI Analyst requires Pro or Enterprise';
        break;
      case 'priority_support':
        requiresTier = 'enterprise';
        reason = 'Priority support is available for Enterprise customers';
        break;
      case 'sso':
        requiresTier = 'enterprise';
        reason = 'SSO is an Enterprise-only feature';
        break;
    }

    return { hasAccess: false, requiresTier, reason };
  };

  const getQuotasForTier = (tier?: SubscriptionTier) => {
    return getQuotas(tier || (subscriptionTier as SubscriptionTier));
  };

  const canPerformAction = (action: string, currentUsage?: number): boolean => {
    const tier = subscriptionTier as SubscriptionTier;
    const quotas = getQuotas(tier);
    
    const actionKey = action as keyof typeof quotas;
    const limit = quotas[actionKey];

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

  return {
    subscriptionTier: subscriptionTier as SubscriptionTier,
    isLoading,
    checkFeatureAccess,
    getQuotasForTier,
    canPerformAction,
    isFree: subscriptionTier === 'free',
    isPro: subscriptionTier === 'pro',
    isEnterprise: subscriptionTier === 'enterprise',
  };
}
