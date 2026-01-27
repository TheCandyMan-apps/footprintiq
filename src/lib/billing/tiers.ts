/**
 * Central tier definitions for FootprintIQ subscription system
 * Single source of truth for all plan configurations
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * MONETISATION STRATEGY (Dec 2024)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Free plan: 1 scan/month with partial results
 * - Free users see THAT exposures exist (count, categories, basic presence)
 * - Pro users see WHY and HOW (context, evidence, confidence, correlation)
 * 
 * Gated sections for Free users:
 * - Context enrichment
 * - Evidence / source detail  
 * - Confidence scoring
 * - Correlation depth
 * - Dark web indicators
 * - AI interpretation
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type PlanId = 'free' | 'pro' | 'business';

export interface PlanDefinition {
  id: PlanId;
  label: string;
  description: string;
  priceMonthly: number; // in GBP
  stripePriceId: string | null; // null for free
  monthlyScanLimit: number | null; // null = unlimited
  allowedProviders: string[]; // OSINT tools available on this plan
  features: string[]; // Human-readable feature list
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  /**
   * Free tier: Discovery • Preview
   * 1 scan/month with partial results - conversion via insight gating
   */
  free: {
    id: 'free',
    label: 'Free',
    description: 'A fast way to see what\'s publicly visible.',
    priceMonthly: 0,
    stripePriceId: null,
    monthlyScanLimit: 1, // 1 scan per month - upgrade for more
    allowedProviders: ['maigret', 'holehe'],
    features: [
      'Single digital footprint scan',
      'Username and alias discovery',
      'Public profile detection',
      'Breach exposure indicators',
      'High-level risk summary',
    ],
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    description: 'Designed for people who want clarity, not just more data.',
    priceMonthly: 14.99,
    stripePriceId: 'price_1ShgNPA3ptI9drLW40rbWMjq',
    monthlyScanLimit: 100,
    allowedProviders: ['maigret', 'sherlock', 'holehe', 'ipqs_email', 'ipqs_phone', 'perplexity_osint'],
    features: [
      '100 scans per month',
      'Advanced OSINT scans',
      'Confidence scoring & false-positive filtering',
      '✦ LENS identity verification',
      'Labeled connections graph',
      'Exposure timelines',
      'Removal guidance',
      'Continuous monitoring & alerts',
      'PDF & CSV export',
    ],
  },
  business: {
    id: 'business',
    label: 'Business',
    description: 'Teams, agencies and corporate investigators.',
    priceMonthly: 49.99,
    stripePriceId: 'price_1ShdxJA3ptI9drLWjndMjptw',
    monthlyScanLimit: null, // unlimited
    allowedProviders: ['maigret', 'sherlock', 'gosearch', 'holehe', 'ipqs_email', 'ipqs_phone', 'perplexity_osint'],
    features: [
      'Unlimited scans',
      'All multi-tool providers (incl. GoSearch)',
      'Shared workspaces',
      'Audit logs',
      'API access',
      'Case notes & tagging',
      'Early access to premium providers',
    ],
  },
};

/**
 * Resolve plan ID from Stripe price ID
 */
export function resolvePlanFromStripePrice(priceId: string | null): PlanId {
  if (!priceId) return 'free';
  if (priceId === PLANS.pro.stripePriceId) return 'pro';
  if (priceId === PLANS.business.stripePriceId) return 'business';
  return 'free';
}

/**
 * Get plan definition by ID with fallback to free
 */
export function getPlan(planId: string | null | undefined): PlanDefinition {
  if (!planId) return PLANS.free;
  // ✅ FIX: Safe normalization with fallback
  const normalizedId = (planId || 'free').toLowerCase();
  
  // Map legacy tier names
  if (normalizedId === 'premium' || normalizedId === 'analyst') {
    return PLANS.pro;
  }
  if (normalizedId === 'enterprise') {
    return PLANS.business;
  }
  
  return PLANS[normalizedId as PlanId] || PLANS.free;
}
