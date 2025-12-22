/**
 * Phone scan provider configuration
 * Single source of truth for phone provider tiers and credit costs
 */

export type PhoneProviderTier = 'basic' | 'medium' | 'advanced';
export type ProviderStatus = 'success' | 'failed' | 'not_configured' | 'tier_restricted' | 'skipped';

export interface PhoneProviderConfig {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  tier: PhoneProviderTier;
  category: 'carrier' | 'messaging' | 'osint' | 'risk';
  enabled: boolean;
  /** Environment variable name required for this provider (optional = can run without it) */
  requiresKey?: string;
}

export const PHONE_PROVIDERS: PhoneProviderConfig[] = [
  // Tier 1 - Basic (carrier & line intelligence)
  {
    id: 'abstract_phone',
    name: 'Carrier Intel',
    description: 'Line type, country, carrier identification',
    creditCost: 2,
    tier: 'basic',
    category: 'carrier',
    enabled: true,
    requiresKey: 'ABSTRACTAPI_PHONE_VALIDATION_KEY',
  },
  {
    id: 'numverify',
    name: 'NumVerify',
    description: 'Phone validation & numbering plan',
    creditCost: 2,
    tier: 'basic',
    category: 'carrier',
    enabled: true,
    requiresKey: 'NUMVERIFY_API_KEY',
  },
  {
    id: 'ipqs_phone',
    name: 'IPQS Phone',
    description: 'Fraud scoring & VOIP detection',
    creditCost: 3,
    tier: 'basic',
    category: 'risk',
    enabled: true,
    requiresKey: 'IPQS_API_KEY',
  },
  {
    id: 'twilio_lookup',
    name: 'Twilio Lookup',
    description: 'Carrier & line type verification',
    creditCost: 3,
    tier: 'basic',
    category: 'carrier',
    enabled: true,
    requiresKey: 'TWILIO_API_KEY',
  },

  // Tier 2 - Medium (messaging presence) - no API keys required
  {
    id: 'whatsapp_check',
    name: 'WhatsApp Check',
    description: 'WhatsApp registration presence',
    creditCost: 2,
    tier: 'medium',
    category: 'messaging',
    enabled: true,
    // No API key required - uses free detection
  },
  {
    id: 'telegram_check',
    name: 'Telegram Check',
    description: 'Telegram registration presence',
    creditCost: 2,
    tier: 'medium',
    category: 'messaging',
    enabled: true,
    // No API key required - uses free detection
  },
  {
    id: 'signal_check',
    name: 'Signal Check',
    description: 'Signal presence (boolean)',
    creditCost: 1,
    tier: 'medium',
    category: 'messaging',
    enabled: true,
    // No API key required - uses free detection
  },

  // Tier 3 - Advanced (OSINT & reputation)
  {
    id: 'phone_osint',
    name: 'Phone OSINT',
    description: 'Public mentions, forums, classifieds',
    creditCost: 2,
    tier: 'advanced',
    category: 'osint',
    enabled: true,
    // No API key required - uses aggregated sources
  },
  {
    id: 'truecaller',
    name: 'TrueCaller',
    description: 'Caller ID hints & name fragments',
    creditCost: 3,
    tier: 'advanced',
    category: 'osint',
    enabled: true,
    requiresKey: 'TRUECALLER_API_KEY',
  },
  {
    id: 'phone_reputation',
    name: 'Reputation Check',
    description: 'Spam/scam indicators & risk signals',
    creditCost: 2,
    tier: 'advanced',
    category: 'risk',
    enabled: true,
    // No API key required - uses aggregated sources
  },
  {
    id: 'caller_hint',
    name: 'Caller Hint',
    description: 'Caller ID hints & business listings',
    creditCost: 3,
    tier: 'advanced',
    category: 'osint',
    enabled: true,
    requiresKey: 'CALLERHINT_API_KEY',
  },
];

/**
 * Terminal statuses that indicate a provider is done (scan should not wait)
 */
export const TERMINAL_PROVIDER_STATUSES: ProviderStatus[] = [
  'success',
  'failed',
  'not_configured',
  'tier_restricted',
  'skipped',
];

/**
 * Check if a provider status is terminal (scan can complete)
 */
export function isTerminalStatus(status: ProviderStatus): boolean {
  return TERMINAL_PROVIDER_STATUSES.includes(status);
}

/**
 * Get providers available for a given user tier
 */
export function getProvidersForTier(userTier: PhoneProviderTier): PhoneProviderConfig[] {
  const tierHierarchy: Record<PhoneProviderTier, PhoneProviderTier[]> = {
    basic: ['basic'],
    medium: ['basic', 'medium'],
    advanced: ['basic', 'medium', 'advanced'],
  };

  const allowedTiers = tierHierarchy[userTier];
  return PHONE_PROVIDERS.filter((p) => allowedTiers.includes(p.tier));
}

/**
 * Calculate total credit cost for selected providers
 */
export function calculateTotalCredits(providerIds: string[]): number {
  return PHONE_PROVIDERS
    .filter((p) => providerIds.includes(p.id))
    .reduce((sum, p) => sum + p.creditCost, 0);
}

/**
 * Get default enabled providers for a tier
 */
export function getDefaultProviders(userTier: PhoneProviderTier): string[] {
  const availableProviders = getProvidersForTier(userTier);
  return availableProviders.filter((p) => p.enabled).map((p) => p.id);
}

/**
 * Storage key for persisted provider selection
 */
export const PHONE_PROVIDER_STORAGE_KEY = 'footprintiq_phone_providers';

/**
 * Load persisted provider selection from localStorage
 */
export function loadPersistedProviders(): string[] | null {
  try {
    const stored = localStorage.getItem(PHONE_PROVIDER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Persist provider selection to localStorage
 */
export function persistProviders(providerIds: string[]): void {
  try {
    localStorage.setItem(PHONE_PROVIDER_STORAGE_KEY, JSON.stringify(providerIds));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Map subscription tier to phone provider tier
 */
export function mapSubscriptionToPhoneTier(subscriptionTier: string | null): PhoneProviderTier {
  switch (subscriptionTier?.toLowerCase()) {
    case 'business':
    case 'enterprise':
      return 'advanced';
    case 'pro':
    case 'analyst':
      return 'medium';
    default:
      return 'basic';
  }
}

/**
 * Group providers by category for UI display
 */
export function groupProvidersByCategory(providers: PhoneProviderConfig[]): Record<string, PhoneProviderConfig[]> {
  return providers.reduce((acc, provider) => {
    const category = provider.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {} as Record<string, PhoneProviderConfig[]>);
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    carrier: 'Carrier Intelligence',
    messaging: 'Messaging Presence',
    osint: 'OSINT Sources',
    risk: 'Risk Analysis',
  };
  return labels[category] || category;
}
