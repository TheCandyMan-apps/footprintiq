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
    period: 'month',
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
  pro_annual: {
    name: 'PRO Annual',
    price: 140,
    priceId: 'price_1Si2vkA3ptI9drLWCQrxU4Dc',
    productId: 'prod_TfNh5g6CTii7RT',
    tier: 'pro',
    currency: 'GBP',
    period: 'year',
    savings: 40,
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
    period: 'month',
    features: [
      'Unlimited scans',
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
    period: 'month',
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

// Credit Packs - One-Time Purchases (GBP)
export const CREDIT_PACKS = {
  tiny: {
    name: 'Tiny Pack',
    credits: 10,
    price: 5,
    priceId: 'price_1SiSphA3ptI9drLWm1pcbhil',
    productId: 'prod_TfoSt0BbRaMgSK',
    currency: 'GBP',
  },
  small: {
    name: 'Small Pack',
    credits: 50,
    price: 20,
    priceId: 'price_1SiSqdA3ptI9drLWHxUPXCRL',
    productId: 'prod_TfoTW7qQKqnDTM',
    currency: 'GBP',
  },
  medium: {
    name: 'Medium Pack',
    credits: 100,
    price: 35,
    priceId: 'price_1SiSqpA3ptI9drLWZps53myc',
    productId: 'prod_TfoTaND6mr0dv0',
    currency: 'GBP',
  },
  starter: {
    name: 'OSINT Starter Pack',
    credits: 500,
    price: 9,
    priceId: 'price_1SiSrBA3ptI9drLWPRWHVCrG',
    productId: 'prod_TfoUneSmcvZlLS',
    currency: 'GBP',
    popular: true,
  },
  pro: {
    name: 'Pro Pack',
    credits: 2000,
    price: 29,
    priceId: 'price_1SiSrNA3ptI9drLWyZjkEr4d',
    productId: 'prod_TfoUB6XngvrCN5',
    currency: 'GBP',
    bestValue: true,
  },
} as const;

// Price ID to Tier Mapping (for webhook processing)
export const PRICE_TO_TIER_MAP: Record<string, 'free' | 'pro' | 'business' | 'enterprise'> = {
  // Pro Monthly
  'price_1ShgNPA3ptI9drLW40rbWMjq': 'pro',
  
  // Pro Annual
  'price_1Si2vkA3ptI9drLWCQrxU4Dc': 'pro',
  
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
