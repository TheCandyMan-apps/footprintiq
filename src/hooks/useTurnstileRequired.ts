import { useSubscription, type SubscriptionTier } from '@/hooks/useSubscription';

/**
 * Hook to determine if Turnstile verification is required
 * 
 * @returns { required: boolean, tier: string }
 * - required = true if not logged in OR tier === "free"
 * - required = false if tier in { "pro", "business", "enterprise" } or user is admin
 */
export function useTurnstileRequired(): { required: boolean; tier: SubscriptionTier } {
  const { user, subscriptionTier } = useSubscription();

  // Tiers that bypass Turnstile verification
  const bypassTiers: SubscriptionTier[] = ['pro', 'business', 'enterprise', 'premium', 'analyst'];

  // Required if:
  // 1. User is not authenticated (guest/unauthenticated)
  // 2. User is on free tier (or family tier which maps to free-level access)
  const isAuthenticatedWithBypassTier = !!user && bypassTiers.includes(subscriptionTier);

  return {
    required: !isAuthenticatedWithBypassTier,
    tier: subscriptionTier,
  };
}
