/**
 * Central tier definitions for FootprintIQ subscription system
 * Single source of truth for all plan configurations
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
  free: {
    id: 'free',
    label: 'Free',
    description: 'Perfect for quick checks and trying FootprintIQ.',
    priceMonthly: 0,
    stripePriceId: null,
    monthlyScanLimit: 10,
    allowedProviders: ['maigret'],
    features: [
      '10 scans per month',
      'Basic username scanning (Maigret)',
      'Limited results view',
    ],
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    description: 'Powerful OSINT for investigators & power users.',
    priceMonthly: 14.99,
    stripePriceId: 'price_1SIbjiA3ptI9drLWsG0noPeX',
    monthlyScanLimit: 100,
    allowedProviders: ['maigret', 'sherlock', 'holehe', 'ipqs_email', 'ipqs_phone', 'perplexity_osint'],
    features: [
      '100 scans per month',
      'Multi-tool OSINT (Maigret + Sherlock)',
      'IPQS Email & Phone Intelligence',
      'Full results view',
      'PDF & CSV export',
      'Priority queue',
      'Risk scoring',
    ],
  },
  business: {
    id: 'business',
    label: 'Business',
    description: 'Teams, agencies and corporate investigators.',
    priceMonthly: 49.99,
    stripePriceId: 'price_1SN3uIA3ptI9drLWMCDo1mAT',
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
  const normalizedId = planId.toLowerCase();
  
  // Map legacy tier names
  if (normalizedId === 'premium' || normalizedId === 'analyst') {
    return PLANS.pro;
  }
  if (normalizedId === 'enterprise') {
    return PLANS.business;
  }
  
  return PLANS[normalizedId as PlanId] || PLANS.free;
}
