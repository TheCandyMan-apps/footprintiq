import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface WHOISXMLResult {
  domainName: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  registrar?: {
    name: string;
  };
  registrant?: {
    country?: string;
    organization?: string;
  };
  nameServers?: {
    hostNames?: string[];
  };
}

export function normalizeWHOISXML(result: WHOISXMLResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  const createdDate = result.createdDate ? new Date(result.createdDate) : null;
  const age = createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  findings.push({
    id: generateFindingId("whoisxml", "domain_whois_signal", domain),
    type: "identity" as const,
    title: `WHOIS: ${result.registrar?.name || "Unknown Registrar"}`,
    description: `WHOISXML found domain ${domain} registered ${
      age ? `${age} days ago` : "at unknown date"
    } with ${result.registrar?.name || "unknown registrar"}.`,
    severity: (age && age < 30 ? "low" : "info") as any,
    confidence: 0.9,
    provider: "WHOISXML",
    providerCategory: "Domain Intelligence",
    evidence: [
      { key: "Registrar", value: result.registrar?.name || "Unknown" },
      { key: "Created", value: result.createdDate || "Unknown" },
      { key: "Expires", value: result.expiresDate || "Unknown" },
      { key: "Country", value: result.registrant?.country || "Unknown" },
      ...(result.nameServers?.hostNames
        ? result.nameServers.hostNames.slice(0, 3).map((ns, i) => ({ key: `NS ${i + 1}`, value: ns }))
        : []),
    ],
    impact: age && age < 30 ? "Recently created domains may be used for phishing or scams" : "Domain registration information",
    remediation: age && age < 30 ? ["Verify domain legitimacy", "Check for brand impersonation"] : [],
    tags: ["domain", "whois", "registration"],
    observedAt: new Date().toISOString(),
    raw: result,
  });
  
  return findings;
}
