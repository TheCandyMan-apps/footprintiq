export interface ProviderMeta {
  id: string;
  title: string;
  supports: ("email" | "domain" | "ip" | "username" | "phone")[];
  ttlMs: number;
  unitCost: number;
  policy?: "darkweb" | "enterprise";
  description?: string;
}

export const REGISTRY: ProviderMeta[] = [
  // Current wave
  {
    id: "hibp",
    title: "Have I Been Pwned",
    supports: ["email"],
    ttlMs: 7 * 24 * 3600e3,
    unitCost: 0,
    description: "Breach detection and password exposure",
  },
  {
    id: "censys",
    title: "Censys",
    supports: ["domain", "ip"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "Internet-wide asset discovery and exposure",
  },
  {
    id: "binaryedge",
    title: "BinaryEdge",
    supports: ["ip"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "IP exposure and open ports",
  },
  {
    id: "fullhunt",
    title: "FullHunt",
    supports: ["domain"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "Attack surface discovery and subdomain enumeration",
  },
  {
    id: "otx",
    title: "AlienVault OTX",
    supports: ["domain", "ip"],
    ttlMs: 12 * 3600e3,
    unitCost: 0,
    description: "Threat intelligence and malware tags",
  },
  {
    id: "abuseipdb",
    title: "AbuseIPDB",
    supports: ["ip"],
    ttlMs: 12 * 3600e3,
    unitCost: 0.001,
    description: "IP abuse and reputation",
  },
  {
    id: "hunter",
    title: "Hunter.io",
    supports: ["domain"],
    ttlMs: 30 * 24 * 3600e3,
    unitCost: 0.005,
    description: "Email pattern discovery",
  },
  {
    id: "googlecse",
    title: "Google Custom Search",
    supports: ["domain", "email", "username"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.0015,
    description: "Public search mentions",
  },
  {
    id: "apify",
    title: "Apify",
    supports: ["username"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "Username presence on JS-heavy sites",
  },
  {
    id: "abstract_phone",
    title: "AbstractAPI Phone",
    supports: ["phone"],
    ttlMs: 30 * 24 * 3600e3,
    unitCost: 0.001,
    description: "Phone validation and intelligence",
  },
  {
    id: "abstract_ipgeo",
    title: "AbstractAPI IP Geo",
    supports: ["ip"],
    ttlMs: 30 * 24 * 3600e3,
    unitCost: 0.0005,
    description: "IP geolocation",
  },
  {
    id: "abstract_company",
    title: "AbstractAPI Company",
    supports: ["domain"],
    ttlMs: 30 * 24 * 3600e3,
    unitCost: 0.002,
    description: "Company profile enrichment",
  },
  {
    id: "abstract_email",
    title: "AbstractAPI Email Validation",
    supports: ["email"],
    ttlMs: 30 * 24 * 3600e3,
    unitCost: 0.001,
    description: "Email validation, deliverability, and disposable detection",
  },
  {
    id: "abstract_email_reputation",
    title: "AbstractAPI Email Reputation",
    supports: ["email"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "Email quality scoring and sender reputation",
  },
  
  // Enterprise wave
  {
    id: "securitytrails",
    title: "SecurityTrails",
    supports: ["domain"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    policy: "enterprise",
    description: "DNS history and subdomains",
  },
  {
    id: "urlscan",
    title: "URLScan",
    supports: ["domain"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.0015,
    policy: "enterprise",
    description: "Phishing detection and URL analysis",
  },
  {
    id: "whoisxml",
    title: "WHOISXML",
    supports: ["domain"],
    ttlMs: 7 * 24 * 3600e3,
    unitCost: 0.001,
    policy: "enterprise",
    description: "WHOIS data and domain registration",
  },
  {
    id: "virustotal",
    title: "VirusTotal",
    supports: ["domain", "ip"],
    ttlMs: 12 * 3600e3,
    unitCost: 0.0015,
    description: "Multi-engine malware and reputation",
  },
  
  // Dark web (gated)
  {
    id: "darksearch",
    title: "DarkSearch",
    supports: ["domain", "email", "username"],
    ttlMs: 7 * 24 * 3600e3,
    unitCost: 0.001,
    policy: "darkweb",
    description: "Dark web index search (metadata only)",
  },
  {
    id: "intelx",
    title: "IntelX",
    supports: ["domain", "email", "username"],
    ttlMs: 7 * 24 * 3600e3,
    unitCost: 0.01,
    policy: "darkweb",
    description: "Paste and leak mentions (metadata only)",
  },
  {
    id: "dehashed",
    title: "DeHashed",
    supports: ["domain", "email", "username"],
    ttlMs: 7 * 24 * 3600e3,
    unitCost: 0.01,
    policy: "darkweb",
    description: "Credential exposure summary (counts only)",
  },
  {
    id: "predictasearch",
    title: "Predicta Search",
    supports: ["email", "phone", "username"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.005,
    description: "Multi-platform social profiles and breach aggregation",
  },
  {
    id: "ipqs_email",
    title: "IPQualityScore Email",
    supports: ["email"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.002,
    description: "Email fraud scoring, disposable detection, and breach checks",
  },
  {
    id: "ipqs_ip",
    title: "IPQualityScore IP",
    supports: ["ip"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.001,
    description: "IP fraud scoring, VPN/Proxy/Tor detection, and geolocation",
  },
  {
    id: "ipqs_url",
    title: "IPQualityScore URL",
    supports: ["domain"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.001,
    description: "Malicious URL detection, phishing, malware, and domain reputation",
  },
  {
    id: "ipqs_darkweb",
    title: "IPQualityScore Dark Web",
    supports: ["email"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.001,
    description: "Dark web exposure and breach detection",
  },
  {
    id: "ipqs_phone",
    title: "IPQualityScore Phone",
    supports: ["phone"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.003,
    description: "Phone fraud scoring, carrier intel, and risk detection",
  },
  
  // Perplexity AI (real-time web intelligence)
  {
    id: "perplexity_osint",
    title: "Perplexity OSINT",
    supports: ["email", "username", "phone"],
    ttlMs: 24 * 3600e3,
    unitCost: 0.003,
    description: "Real-time web intelligence with live citations",
  },
  
  // Web Index Verification (LENS corroboration)
  {
    id: "brave_search",
    title: "Web Index Verification",
    supports: ["username"],
    ttlMs: 24 * 3600e3,
    unitCost: 0,
    description: "Verifies profiles in independent web index for LENS scoring",
  },
];

export function getProviderMeta(providerId: string): ProviderMeta | undefined {
  return REGISTRY.find((p) => p.id === providerId);
}

export function isEnabled(providerId: string): boolean {
  const meta = getProviderMeta(providerId);
  if (!meta) return false;
  
  // Provider availability is determined server-side
  // This client-side check is now deprecated for security reasons
  // All providers are considered potentially available and will be validated server-side
  return true;
}

export function getProvidersByType(type: "email" | "domain" | "ip" | "username" | "phone"): ProviderMeta[] {
  return REGISTRY.filter((p) => p.supports.includes(type));
}
