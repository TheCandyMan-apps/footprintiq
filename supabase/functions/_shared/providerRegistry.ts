/**
 * Single source of truth for implemented OSINT providers.
 * Used by scan-orchestrate to validate provider requests and by provider-proxy for routing.
 */
export const IMPLEMENTED_PROVIDERS = new Set([
  // Core breach / identity
  'hibp', 'dehashed', 'intelx', 'pipl', 'hunter', 'fullhunt',
  'clearbit', 'fullcontact',

  // Threat / infra
  'censys', 'binaryedge', 'shodan', 'securitytrails',
  'otx', 'virustotal', 'abuseipdb', 'urlscan',
  'greynoise_feed', 'shodan_feed', 'otx_feed',

  // Search / OSINT
  'googlecse', 'darksearch', 'gosearch',

  // Apify buckets
  'apify', 'apify-social', 'apify-osint', 'apify-darkweb',

  // username/email tools
  'maigret', 'sherlock', 'holehe',

  // Abstract / enrichment
  'abstract_ipgeo', 'abstract_company',
  
  // Person search (feature-flagged)
  'pipl'
]);
