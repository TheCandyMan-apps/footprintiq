/**
 * Provider kill-switch mechanism
 * Allows instant disabling of problematic providers via environment variable
 * 
 * Set DISABLED_PROVIDERS="provider1,provider2,provider3" to disable providers
 */

let cachedDisabledProviders: Set<string> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Get the list of disabled providers from environment variable
 * Cached for 30 seconds to avoid repeated parsing
 */
function getDisabledProviders(): Set<string> {
  const now = Date.now();
  
  // Return cached value if still fresh
  if (cachedDisabledProviders && (now - lastCacheTime) < CACHE_TTL_MS) {
    return cachedDisabledProviders;
  }
  
  // Parse from environment
  const envValue = Deno.env.get('DISABLED_PROVIDERS') ?? '';
  const disabled = envValue
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(Boolean);
  
  cachedDisabledProviders = new Set(disabled);
  lastCacheTime = now;
  
  if (disabled.length > 0) {
    console.log('[killSwitch] Disabled providers:', Array.from(cachedDisabledProviders));
  }
  
  return cachedDisabledProviders;
}

/**
 * Check if a provider is currently disabled
 */
export function isProviderDisabled(provider: string): boolean {
  const disabled = getDisabledProviders();
  return disabled.has(provider.toLowerCase());
}

/**
 * Get list of all currently disabled providers
 */
export function getDisabledProvidersList(): string[] {
  const disabled = getDisabledProviders();
  return Array.from(disabled);
}

/**
 * Clear the disabled providers cache (useful for testing)
 */
export function clearKillSwitchCache(): void {
  cachedDisabledProviders = null;
  lastCacheTime = 0;
}
