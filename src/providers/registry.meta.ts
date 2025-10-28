/**
 * Provider Metadata Registry (Client-Safe)
 * Contains only safe metadata for UI display
 * NO API KEYS OR SENSITIVE DATA
 */

export interface ProviderMeta {
  id: string;
  title: string;
  category: 'breach' | 'asset' | 'threat' | 'enrichment' | 'darkweb';
  supports: ('email' | 'domain' | 'ip' | 'username' | 'phone')[];
  cost: 'free' | 'low' | 'medium' | 'high';
  policy?: 'darkweb' | 'enterprise';
  description?: string;
  ttlMs: number;
}

export const PROVIDER_META: ProviderMeta[] = [
  {
    id: 'hibp',
    title: 'Have I Been Pwned',
    category: 'breach',
    supports: ['email'],
    cost: 'free',
    ttlMs: 7 * 24 * 3600e3,
    description: 'Breach detection and password exposure',
  },
  {
    id: 'censys',
    title: 'Censys',
    category: 'asset',
    supports: ['domain', 'ip'],
    cost: 'low',
    ttlMs: 24 * 3600e3,
    description: 'Internet-wide asset discovery and exposure',
  },
  {
    id: 'binaryedge',
    title: 'BinaryEdge',
    category: 'asset',
    supports: ['ip'],
    cost: 'low',
    ttlMs: 24 * 3600e3,
    description: 'IP exposure and open ports',
  },
  {
    id: 'fullhunt',
    title: 'FullHunt',
    category: 'asset',
    supports: ['domain'],
    cost: 'low',
    ttlMs: 24 * 3600e3,
    description: 'Attack surface discovery and subdomain enumeration',
  },
  {
    id: 'otx',
    title: 'AlienVault OTX',
    category: 'threat',
    supports: ['domain', 'ip'],
    cost: 'free',
    ttlMs: 12 * 3600e3,
    description: 'Threat intelligence and malware tags',
  },
  {
    id: 'abuseipdb',
    title: 'AbuseIPDB',
    category: 'threat',
    supports: ['ip'],
    cost: 'low',
    ttlMs: 12 * 3600e3,
    description: 'IP abuse and reputation',
  },
  {
    id: 'hunter',
    title: 'Hunter.io',
    category: 'enrichment',
    supports: ['domain'],
    cost: 'low',
    ttlMs: 30 * 24 * 3600e3,
    description: 'Email pattern discovery',
  },
  {
    id: 'googlecse',
    title: 'Google Custom Search',
    category: 'enrichment',
    supports: ['domain', 'email', 'username'],
    cost: 'low',
    ttlMs: 24 * 3600e3,
    description: 'Public search mentions',
  },
  {
    id: 'apify',
    title: 'Apify',
    category: 'enrichment',
    supports: ['username'],
    cost: 'low',
    ttlMs: 24 * 3600e3,
    description: 'Username presence on JS-heavy sites',
  },
  {
    id: 'abstract_phone',
    title: 'AbstractAPI Phone',
    category: 'enrichment',
    supports: ['phone'],
    cost: 'low',
    ttlMs: 30 * 24 * 3600e3,
    description: 'Phone validation and intelligence',
  },
  {
    id: 'abstract_ipgeo',
    title: 'AbstractAPI IP Geo',
    category: 'enrichment',
    supports: ['ip'],
    cost: 'low',
    ttlMs: 30 * 24 * 3600e3,
    description: 'IP geolocation',
  },
  {
    id: 'abstract_company',
    title: 'AbstractAPI Company',
    category: 'enrichment',
    supports: ['domain'],
    cost: 'low',
    ttlMs: 30 * 24 * 3600e3,
    description: 'Company profile enrichment',
  },
  {
    id: 'securitytrails',
    title: 'SecurityTrails',
    category: 'asset',
    supports: ['domain'],
    cost: 'low',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'DNS history and subdomains',
  },
  {
    id: 'urlscan',
    title: 'URLScan',
    category: 'threat',
    supports: ['domain'],
    cost: 'low',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'Phishing detection and URL analysis',
  },
  {
    id: 'whoisxml',
    title: 'WHOISXML',
    category: 'enrichment',
    supports: ['domain'],
    cost: 'low',
    policy: 'enterprise',
    ttlMs: 7 * 24 * 3600e3,
    description: 'WHOIS data and domain registration',
  },
  {
    id: 'virustotal',
    title: 'VirusTotal',
    category: 'threat',
    supports: ['domain', 'ip'],
    cost: 'low',
    ttlMs: 12 * 3600e3,
    description: 'Multi-engine malware and reputation',
  },
  {
    id: 'darksearch',
    title: 'DarkSearch',
    category: 'darkweb',
    supports: ['domain', 'email', 'username'],
    cost: 'low',
    policy: 'darkweb',
    ttlMs: 7 * 24 * 3600e3,
    description: 'Dark web index search (metadata only)',
  },
  {
    id: 'intelx',
    title: 'IntelX',
    category: 'darkweb',
    supports: ['domain', 'email', 'username'],
    cost: 'high',
    policy: 'darkweb',
    ttlMs: 7 * 24 * 3600e3,
    description: 'Paste and leak mentions (metadata only)',
  },
  {
    id: 'dehashed',
    title: 'DeHashed',
    category: 'darkweb',
    supports: ['domain', 'email', 'username'],
    cost: 'high',
    policy: 'darkweb',
    ttlMs: 7 * 24 * 3600e3,
    description: 'Credential exposure summary (counts only)',
  },
];

export function getProviderMeta(providerId: string): ProviderMeta | undefined {
  return PROVIDER_META.find((p) => p.id === providerId);
}

export function getProvidersByType(type: 'email' | 'domain' | 'ip' | 'username' | 'phone'): ProviderMeta[] {
  return PROVIDER_META.filter((p) => p.supports.includes(type));
}

export function getProvidersByCategory(category: ProviderMeta['category']): ProviderMeta[] {
  return PROVIDER_META.filter((p) => p.category === category);
}
