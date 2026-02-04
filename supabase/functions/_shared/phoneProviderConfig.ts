/**
 * Phone Provider Configuration
 * Centralized registry of phone providers with tier requirements and API key mappings
 */

import { PlanTier } from './planCapabilities.ts';

export interface PhoneProviderConfig {
  id: string;
  name: string;
  minTier: PlanTier;
  requiresKey: string | null;
  category: 'carrier' | 'messaging' | 'risk' | 'broker' | 'osint' | 'caller_id';
  enabled: boolean;
  creditCost: number;
}

/**
 * Phone provider registry with tier requirements and API key mappings
 * - minTier: minimum plan required to use this provider
 * - requiresKey: environment variable name for API key (null if no key needed)
 * - category: provider category for UI grouping
 */
export const PHONE_PROVIDERS: PhoneProviderConfig[] = [
  // Carrier Intelligence (Free tier - AbstractAPI)
  {
    id: 'abstract_phone',
    name: 'Phone Intelligence',
    minTier: 'free',
    requiresKey: 'ABSTRACTAPI_PHONE_VALIDATION_KEY',
    category: 'carrier',
    enabled: true,
    creditCost: 1,
  },
  {
    id: 'numverify',
    name: 'Numverify',
    minTier: 'pro',
    requiresKey: 'NUMVERIFY_API_KEY',
    category: 'carrier',
    enabled: true,
    creditCost: 2,
  },
  {
    id: 'twilio_lookup',
    name: 'Twilio Lookup',
    minTier: 'pro',
    requiresKey: 'TWILIO_API_KEY',
    category: 'carrier',
    enabled: true,
    creditCost: 2,
  },

  // Risk Intelligence (Pro tier - API-based)
  {
    id: 'ipqs_phone',
    name: 'IPQS Phone',
    minTier: 'pro',
    requiresKey: 'IPQS_API_KEY',
    category: 'risk',
    enabled: true,
    creditCost: 2,
  },

  // Messaging Presence (pro tier)
  {
    id: 'whatsapp_check',
    name: 'WhatsApp Check',
    minTier: 'pro',
    requiresKey: null,
    category: 'messaging',
    enabled: true,
    creditCost: 1,
  },
  {
    id: 'telegram_check',
    name: 'Telegram Check',
    minTier: 'pro',
    requiresKey: null,
    category: 'messaging',
    enabled: true,
    creditCost: 1,
  },
  {
    id: 'signal_check',
    name: 'Signal Check',
    minTier: 'pro',
    requiresKey: null,
    category: 'messaging',
    enabled: true,
    creditCost: 1,
  },

  // Advanced OSINT (business tier)
  {
    id: 'phone_osint',
    name: 'Phone OSINT',
    minTier: 'business',
    requiresKey: null,
    category: 'osint',
    enabled: true,
    creditCost: 3,
  },
  {
    id: 'truecaller',
    name: 'TrueCaller',
    minTier: 'business',
    requiresKey: 'TRUECALLER_API_KEY',
    category: 'caller_id',
    enabled: true,
    creditCost: 3,
  },
  {
    id: 'phone_reputation',
    name: 'Phone Reputation',
    minTier: 'business',
    requiresKey: null,
    category: 'risk',
    enabled: true,
    creditCost: 2,
  },
  {
    id: 'caller_hint',
    name: 'CallerHint',
    minTier: 'business',
    requiresKey: 'CALLERHINT_API_KEY',
    category: 'caller_id',
    enabled: true,
    creditCost: 2,
  },
];

/**
 * Get a phone provider by ID
 */
export function getPhoneProvider(providerId: string): PhoneProviderConfig | undefined {
  return PHONE_PROVIDERS.find(p => p.id === providerId);
}

/**
 * Get all phone providers for a given tier
 */
export function getPhoneProvidersForTier(tier: PlanTier): PhoneProviderConfig[] {
  const tierHierarchy: Record<PlanTier, PlanTier[]> = {
    free: ['free'],
    pro: ['free', 'pro'],
    business: ['free', 'pro', 'business'],
  };
  
  const allowedTiers = tierHierarchy[tier];
  return PHONE_PROVIDERS.filter(p => allowedTiers.includes(p.minTier));
}

/**
 * Check if a provider's API key is configured in environment
 */
export function isProviderKeyConfigured(provider: PhoneProviderConfig): boolean {
  if (!provider.requiresKey) return true;
  return !!Deno.env.get(provider.requiresKey);
}

/**
 * Get the required tier label for display
 */
export function getRequiredTierLabel(minTier: PlanTier): string {
  switch (minTier) {
    case 'business': return 'Business';
    case 'pro': return 'Pro';
    default: return 'Free';
  }
}
