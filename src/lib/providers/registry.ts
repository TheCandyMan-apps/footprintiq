/**
 * Unified Provider Registry
 * Single source of truth for ALL scan providers across all scan types
 * Supports plan-based access, credit costs, and API key requirements
 */

import type { PlanTier } from '@/lib/billing/planCapabilities';

export type ScanType = 'username' | 'phone' | 'email' | 'domain';
export type ProviderCategory = 'carrier' | 'messaging' | 'osint' | 'risk' | 'broker' | 'breach' | 'social';
export type ProviderStatus = 'success' | 'failed' | 'not_configured' | 'tier_restricted' | 'skipped' | 'pending';

export interface ProviderConfig {
  id: string;
  name: string;
  description: string;
  scanType: ScanType;
  creditCost: number;
  minTier: PlanTier;
  category: ProviderCategory;
  requiresKey?: string;
  enabled: boolean;
}

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
 * Complete provider registry
 */
export const PROVIDER_REGISTRY: ProviderConfig[] = [
  // ============ PHONE PROVIDERS ============
  // Pro tier (API-based carrier intelligence)
  {
    id: 'abstract_phone',
    name: 'Carrier Intel',
    description: 'Line type, country, carrier identification',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'pro',
    category: 'carrier',
    requiresKey: 'ABSTRACTAPI_PHONE_VALIDATION_KEY',
    enabled: true,
  },
  {
    id: 'numverify',
    name: 'NumVerify',
    description: 'Phone validation & numbering plan',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'pro',
    category: 'carrier',
    requiresKey: 'NUMVERIFY_API_KEY',
    enabled: true,
  },
  {
    id: 'ipqs_phone',
    name: 'IPQS Phone',
    description: 'Fraud scoring & VOIP detection',
    scanType: 'phone',
    creditCost: 3,
    minTier: 'pro',
    category: 'risk',
    requiresKey: 'IPQS_API_KEY',
    enabled: true,
  },
  {
    id: 'twilio_lookup',
    name: 'Twilio Lookup',
    description: 'Carrier & line type verification',
    scanType: 'phone',
    creditCost: 3,
    minTier: 'pro',
    category: 'carrier',
    requiresKey: 'TWILIO_API_KEY',
    enabled: true,
  },

  // Pro tier (messaging presence) - no API keys required, use free detection
  {
    id: 'whatsapp_check',
    name: 'WhatsApp Check',
    description: 'WhatsApp registration presence',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'pro',
    category: 'messaging',
    enabled: true,
  },
  {
    id: 'telegram_check',
    name: 'Telegram Check',
    description: 'Telegram registration presence',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'pro',
    category: 'messaging',
    enabled: true,
  },
  {
    id: 'signal_check',
    name: 'Signal Check',
    description: 'Signal presence (boolean)',
    scanType: 'phone',
    creditCost: 1,
    minTier: 'pro',
    category: 'messaging',
    enabled: true,
  },

  // Business tier (OSINT & reputation)
  {
    id: 'phone_osint',
    name: 'Phone OSINT',
    description: 'Public mentions, forums, classifieds',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'business',
    category: 'osint',
    enabled: true,
  },
  {
    id: 'truecaller',
    name: 'TrueCaller',
    description: 'Caller ID hints & name fragments',
    scanType: 'phone',
    creditCost: 3,
    minTier: 'business',
    category: 'osint',
    requiresKey: 'TRUECALLER_API_KEY',
    enabled: true,
  },
  {
    id: 'phone_reputation',
    name: 'Reputation Check',
    description: 'Spam/scam indicators & risk signals',
    scanType: 'phone',
    creditCost: 2,
    minTier: 'business',
    category: 'risk',
    enabled: true,
  },
  {
    id: 'caller_hint',
    name: 'Caller Hint',
    description: 'Caller ID hints & business listings',
    scanType: 'phone',
    creditCost: 3,
    minTier: 'business',
    category: 'osint',
    requiresKey: 'CALLERHINT_API_KEY',
    enabled: true,
  },

  // ============ USERNAME PROVIDERS ============
  {
    id: 'maigret',
    name: 'Maigret',
    description: 'Username enumeration across 500+ sites',
    scanType: 'username',
    creditCost: 1,
    minTier: 'free',
    category: 'social',
    enabled: true,
  },
  {
    id: 'sherlock',
    name: 'Sherlock',
    description: 'Social media username search',
    scanType: 'username',
    creditCost: 1,
    minTier: 'pro',
    category: 'social',
    enabled: true,
  },
  {
    id: 'gosearch',
    name: 'GoSearch',
    description: 'Advanced username intelligence',
    scanType: 'username',
    creditCost: 2,
    minTier: 'business',
    category: 'osint',
    enabled: true,
  },

  // ============ EMAIL PROVIDERS ============
  {
    id: 'holehe',
    name: 'Holehe',
    description: 'Email registration checks',
    scanType: 'email',
    creditCost: 1,
    minTier: 'free',
    category: 'breach',
    enabled: true,
  },
  {
    id: 'abstract_email',
    name: 'Abstract Email',
    description: 'Email validation & deliverability',
    scanType: 'email',
    creditCost: 1,
    minTier: 'pro',
    category: 'carrier',
    requiresKey: 'ABSTRACTAPI_EMAIL_VERIFICATION_KEY',
    enabled: true,
  },
  {
    id: 'ipqs_email',
    name: 'IPQS Email',
    description: 'Fraud scoring & disposable detection',
    scanType: 'email',
    creditCost: 2,
    minTier: 'pro',
    category: 'risk',
    requiresKey: 'IPQS_API_KEY',
    enabled: true,
  },
  {
    id: 'hibp',
    name: 'Have I Been Pwned',
    description: 'Breach database lookup',
    scanType: 'email',
    creditCost: 2,
    minTier: 'pro',
    category: 'breach',
    requiresKey: 'HIBP_API_KEY',
    enabled: true,
  },
  {
    id: 'abstract_email_reputation',
    name: 'Email Reputation',
    description: 'Quality scoring, abuse & spam trap detection',
    scanType: 'email',
    creditCost: 1,
    minTier: 'free',
    category: 'risk',
    requiresKey: 'ABSTRACTAPI_EMAIL_REPUTATION_KEY',
    enabled: true,
  },
];

// ============ UTILITY FUNCTIONS ============

/**
 * Tier hierarchy for access control
 */
const TIER_HIERARCHY: Record<PlanTier, PlanTier[]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  business: ['free', 'pro', 'business'],
};

/**
 * Get providers for a specific scan type
 */
export function getProvidersForScanType(scanType: ScanType): ProviderConfig[] {
  return PROVIDER_REGISTRY.filter((p) => p.scanType === scanType);
}

/**
 * Get providers available for a user's plan
 */
export function getProvidersForPlan(
  scanType: ScanType,
  userPlan: PlanTier
): { available: ProviderConfig[]; locked: ProviderConfig[] } {
  const allProviders = getProvidersForScanType(scanType);
  const allowedTiers = TIER_HIERARCHY[userPlan] || TIER_HIERARCHY.free;

  const available = allProviders.filter((p) => allowedTiers.includes(p.minTier));
  const locked = allProviders.filter((p) => !allowedTiers.includes(p.minTier));

  return { available, locked };
}

/**
 * Check if a provider is available for a plan
 */
export function isProviderAvailableForPlan(
  providerId: string,
  userPlan: PlanTier
): boolean {
  const provider = PROVIDER_REGISTRY.find((p) => p.id === providerId);
  if (!provider) return false;

  const allowedTiers = TIER_HIERARCHY[userPlan] || TIER_HIERARCHY.free;
  return allowedTiers.includes(provider.minTier);
}

/**
 * Calculate total credit cost for selected providers
 */
export function calculateTotalCredits(providerIds: string[]): number {
  return PROVIDER_REGISTRY
    .filter((p) => providerIds.includes(p.id))
    .reduce((sum, p) => sum + p.creditCost, 0);
}

/**
 * Get default enabled providers for a plan and scan type
 */
export function getDefaultProviders(scanType: ScanType, userPlan: PlanTier): string[] {
  const { available } = getProvidersForPlan(scanType, userPlan);
  return available.filter((p) => p.enabled).map((p) => p.id);
}

/**
 * Filter requested providers to only those allowed by plan
 */
export function filterProvidersByPlan(
  providerIds: string[],
  userPlan: PlanTier
): { allowed: string[]; blocked: string[] } {
  const allowed: string[] = [];
  const blocked: string[] = [];

  for (const id of providerIds) {
    if (isProviderAvailableForPlan(id, userPlan)) {
      allowed.push(id);
    } else {
      blocked.push(id);
    }
  }

  return { allowed, blocked };
}

/**
 * Group providers by category
 */
export function groupProvidersByCategory(
  providers: ProviderConfig[]
): Record<ProviderCategory, ProviderConfig[]> {
  return providers.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = [];
    }
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<ProviderCategory, ProviderConfig[]>);
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(category: ProviderCategory): string {
  const labels: Record<ProviderCategory, string> = {
    carrier: 'Carrier Intelligence',
    messaging: 'Messaging Presence',
    osint: 'OSINT Sources',
    risk: 'Risk Analysis',
    broker: 'Data Brokers',
    breach: 'Breach Detection',
    social: 'Social Media',
  };
  return labels[category] || category;
}

/**
 * Get tier label for display
 */
export function getProviderTierLabel(minTier: PlanTier): string {
  switch (minTier) {
    case 'pro':
      return 'Pro';
    case 'business':
      return 'Business';
    default:
      return '';
  }
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): ProviderConfig | undefined {
  return PROVIDER_REGISTRY.find((p) => p.id === id);
}

/**
 * Storage key for persisted provider selection (includes plan tier)
 */
export function getProviderStorageKey(scanType: ScanType, plan?: PlanTier): string {
  return plan 
    ? `footprintiq_${scanType}_${plan}_providers`
    : `footprintiq_${scanType}_providers`;
}

/**
 * Load persisted provider selection from localStorage
 */
export function loadPersistedProviders(scanType: ScanType, plan?: PlanTier): string[] | null {
  try {
    const stored = localStorage.getItem(getProviderStorageKey(scanType, plan));
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
export function persistProviders(scanType: ScanType, providerIds: string[], plan?: PlanTier): void {
  try {
    localStorage.setItem(getProviderStorageKey(scanType, plan), JSON.stringify(providerIds));
  } catch {
    // Ignore storage errors
  }
}
