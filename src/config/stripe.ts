/**
 * Centralized Stripe Configuration
 * Single source of truth for all Stripe price IDs and product mappings
 */

// Subscription Plans - Monthly Recurring
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 5,
    priceId: 'price_1SQwVyPNdM5SAyj7gXDm8Mkc',
    productId: 'prod_TNhv1zVgFKGZcl',
    tier: 'free', // Maps to 'free' tier in database for basic plan
    features: [
      '3 scans per month',
      'Basic OSINT detection',
      'Email breach checking',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 15,
    priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8',
    productId: 'prod_TNhwJ5AkeLgQUk',
    tier: 'premium',
    features: [
      'Unlimited scans',
      'Advanced OSINT (100+ sources)',
      'Dark web monitoring',
      'AI-powered analysis',
      'PDF exports',
      'Priority support',
    ],
  },
  analyst: {
    name: 'Analyst',
    price: 29,
    priceId: 'price_1SQh7LPNdM5SAyj7PMKySuO6',
    productId: 'prod_TNS1YvaaS0c6MZ',
    tier: 'premium',
    features: [
      'Everything in Pro',
      'Advanced social media analysis',
      'Automated removal requests',
      'Continuous monitoring & alerts',
      'Monthly privacy reports',
    ],
  },
  professional: {
    name: 'Professional',
    price: 79,
    priceId: 'price_1SPXcEPNdM5SAyj7AbannmpP',
    productId: 'prod_TMG8KI96B257kn',
    tier: 'premium',
    features: [
      'Everything in Analyst',
      'White-label reports',
      'Custom integrations',
      'Advanced admin controls',
      'Dedicated support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    priceId: 'price_1SQh9JPNdM5SAyj722p376Qh',
    productId: 'prod_TNS31ceFOSPimB',
    tier: 'enterprise',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'API access (10,000 calls/hour)',
      'SSO authentication',
      'Custom SLA & compliance',
      '24/7 enterprise support',
    ],
  },
} as const;

// Credit Packs - One-Time Purchases
export const CREDIT_PACKS = {
  tiny: {
    name: '10 Credits',
    credits: 10,
    price: 5,
    priceId: 'price_1SQtRIPNdM5SAyj7WIxLQDeq',
    productId: 'prod_TNekJpawRbuY7d',
  },
  small: {
    name: '50 Credits',
    credits: 50,
    price: 20,
    priceId: 'price_1SQtTSPNdM5SAyj77N2cBl6B',
    productId: 'prod_TNenqeyBVhmDuj',
  },
  medium: {
    name: '100 Credits',
    credits: 100,
    price: 35,
    priceId: 'price_1SQtTfPNdM5SAyj7jrfjyTL7',
    productId: 'prod_TNenTByrDtP0DI',
  },
  starter: {
    name: 'OSINT Starter Pack',
    credits: 500,
    price: 9,
    priceId: 'price_1SRP2KPNdM5SAyj7j99PagEP',
    productId: 'prod_TOBP5MSoYtgefY',
    popular: true,
  },
  pro: {
    name: 'Pro Pack',
    credits: 2000,
    price: 29,
    priceId: 'price_1SRP2WPNdM5SAyj7GLCvttAF',
    productId: 'prod_TOBP6U1ZvowHE7',
    bestValue: true,
  },
} as const;

// Price ID to Tier Mapping (for webhook processing)
export const PRICE_TO_TIER_MAP: Record<string, 'free' | 'premium' | 'enterprise'> = {
  // Basic
  'price_1SQwVyPNdM5SAyj7gXDm8Mkc': 'free',
  
  // Pro, Analyst, Professional - all map to 'premium'
  'price_1SQwWCPNdM5SAyj7XS394cD8': 'premium',
  'price_1SQh7LPNdM5SAyj7PMKySuO6': 'premium',
  'price_1SPXcEPNdM5SAyj7AbannmpP': 'premium',
  
  // Enterprise
  'price_1SQh9JPNdM5SAyj722p376Qh': 'enterprise',
};

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.priceId === priceId);
}

// Helper function to get credit pack by price ID
export function getCreditPackByPriceId(priceId: string) {
  return Object.values(CREDIT_PACKS).find(pack => pack.priceId === priceId);
}

// Helper function to get tier by price ID
export function getTierByPriceId(priceId: string): 'free' | 'premium' | 'enterprise' | null {
  return PRICE_TO_TIER_MAP[priceId] || null;
}
