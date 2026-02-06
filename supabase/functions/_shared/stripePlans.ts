/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CANONICAL STRIPE PRICE → TIER MAPPING
 * Single source of truth for ALL billing-related edge functions
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This module is imported by:
 * - stripe-webhook/index.ts
 * - billing/webhook/index.ts  
 * - billing-sync/index.ts
 * - billing/check-subscription/index.ts
 * - billing-check-subscription/index.ts
 * 
 * When adding new Stripe prices, UPDATE THIS FILE ONLY.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * TERMINOLOGY:
 * - tier: Database value in user_roles.subscription_tier ('free' | 'premium' | 'enterprise')
 * - plan: Workspace plan name ('free' | 'pro' | 'business')
 * - frontendPlan: What the frontend shows ('pro' | 'business' | 'pro_annual')
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type WorkspacePlan = 'free' | 'pro' | 'business';

export interface PlanResolution {
  /** Database tier for user_roles.subscription_tier */
  tier: SubscriptionTier;
  /** Workspace plan name */
  plan: WorkspacePlan;
  /** Monthly scan limit (null = unlimited) */
  scanLimit: number | null;
  /** Whether this price ID was recognized */
  known: boolean;
  /** Monthly credits to grant */
  monthlyCredits: number;
}

/**
 * MASTER PRICE ID MAPPING
 * All Stripe price IDs and their corresponding tier/plan
 */
const STRIPE_PRICES: Record<string, Omit<PlanResolution, 'known'>> = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRO TIER (premium in DB, pro in workspace)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Pro Monthly - £14.99/mo
  'price_1ShgNPA3ptI9drLW40rbWMjq': {
    tier: 'premium',
    plan: 'pro',
    scanLimit: 100,
    monthlyCredits: 200,
  },
  
  // Pro Annual - £140/year (saves £40)
  'price_1Si2vkA3ptI9drLWCQrxU4Dc': {
    tier: 'premium',
    plan: 'pro',
    scanLimit: 100,
    monthlyCredits: 200,
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUSINESS / ENTERPRISE TIER (enterprise in DB, business in workspace)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Business Monthly - £49.99/mo
  'price_1ShdxJA3ptI9drLWjndMjptw': {
    tier: 'enterprise',
    plan: 'business',
    scanLimit: null, // unlimited
    monthlyCredits: 1000,
  },
  
  // Enterprise (custom pricing)
  'price_1SQh9JPNdM5SAyj722p376Qh': {
    tier: 'enterprise',
    plan: 'business',
    scanLimit: null, // unlimited
    monthlyCredits: 1000,
  },
};

/**
 * FREE TIER DEFAULTS
 */
const FREE_PLAN: PlanResolution = {
  tier: 'free',
  plan: 'free',
  scanLimit: 10,
  known: true,
  monthlyCredits: 0,
};

/**
 * Resolve a Stripe price ID to tier/plan/limits
 * 
 * CRITICAL: This function does NOT default to 'free' for unknown price IDs.
 * Instead, it returns { known: false } so callers can handle appropriately.
 * 
 * @param priceId - Stripe price ID (e.g., 'price_1ShgNPA3ptI9drLW40rbWMjq')
 * @returns PlanResolution with tier, plan, limits, and whether the price was known
 */
export function resolvePriceId(priceId: string | null | undefined): PlanResolution {
  if (!priceId) {
    return FREE_PLAN;
  }

  const config = STRIPE_PRICES[priceId];
  
  if (config) {
    return {
      ...config,
      known: true,
    };
  }

  // UNKNOWN PRICE ID - return with known: false
  // Callers should NOT downgrade users with unknown price IDs
  return {
    tier: 'free',
    plan: 'free',
    scanLimit: 10,
    known: false,
    monthlyCredits: 0,
  };
}

/**
 * Get all known price IDs for logging/debugging
 */
export function getKnownPriceIds(): string[] {
  return Object.keys(STRIPE_PRICES);
}

/**
 * Normalize frontend plan names to database tier
 * Used for verification after checkout
 * 
 * Frontend sends: 'pro', 'pro_annual', 'business', 'enterprise'
 * Database stores: 'free', 'premium', 'enterprise'
 */
export function frontendPlanToTier(frontendPlan: string): SubscriptionTier {
  const normalized = frontendPlan.toLowerCase();
  
  if (normalized === 'pro' || normalized === 'pro_annual') {
    return 'premium';
  }
  
  if (normalized === 'business' || normalized === 'enterprise') {
    return 'enterprise';
  }
  
  return 'free';
}

/**
 * Normalize database tier to frontend-friendly plan name
 * Used for display and comparison
 * 
 * Database stores: 'premium', 'enterprise'
 * Frontend expects: 'pro', 'business'
 */
export function tierToFrontendPlan(tier: SubscriptionTier): string {
  if (tier === 'premium') {
    return 'pro';
  }
  if (tier === 'enterprise') {
    return 'business';
  }
  return 'free';
}

/**
 * Check if a plan matches an expected tier (handles naming variations)
 * Used for post-checkout verification
 */
export function planMatchesTier(
  actualPlan: string | null | undefined,
  expectedFrontendPlan: string
): boolean {
  if (!actualPlan) return false;
  
  const actualNormalized = actualPlan.toLowerCase();
  const expectedTier = frontendPlanToTier(expectedFrontendPlan);
  
  // Direct match
  if (actualNormalized === expectedFrontendPlan.toLowerCase()) {
    return true;
  }
  
  // Tier-level match (premium matches pro/pro_annual, enterprise matches business)
  if (expectedTier === 'premium' && (actualNormalized === 'pro' || actualNormalized === 'premium')) {
    return true;
  }
  
  if (expectedTier === 'enterprise' && (actualNormalized === 'business' || actualNormalized === 'enterprise')) {
    return true;
  }
  
  return false;
}
