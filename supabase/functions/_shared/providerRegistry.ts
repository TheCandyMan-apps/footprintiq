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
  
  // IPQualityScore
  'ipqs_email',  // Email fraud + disposable + breach detection
  'ipqs_ip',     // IP/Proxy/VPN/Tor detection
  'ipqs_url',    // Malicious URL scanning
  'ipqs_darkweb', // Dark web breach intelligence
  
  // Person search (feature-flagged)
  'pipl',

  // Phone intelligence providers (Tier 1)
  'abstract_phone',      // Carrier & line intelligence
  'ipqs_phone',          // IPQualityScore phone validation
  'numverify',           // Phone validation + carrier
  'twilio_lookup',       // Carrier & line type
  
  // Phone messaging presence
  'whatsapp_check',      // WhatsApp presence
  'telegram_check',      // Telegram presence
  'signal_check',        // Signal presence (boolean)
  
  // Phone OSINT presence
  'phone_osint',         // Public OSINT mentions
  'truecaller',          // Caller ID hints
  'phone_reputation',    // Spam/scam reputation
  
  // Perplexity AI (real-time web intelligence)
  'perplexity_osint',    // Live web search with citations
]);
