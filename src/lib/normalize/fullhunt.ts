import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface FullHuntResult {
  domain: string;
  subdomains?: string[];
  hosts?: Array<{
    host: string;
    ip_address?: string;
  }>;
}

export function normalizeFullHunt(result: FullHuntResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.subdomains && result.subdomains.length > 0) {
    const severity = result.subdomains.length > 50 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("fullhunt", "domain_asset", domain),
      type: "domain_tech" as const,
      title: `${result.subdomains.length} Subdomain${result.subdomains.length > 1 ? "s" : ""} Discovered`,
      description: `FullHunt enumerated ${result.subdomains.length} subdomain(s) for ${domain}. Large attack surfaces may hide forgotten or misconfigured assets.`,
      severity: severity as any,
      confidence: 0.85,
      provider: "FullHunt",
      providerCategory: "Attack Surface",
      evidence: result.subdomains.slice(0, 15).map((sub, i) => ({
        key: `Subdomain ${i + 1}`,
        value: sub,
      })),
      impact: "Forgotten subdomains may run outdated software or have weak security",
      remediation: [
        "Audit all subdomains for ownership and necessity",
        "Decommission unused subdomains",
        "Ensure all subdomains have proper security controls",
        "Implement wildcard SSL certificates",
      ],
      tags: ["domain", "asset", "subdomains"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
