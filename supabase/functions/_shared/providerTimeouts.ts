/**
 * Provider-specific timeout configuration
 * 
 * Defines maximum execution time for each OSINT provider.
 * Timeout values are based on typical Cloud Run worker execution times
 * plus a safety buffer to prevent premature scan failures.
 */

export const PROVIDER_TIMEOUTS: Record<string, number> = {
  // Username scanners - comprehensive scans with generous timeouts (background execution)
  'maigret': 120000,      // 120 seconds - scans 3000+ sites thoroughly
  'sherlock': 120000,     // 120 seconds - scans 400+ sites thoroughly
  'whatsmyname': 60000,   // 60 seconds - legacy alias for sherlock
  'gosearch': 180000,     // 180 seconds - deep search across 300+ platforms (fully async)
  
  // Breach & identity providers - API calls, faster
  'hibp': 30000,          // 30 seconds - Have I Been Pwned API
  'dehashed': 30000,      // 30 seconds - DeHashed API
  'holehe': 45000,        // 45 seconds - multiple email registrations
  
  // Enrichment providers - API calls
  'hunter': 30000,        // 30 seconds - Hunter.io API
  'clearbit': 30000,      // 30 seconds - Clearbit API
  'fullcontact': 30000,   // 30 seconds - FullContact API
  
  // Threat intelligence - API calls
  'shodan': 45000,        // 45 seconds - Shodan API
  'virustotal': 30000,    // 30 seconds - VirusTotal API
  'securitytrails': 30000,// 30 seconds - SecurityTrails API
  'urlscan': 45000,       // 45 seconds - URLScan API
  'censys': 30000,        // 30 seconds - Censys API
  'binaryedge': 30000,    // 30 seconds - BinaryEdge API
  'otx': 30000,           // 30 seconds - AlienVault OTX API
  
  // Apify actors - longer running tasks
  'apify-social': 120000, // 120 seconds - social media scraping
  'apify-osint': 120000,  // 120 seconds - OSINT scraping
  'apify-darkweb': 180000,// 180 seconds - dark web scraping
  
  // Default timeout for unlisted providers
  'default': 60000        // 60 seconds default (increased from 45s)
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
