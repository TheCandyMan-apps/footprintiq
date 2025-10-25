import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface CensysResult {
  ip?: string;
  services?: Array<{
    port: number;
    service_name: string;
    banner?: string;
  }>;
  protocols?: string[];
  location?: {
    country: string;
    city?: string;
  };
  autonomous_system?: {
    asn: number;
    name: string;
  };
}

export function normalizeCensys(result: CensysResult, target: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.services && result.services.length > 0) {
    const openPorts = result.services.map((s) => s.port);
    const severity = openPorts.some((p) => [21, 22, 23, 3306, 5432, 6379].includes(p))
      ? "high"
      : openPorts.length > 5
      ? "medium"
      : "low";
    
    findings.push({
      id: generateFindingId("censys", "ip_exposure", target),
      type: "ip_exposure" as const,
      title: `${openPorts.length} Open Port${openPorts.length > 1 ? "s" : ""} Detected`,
      description: `Censys detected ${openPorts.length} open port(s) on ${target}. ${
        openPorts.length > 10 ? "High exposure may indicate misconfiguration." : ""
      }`,
      severity: severity as any,
      confidence: 0.9,
      provider: "Censys",
      providerCategory: "Asset Discovery",
      evidence: result.services.slice(0, 10).map((s) => ({
        key: `Port ${s.port}`,
        value: s.service_name || "Unknown",
      })),
      impact: `Exposed services may be vulnerable to attack or data leakage`,
      remediation: [
        "Review all open ports and close unnecessary services",
        "Ensure firewall rules restrict access to sensitive ports",
        "Keep all services patched and up to date",
        "Use strong authentication on all exposed services",
      ],
      tags: ["ip", "exposure", "ports"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
