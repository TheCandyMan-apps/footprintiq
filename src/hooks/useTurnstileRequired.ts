import { useSubscription, type SubscriptionTier } from '@/hooks/useSubscription';

// Production domains where Turnstile should be active
const PRODUCTION_HOSTNAMES = [
  'footprintiq.lovable.app',
  'footprintiq.app',
];

function isPreviewEnvironment(): boolean {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (hostname.includes('-preview--') || hostname.includes('lovableproject.com')) return true;
  return !PRODUCTION_HOSTNAMES.some(prod => hostname === prod || hostname.endsWith(`.${prod}`));
}

/**
 * Hook to determine if Turnstile verification is required
 * 
 * @returns { required: boolean, tier: string }
 * - required = false in preview/dev environments
 * - required = true if not logged in OR tier === "free"
 * - required = false if tier in { "pro", "business", "enterprise" } or user is admin
 */
export function useTurnstileRequired(): { required: boolean; tier: SubscriptionTier } {
  const { user, subscriptionTier } = useSubscription();

  // Never require Turnstile in preview/dev environments
  if (isPreviewEnvironment()) {
    return { required: false, tier: subscriptionTier };
  }

  // Tiers that bypass Turnstile verification
  const bypassTiers: SubscriptionTier[] = ['pro', 'business', 'enterprise', 'premium', 'analyst'];
  const isAuthenticatedWithBypassTier = !!user && bypassTiers.includes(subscriptionTier);

  return {
    required: !isAuthenticatedWithBypassTier,
    tier: subscriptionTier,
  };
}
