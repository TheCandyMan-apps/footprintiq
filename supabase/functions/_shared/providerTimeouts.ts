/**
 * Provider-specific timeout configuration
 * 
 * Defines maximum execution time for each OSINT provider.
 * Timeout values are based on typical Cloud Run worker execution times
 * plus a safety buffer to prevent premature scan failures.
 */

export const PROVIDER_TIMEOUTS: Record<string, number> = {
  // Username scanners - reduced timeouts for edge function compatibility
  // Edge functions have 50s hard limit, so max provider timeout should be ~35s
  'maigret': 35000,       // 35 seconds - prioritize speed over completeness
  'sherlock': 35000,      // 35 seconds - reduced from 180s for edge function compat
  'whatsmyname': 30000,   // 30 seconds - legacy alias for sherlock
  'gosearch': 35000,      // 35 seconds for sync portion (async job handles the rest)
  
  // Breach & identity providers - API calls, faster
  'hibp': 15000,          // 15 seconds - Have I Been Pwned API
  'dehashed': 15000,      // 15 seconds - DeHashed API
  'holehe': 25000,        // 25 seconds - multiple email registrations
  
  // Enrichment providers - API calls
  'hunter': 15000,        // 15 seconds - Hunter.io API
  'clearbit': 15000,      // 15 seconds - Clearbit API
  'fullcontact': 15000,   // 15 seconds - FullContact API
  
  // Threat intelligence - API calls
  'shodan': 20000,        // 20 seconds - Shodan API
  'virustotal': 15000,    // 15 seconds - VirusTotal API
  'securitytrails': 15000,// 15 seconds - SecurityTrails API
  'urlscan': 20000,       // 20 seconds - URLScan API
  'censys': 15000,        // 15 seconds - Censys API
  'binaryedge': 15000,    // 15 seconds - BinaryEdge API
  'otx': 15000,           // 15 seconds - AlienVault OTX API
  
  // Apify actors - reduced for edge function compatibility
  'apify-social': 35000,  // 35 seconds - social media scraping
  'apify-osint': 35000,   // 35 seconds - OSINT scraping
  'apify-darkweb': 35000, // 35 seconds - dark web scraping
  
  // Default timeout for unlisted providers - aggressive for edge function compat
  'default': 25000        // 25 seconds default (reduced from 60s)
};

/**
 * Get the configured timeout for a specific provider.
 * Falls back to default timeout if provider not found.
 * 
 * @param providerId - The provider identifier
 * @returns Timeout in milliseconds
 */
export function getProviderTimeout(providerId: string): number {
  return PROVIDER_TIMEOUTS[providerId] || PROVIDER_TIMEOUTS['default'];
}

/**
 * Get a human-readable timeout description for logging.
 * 
 * @param providerId - The provider identifier
 * @returns Formatted timeout string (e.g., "90s")
 */
export function formatProviderTimeout(providerId: string): string {
  const timeoutMs = getProviderTimeout(providerId);
  return `${timeoutMs / 1000}s`;
}
