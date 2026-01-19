import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProviderStats {
  provider: string;
  avgDurationMs: number;
  sampleCount: number;
}

interface ProviderETAMap {
  [provider: string]: {
    avgDurationMs: number;
    sampleCount: number;
  };
}

/**
 * Fetches historical scan duration averages per provider from the database.
 * Used to estimate remaining time for active providers during scans.
 */
export function useProviderETAs() {
  return useQuery({
    queryKey: ['provider-etas'],
    queryFn: async (): Promise<ProviderETAMap> => {
      const { data, error } = await supabase
        .from('scan_events')
        .select('provider, duration_ms')
        .in('stage', ['complete', 'completed'])
        .not('duration_ms', 'is', null)
        .gt('duration_ms', 0);

      if (error) throw error;

      // Aggregate stats per provider
      const statsMap: Record<string, { total: number; count: number }> = {};
      
      (data || []).forEach((row) => {
        const provider = row.provider?.toLowerCase();
        const durationMs = row.duration_ms;
        
        if (!provider || !durationMs) return;
        
        if (!statsMap[provider]) {
          statsMap[provider] = { total: 0, count: 0 };
        }
        statsMap[provider].total += durationMs;
        statsMap[provider].count += 1;
      });

      const result: ProviderETAMap = {};
      Object.entries(statsMap).forEach(([provider, stats]) => {
        result[provider] = {
          avgDurationMs: Math.round(stats.total / stats.count),
          sampleCount: stats.count,
        };
      });

      return result;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Default ETA values for providers without historical data (in ms)
 */
export const DEFAULT_PROVIDER_ETAS: Record<string, number> = {
  // Username providers (typically longer)
  sherlock: 45000,
  maigret: 60000,
  gosearch: 90000,
  whatsmyname: 30000,
  
  // Email providers
  holehe: 20000,
  hibp: 2000,
  dehashed: 2000,
  clearbit: 2000,
  fullcontact: 2000,
  ipqs_email: 3000,
  perplexity_osint: 15000,
  
  // Phone providers
  abstract_phone: 2000,
  numverify: 2000,
  ipqs_phone: 2000,
  twilio_lookup: 2000,
  whatsapp_check: 2000,
  telegram_check: 2000,
  signal_check: 2000,
  phone_osint: 2000,
  truecaller: 1000,
  phone_reputation: 1000,
  phoneinfoga: 30000,
  
  // Default fallback
  default: 5000,
};

/**
 * Get the estimated duration for a provider
 */
export function getProviderETA(
  provider: string, 
  etaMap: ProviderETAMap | undefined
): number {
  const normalized = provider.toLowerCase().replace(/[_-]/g, '');
  
  // Try from historical data first
  if (etaMap) {
    // Exact match
    if (etaMap[provider.toLowerCase()]) {
      return etaMap[provider.toLowerCase()].avgDurationMs;
    }
    // Normalized match
    for (const [key, value] of Object.entries(etaMap)) {
      const normalizedKey = key.replace(/[_-]/g, '');
      if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
        return value.avgDurationMs;
      }
    }
  }
  
  // Fall back to defaults
  if (DEFAULT_PROVIDER_ETAS[provider.toLowerCase()]) {
    return DEFAULT_PROVIDER_ETAS[provider.toLowerCase()];
  }
  
  for (const [key, value] of Object.entries(DEFAULT_PROVIDER_ETAS)) {
    const normalizedKey = key.replace(/[_-]/g, '');
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      return value;
    }
  }
  
  return DEFAULT_PROVIDER_ETAS.default;
}

/**
 * Format milliseconds to a human-readable string
 */
export function formatETA(ms: number): string {
  if (ms < 1000) return '<1s';
  
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `~${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) return `~${minutes}m`;
  return `~${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate remaining ETA for active providers
 */
export function calculateRemainingETA(
  activeProviders: { name: string; startedAt?: string }[],
  etaMap: ProviderETAMap | undefined
): { totalRemainingMs: number; formatted: string } {
  if (activeProviders.length === 0) {
    return { totalRemainingMs: 0, formatted: '' };
  }

  const now = Date.now();
  let maxRemaining = 0;

  activeProviders.forEach((provider) => {
    const estimatedDuration = getProviderETA(provider.name, etaMap);
    const elapsed = provider.startedAt 
      ? now - new Date(provider.startedAt).getTime()
      : 0;
    const remaining = Math.max(0, estimatedDuration - elapsed);
    
    // Use the max remaining time (parallel execution)
    if (remaining > maxRemaining) {
      maxRemaining = remaining;
    }
  });

  return {
    totalRemainingMs: maxRemaining,
    formatted: formatETA(maxRemaining),
  };
}
