import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface IPQSIPResult {
  success: boolean;
  message?: string;
  fraud_score: number;
  country_code: string;
  region: string;
  city: string;
  ISP: string;
  ASN: number;
  organization: string;
  is_crawler: boolean;
  timezone: string;
  mobile: boolean;
  host: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  active_vpn: boolean;
  active_tor: boolean;
  recent_abuse: boolean;
  bot_status: boolean;
  connection_type: string;
  abuse_velocity: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  request_id?: string;
}

/**
 * Extract geolocation data from IPQS IP result
 */
export interface IPQSGeoData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  isp: string;
  organization: string;
  asn: number;
  connectionType: string;
}

export function extractIPQSGeoData(result: IPQSIPResult): IPQSGeoData {
  return {
    country: result.country_code || '',
    region: result.region || '',
    city: result.city || '',
    timezone: result.timezone || '',
    latitude: result.latitude ?? null,
    longitude: result.longitude ?? null,
    isp: result.ISP || '',
    organization: result.organization || '',
    asn: result.ASN || 0,
    connectionType: result.connection_type || '',
  };
}

/**
 * Extract proxy/VPN/Tor detection data
 */
export interface IPQSProxyData {
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isActiveVPN: boolean;
  isActiveTor: boolean;
  isCrawler: boolean;
  isBot: boolean;
  isMobile: boolean;
  fraudScore: number;
  recentAbuse: boolean;
  abuseVelocity: string;
}

export function extractIPQSProxyData(result: IPQSIPResult): IPQSProxyData {
  return {
    isProxy: result.proxy || false,
    isVPN: result.vpn || false,
    isTor: result.tor || false,
    isActiveVPN: result.active_vpn || false,
    isActiveTor: result.active_tor || false,
    isCrawler: result.is_crawler || false,
    isBot: result.bot_status || false,
    isMobile: result.mobile || false,
    fraudScore: result.fraud_score || 0,
    recentAbuse: result.recent_abuse || false,
    abuseVelocity: result.abuse_velocity || 'none',
  };
}

export function normalizeIPQSIP(result: IPQSIPResult, ip: string): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();
  
  // Always generate geolocation finding
  findings.push({
    id: generateFindingId("ipqs_ip", "ip_geolocation", ip),
    type: "ip_geolocation" as const,
    title: `IP Geolocation: ${result.city || 'Unknown'}, ${result.country_code || 'Unknown'}`,
    description: `IP address ${ip} is located in ${result.city || 'unknown city'}, ${result.region || ''} (${result.country_code || 'unknown country'}).`,
    severity: "info",
    confidence: 0.85,
    provider: "IPQualityScore",
    providerCategory: "IP Intelligence",
    evidence: [
      { key: "IP Address", value: ip },
      { key: "Country", value: result.country_code || 'Unknown' },
      { key: "Region", value: result.region || 'Unknown' },
      { key: "City", value: result.city || 'Unknown' },
      { key: "ISP", value: result.ISP || 'Unknown' },
      { key: "Organization", value: result.organization || 'Unknown' },
      { key: "ASN", value: result.ASN?.toString() || 'Unknown' },
      { key: "Connection Type", value: result.connection_type || 'Unknown' },
      { key: "Timezone", value: result.timezone || 'Unknown' },
    ],
    impact: "IP geolocation data helps identify where activity originates from",
    remediation: [
      "Use this information to verify expected access locations",
      "Cross-reference with other data sources for accuracy",
    ],
    tags: ["ip", "geolocation", result.country_code?.toLowerCase() || "unknown"],
    observedAt: now,
    raw: result,
  });
  
  // VPN Detection
  if (result.vpn || result.active_vpn) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_vpn", ip),
      type: "ip_anonymization" as const,
      title: `VPN Detected on IP Address`,
      description: `IP address ${ip} is using a VPN service${result.active_vpn ? ' (actively connected)' : ''}.`,
      severity: "low",
      confidence: result.active_vpn ? 0.95 : 0.8,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "VPN", value: "true" },
        { key: "Active VPN", value: String(result.active_vpn || false) },
        { key: "ISP", value: result.ISP || 'Unknown' },
      ],
      impact: "VPN usage masks the true origin of network traffic",
      remediation: [
        "VPN usage is common and not necessarily malicious",
        "Consider context when evaluating VPN connections",
        "Monitor for other suspicious indicators",
      ],
      tags: ["ip", "vpn", "anonymization"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Proxy Detection
  if (result.proxy) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_proxy", ip),
      type: "ip_anonymization" as const,
      title: `Proxy Server Detected`,
      description: `IP address ${ip} is a known proxy server.`,
      severity: "medium",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "Proxy", value: "true" },
        { key: "Connection Type", value: result.connection_type || 'Unknown' },
        { key: "ISP", value: result.ISP || 'Unknown' },
      ],
      impact: "Proxy servers can hide the true origin of connections and are often used for evasion",
      remediation: [
        "Investigate the source of proxy connections",
        "Consider blocking known proxy IPs for sensitive operations",
        "Implement additional verification for proxy users",
      ],
      tags: ["ip", "proxy", "anonymization"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Tor Detection
  if (result.tor || result.active_tor) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_tor", ip),
      type: "ip_anonymization" as const,
      title: `Tor Exit Node Detected`,
      description: `IP address ${ip} is a Tor exit node${result.active_tor ? ' (actively in use)' : ''}.`,
      severity: "high",
      confidence: result.active_tor ? 0.95 : 0.85,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "Tor", value: "true" },
        { key: "Active Tor", value: String(result.active_tor || false) },
      ],
      impact: "Tor is used for anonymous browsing and can be associated with malicious activity",
      remediation: [
        "Evaluate if Tor access is expected for your use case",
        "Consider blocking Tor exit nodes for high-security applications",
        "Implement additional authentication for Tor users",
      ],
      tags: ["ip", "tor", "anonymization", "darkweb"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Bot Detection
  if (result.bot_status || result.is_crawler) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_bot", ip),
      type: "ip_bot" as const,
      title: `Bot/Crawler Activity Detected`,
      description: `IP address ${ip} shows bot or crawler behavior.`,
      severity: "low",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "Bot Status", value: String(result.bot_status || false) },
        { key: "Crawler", value: String(result.is_crawler || false) },
        { key: "Organization", value: result.organization || 'Unknown' },
      ],
      impact: "Bot traffic may be automated scraping or legitimate search indexing",
      remediation: [
        "Identify if the bot is from a known search engine",
        "Monitor for abusive bot behavior",
        "Implement rate limiting if needed",
      ],
      tags: ["ip", "bot", "crawler"],
      observedAt: now,
      raw: result,
    });
  }
  
  // High Fraud Score
  if (result.fraud_score > 75) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_fraud", ip),
      type: "ip_fraud" as const,
      title: `High Fraud Risk IP Address`,
      description: `IP address ${ip} has a high fraud score of ${result.fraud_score}/100.`,
      severity: result.fraud_score > 90 ? "high" : "medium",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "Fraud Score", value: `${result.fraud_score}/100` },
        { key: "Recent Abuse", value: String(result.recent_abuse || false) },
        { key: "Abuse Velocity", value: result.abuse_velocity || 'none' },
        { key: "ISP", value: result.ISP || 'Unknown' },
      ],
      impact: "High fraud scores indicate the IP is associated with malicious or suspicious activity",
      remediation: [
        "Block or challenge requests from this IP",
        "Implement additional verification steps",
        "Monitor for patterns of abuse",
        "Consider reporting to abuse contacts",
      ],
      tags: ["ip", "fraud", "abuse"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Recent Abuse
  if (result.recent_abuse) {
    findings.push({
      id: generateFindingId("ipqs_ip", "ip_abuse", ip),
      type: "ip_abuse" as const,
      title: `Recent Abuse Detected from IP`,
      description: `IP address ${ip} has been flagged for recent abusive activity.`,
      severity: "high",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: ip },
        { key: "Recent Abuse", value: "true" },
        { key: "Abuse Velocity", value: result.abuse_velocity || 'none' },
        { key: "Fraud Score", value: `${result.fraud_score}/100` },
      ],
      impact: "This IP has been reported for spam, fraud, or other malicious activity recently",
      remediation: [
        "Block requests from this IP address",
        "Report to ISP abuse contact",
        "Add to threat intelligence blocklist",
      ],
      tags: ["ip", "abuse", "threat"],
      observedAt: now,
      raw: result,
    });
  }

  return findings;
}
