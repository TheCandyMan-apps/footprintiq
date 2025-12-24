/**
 * Centralized Stripe Configuration
 * Single source of truth for all Stripe price IDs and product mappings
 */

// Subscription Plans - Monthly Recurring
export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'PRO',
    price: 14.99,
    priceId: 'price_1ShgNPA3ptI9drLW40rbWMjq',
    productId: 'prod_Tf0OnPtxra5eM9',
    tier: 'pro',
    currency: 'GBP',
    features: [
      '100 scans per month',
      'Multi-tool OSINT engine (Sherlock + GoSearch)',
      'Email & domain scanning',
      'Full results view',
      'PDF & CSV export',
      'Priority queue',
      'Risk scoring',
    ],
  },
  business: {
    name: 'Business',
    price: 49.99,
    priceId: 'price_1ShdxJA3ptI9drLWjndMjptw',
    productId: 'prod_Textge6NbkyUmf',
    tier: 'business',
    currency: 'GBP',
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
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    priceId: 'price_1SQh9JPNdM5SAyj722p376Qh',
    productId: 'prod_TNS31ceFOSPimB',
    tier: 'enterprise',
    currency: 'GBP',
    features: [
      'Unlimited scans',
      'White-label reporting',
      'Dedicated support',
      'Private cloud / on-prem',
      'SLA & security reviews',
      'Custom provider integrations',
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
export const PRICE_TO_TIER_MAP: Record<string, 'free' | 'pro' | 'business' | 'enterprise'> = {
  // Pro
  'price_1ShgNPA3ptI9drLW40rbWMjq': 'pro',
  
  // Business
  'price_1ShdxJA3ptI9drLWjndMjptw': 'business',
  
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
export function getTierByPriceId(priceId: string): 'free' | 'pro' | 'business' | 'enterprise' | null {
  return PRICE_TO_TIER_MAP[priceId] || null;
}
