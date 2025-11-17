// Billing configuration for FootprintIQ subscription tiers

export type PlanId = 'free' | 'pro' | 'business';

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  monthlyScanLimit: number;
  allowedProviders: string[];
  stripePriceId?: string;
  features: string[];
  priceMonthly?: number;
  currency: string;
}

// Get Stripe price IDs from environment variables
const getStripePriceId = (plan: PlanId): string | undefined => {
  const priceIds = {
    free: undefined, // Free plan has no Stripe price
    pro: import.meta.env.VITE_STRIPE_PRICE_PRO,
    business: import.meta.env.VITE_STRIPE_PRICE_BUSINESS,
  };
  return priceIds[plan];
};

// Plan configurations
export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out FootprintIQ',
    monthlyScanLimit: 5,
    allowedProviders: ['maigret'], // Only basic username scanning
    features: [
      '5 scans per month',
      'Basic username scanning',
      'Limited results view',
    ],
    currency: 'GBP',
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    description: 'For professionals needing comprehensive OSINT',
    monthlyScanLimit: 100,
    allowedProviders: ['maigret', 'sherlock', 'gosearch', 'holehe'], // Multi-tool OSINT
    stripePriceId: getStripePriceId('pro'),
    priceMonthly: 19,
    features: [
      '100 scans per month',
      'Multi-tool OSINT engine (Sherlock + GoSearch)',
      'Email & domain scanning',
      'Full results view',
      'PDF & CSV export',
      'Priority queue',
      'Risk scoring',
    ],
    currency: 'GBP',
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For teams requiring advanced features',
    monthlyScanLimit: 500,
    allowedProviders: ['maigret', 'sherlock', 'gosearch', 'holehe', 'spiderfoot'], // All providers
    stripePriceId: getStripePriceId('business'),
    priceMonthly: 49,
    features: [
      '500 scans per month',
      'All multi-tool providers',
      '5 team seats',
      'Shared workspaces',
      'Audit logs',
      'API access',
      'Case notes & tagging',
      'Early access to premium providers',
    ],
    currency: 'GBP',
  },
};

/**
 * Get plan configuration by plan ID
 */
export function getPlanConfig(plan: PlanId): PlanConfig {
  return PLAN_CONFIGS[plan];
}

/**
 * Get default plan configuration (free tier)
 */
export function getDefaultPlan(): PlanConfig {
  return PLAN_CONFIGS.free;
}

/**
 * Check if a provider is allowed for a given plan
 */
export function isProviderAllowed(plan: PlanId, provider: string): boolean {
  const config = getPlanConfig(plan);
  return config.allowedProviders.includes(provider.toLowerCase());
}

/**
 * Filter providers based on plan allowance
 */
export function filterAllowedProviders(plan: PlanId, requestedProviders: string[]): {
  allowed: string[];
  blocked: string[];
} {
  const config = getPlanConfig(plan);
  const allowed: string[] = [];
  const blocked: string[] = [];

  requestedProviders.forEach(provider => {
    if (config.allowedProviders.includes(provider.toLowerCase())) {
      allowed.push(provider);
    } else {
      blocked.push(provider);
    }
  });

  return { allowed, blocked };
}

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanId | null {
  const entry = Object.entries(PLAN_CONFIGS).find(
    ([_, config]) => config.stripePriceId === priceId
  );
  return entry ? (entry[0] as PlanId) : null;
}
