import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface ShodanResult {
  ip_str?: string;
  org?: string;
  isp?: string;
  country_name?: string;
  city?: string;
  ports?: number[];
  hostnames?: string[];
  domains?: string[];
  data?: Array<{
    port?: number;
    transport?: string;
    product?: string;
    version?: string;
    banner?: string;
    vulns?: Record<string, any>;
  }>;
  vulns?: string[];
  tags?: string[];
}

export function normalizeShodan(
  result: ShodanResult,
  target: string,
  type: string
): Finding[] {
  const findings: Finding[] = [];

  if (!result || Object.keys(result).length === 0) {
    return findings;
  }

  // Basic host information
  if (result.ip_str || result.org || result.ports?.length) {
    const evidence: Array<{ key: string; value: any }> = [];

    if (result.ip_str) evidence.push({ key: "IP", value: result.ip_str });
    if (result.org) evidence.push({ key: "Organization", value: result.org });
    if (result.isp) evidence.push({ key: "ISP", value: result.isp });
    if (result.country_name) {
      evidence.push({ key: "Location", value: `${result.city || ""}, ${result.country_name}`.trim() });
    }
    if (result.ports?.length) {
      evidence.push({ key: "Open Ports", value: result.ports.slice(0, 20).join(", ") });
    }
    if (result.hostnames?.length) {
      evidence.push({ key: "Hostnames", value: result.hostnames.join(", ") });
    }

    findings.push({
      id: generateFindingId("shodan", "host_info", target),
      type: "ip_exposure" as const,
      title: `Host Information: ${result.ip_str || target}`,
      description: `Shodan found ${result.ports?.length || 0} open port(s) on ${target}.`,
      severity: result.ports?.length && result.ports.length > 10 ? "medium" : "low" as any,
      confidence: 0.95,
      provider: "Shodan",
      providerCategory: "Infrastructure Intelligence",
      evidence,
      impact: "Network exposure and service fingerprints publicly indexed",
      remediation: [
        "Close unnecessary ports",
        "Implement firewall rules",
        "Monitor for unauthorized services",
      ],
      tags: ["infrastructure", "network", "exposure"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  // Vulnerabilities
  if (result.vulns?.length || result.data?.some(d => d.vulns && Object.keys(d.vulns).length > 0)) {
    const allVulns = new Set<string>();
    
    if (result.vulns) {
      result.vulns.forEach(v => allVulns.add(v));
    }
    
    result.data?.forEach(service => {
      if (service.vulns) {
        Object.keys(service.vulns).forEach(v => allVulns.add(v));
      }
    });

    if (allVulns.size > 0) {
      findings.push({
        id: generateFindingId("shodan", "vulnerabilities", target),
        type: "breach" as const,
        title: `${allVulns.size} Potential Vulnerabilit${allVulns.size > 1 ? "ies" : "y"} Detected`,
        description: `Shodan identified ${allVulns.size} known CVE(s) on ${target}.`,
        severity: "high" as any,
        confidence: 0.85,
        provider: "Shodan",
        providerCategory: "Vulnerability Intelligence",
        evidence: Array.from(allVulns).slice(0, 10).map((cve, i) => ({ 
          key: `CVE ${i + 1}`, 
          value: cve 
        })),
        impact: "Known vulnerabilities detected that may be exploitable",
        remediation: [
          "Patch affected services immediately",
          "Review CVE details for impact",
          "Implement compensating controls",
          "Schedule penetration testing",
        ],
        tags: ["vulnerability", "cve", "security"],
        observedAt: new Date().toISOString(),
        raw: { vulnerabilities: Array.from(allVulns) },
      });
    }
  }

  // Services
  if (result.data?.length) {
    const services = result.data.map(d => 
      `${d.product || "Unknown"} ${d.version || ""} on port ${d.port} (${d.transport})`
    );

    findings.push({
      id: generateFindingId("shodan", "services", target),
      type: "ip_exposure" as const,
      title: `${result.data.length} Service${result.data.length > 1 ? "s" : ""} Detected`,
      description: `Shodan fingerprinted ${result.data.length} running service(s).`,
      severity: "info" as any,
      confidence: 0.9,
      provider: "Shodan",
      providerCategory: "Service Detection",
      evidence: services.slice(0, 10).map((s, i) => ({ key: `Service ${i + 1}`, value: s })),
      impact: "Service versions exposed, potential attack surface identified",
      remediation: [
        "Update to latest versions",
        "Disable unnecessary services",
        "Restrict access via firewall",
      ],
      tags: ["services", "fingerprint", "infrastructure"],
      observedAt: new Date().toISOString(),
      raw: { services: result.data },
    });
  }

  return findings;
}
