import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface SecurityTrailsResult {
  domain: string;
  subdomains?: string[];
  dns_history?: Array<{
    type: string;
    values: string[];
    first_seen: string;
    last_seen: string;
  }>;
}

export function normalizeSecurityTrails(result: SecurityTrailsResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.subdomains && result.subdomains.length > 0) {
    findings.push({
      id: generateFindingId("securitytrails", "domain_asset", domain),
      type: "domain_tech" as const,
      title: `${result.subdomains.length} Subdomain${result.subdomains.length > 1 ? "s" : ""}`,
      description: `SecurityTrails enumerated ${result.subdomains.length} subdomain(s) for ${domain}.`,
      severity: (result.subdomains.length > 50 ? "medium" : "low") as any,
      confidence: 0.9,
      provider: "SecurityTrails",
      providerCategory: "DNS Intelligence",
      evidence: result.subdomains.slice(0, 10).map((sub, i) => ({
        key: `Subdomain ${i + 1}`,
        value: sub,
      })),
      impact: "Large attack surface may include forgotten or misconfigured assets",
      remediation: [
        "Audit all subdomains",
        "Decommission unused assets",
        "Implement security controls uniformly",
      ],
      tags: ["domain", "asset", "subdomains"],
      observedAt: new Date().toISOString(),
      raw: { subdomains: result.subdomains },
    });
  }
  
  if (result.dns_history && result.dns_history.length > 0) {
    findings.push({
      id: generateFindingId("securitytrails", "domain_history", domain),
      type: "dns_history" as const,
      title: `DNS History: ${result.dns_history.length} Change${result.dns_history.length > 1 ? "s" : ""}`,
      description: `SecurityTrails tracked ${result.dns_history.length} DNS record change(s) for ${domain}.`,
      severity: "info" as any,
      confidence: 0.85,
      provider: "SecurityTrails",
      providerCategory: "DNS Intelligence",
      evidence: result.dns_history.slice(0, 5).map((record) => ({
        key: record.type,
        value: `${record.values.join(", ")} (${record.first_seen} to ${record.last_seen})`,
      })),
      impact: "DNS changes may reveal infrastructure migrations or misconfigurations",
      remediation: [],
      tags: ["domain", "dns", "history"],
      observedAt: new Date().toISOString(),
      raw: { dns_history: result.dns_history },
    });
  }
  
  return findings;
}
