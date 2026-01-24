import { useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { normalizePlanTier } from '@/lib/billing/planCapabilities';

/**
 * Hook to determine if Turnstile verification is required
 * Based on tier: Free users require verification, Pro+ bypass
 */
export function useTurnstileGating() {
  const { user, subscriptionTier } = useSubscription();

  const normalizedTier = normalizePlanTier(subscriptionTier);
  
  // Pro and Business users bypass Turnstile
  const isBypassTier = normalizedTier === 'pro' || normalizedTier === 'business';
  
  // Require Turnstile if:
  // - User is not authenticated (guest/unauthenticated)
  // - User is on free tier
  const requiresTurnstile = !user || !isBypassTier;

  const validateToken = useCallback((token: string | null): { valid: boolean; message?: string } => {
    // If bypass tier, always valid
    if (isBypassTier) {
      return { valid: true };
    }

    // If no token and Turnstile is required
    if (!token && requiresTurnstile) {
      return { 
        valid: false, 
        message: 'Please complete the verification to continue.' 
      };
    }

    return { valid: true };
  }, [isBypassTier, requiresTurnstile]);

  return {
    requiresTurnstile,
    isBypassTier,
    validateToken,
    tier: normalizedTier,
    isAuthenticated: !!user,
  };
}

/**
 * Helper to add turnstile_token to request body if present
 */
export function withTurnstileToken<T extends Record<string, unknown>>(
  body: T,
  token: string | null | undefined
): T & { turnstile_token?: string } {
  if (token) {
    return { ...body, turnstile_token: token };
  }
  return body;
}
