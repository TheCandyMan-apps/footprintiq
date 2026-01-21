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
  // Spamhaus threat intelligence
  {
    id: 'spamhaus_ip',
    title: 'Spamhaus IP Reputation',
    category: 'threat',
    supports: ['ip'],
    cost: 'medium',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'IP reputation and blocklist status',
  },
  {
    id: 'spamhaus_domain',
    title: 'Spamhaus Domain Reputation',
    category: 'threat',
    supports: ['domain'],
    cost: 'medium',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'Domain reputation and blocklist status',
  },
  {
    id: 'spamhaus_pdns',
    title: 'Spamhaus Passive DNS',
    category: 'asset',
    supports: ['domain', 'ip'],
    cost: 'high',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'Passive DNS history and associations',
  },
  {
    id: 'spamhaus_dqs',
    title: 'Spamhaus DQS',
    category: 'threat',
    supports: ['domain'],
    cost: 'medium',
    policy: 'enterprise',
    ttlMs: 24 * 3600e3,
    description: 'Content reputation and threat scoring',
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

// Username sources for extended coverage
export type Category = "social" | "forums" | "gaming" | "dating" | "nsfw" | "darkweb" | "other";

export interface UsernameSource {
  name: string;
  site: string;
  pattern: (u: string) => string;
  category: Category;
  requiresConsent?: boolean;
}

export const DATING_SOURCES: UsernameSource[] = [
  { name: "Tinder", site: "tinder.com", pattern: u => `https://tinder.com/@${encodeURIComponent(u)}`, category: "dating", requiresConsent: true },
  { name: "Bumble", site: "bumble.com", pattern: u => `https://bumble.com/en/@${encodeURIComponent(u)}`, category: "dating", requiresConsent: true },
  { name: "Hinge", site: "hinge.co", pattern: u => `https://hinge.co/${encodeURIComponent(u)}`, category: "dating", requiresConsent: true },
  { name: "OkCupid", site: "okcupid.com", pattern: u => `https://www.okcupid.com/profile/${encodeURIComponent(u)}`, category: "dating", requiresConsent: true },
  { name: "Match", site: "match.com", pattern: u => `https://www.match.com/profile/${encodeURIComponent(u)}`, category: "dating", requiresConsent: true },
];

export const NSFW_SOURCES: UsernameSource[] = [
  { name: "OnlyFans", site: "onlyfans.com", pattern: u => `https://onlyfans.com/${encodeURIComponent(u)}`, category: "nsfw", requiresConsent: true },
  { name: "Fansly", site: "fansly.com", pattern: u => `https://fansly.com/${encodeURIComponent(u)}`, category: "nsfw", requiresConsent: true },
];

export const ALL_USERNAME_SOURCES = [...DATING_SOURCES, ...NSFW_SOURCES];
