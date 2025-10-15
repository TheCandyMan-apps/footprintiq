import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface BuiltWithResult {
  domain: string;
  technologies: Array<{
    name: string;
    category: string;
    version?: string;
    description?: string;
  }>;
}

const VULNERABLE_TECHS = ["WordPress", "Joomla", "Drupal", "jQuery", "PHP", "Apache"];

export function normalizeBuiltWith(result: BuiltWithResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  const techs = result.technologies || [];
  const vulnerableTechs = techs.filter((t) =>
    VULNERABLE_TECHS.some((v) => t.name.includes(v))
  );
  
  if (vulnerableTechs.length > 0) {
    findings.push({
      id: generateFindingId("builtwith", "domain_tech", `${domain}_vuln_tech`),
      type: "domain_tech" as const,
      title: `${vulnerableTechs.length} Potentially Outdated Technologies Detected`,
      description: `${domain} uses technologies that may be vulnerable if not kept up to date.`,
      severity: "medium",
      confidence: 0.75,
      provider: "BuiltWith",
      providerCategory: "Technology Profiling",
      evidence: vulnerableTechs.map((t) => ({
        key: t.category,
        value: `${t.name}${t.version ? ` v${t.version}` : ""}`,
        metadata: { description: t.description },
      })),
      impact: "Outdated or vulnerable technologies may expose the site to attacks",
      remediation: [
        "Update all software to latest stable versions",
        "Enable automatic security updates where possible",
        "Remove unused plugins and themes",
        "Regularly scan for known vulnerabilities",
        "Subscribe to security advisories for your tech stack",
      ],
      tags: ["domain", "technology", "vulnerability", ...vulnerableTechs.map((t) => t.name.toLowerCase())],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  // Tech stack disclosure
  if (techs.length > 0) {
    findings.push({
      id: generateFindingId("builtwith", "domain_tech", `${domain}_stack`),
      type: "domain_tech" as const,
      title: `Technology Stack Detected (${techs.length} technologies)`,
      description: `Your website's technology stack is publicly visible, which may aid attackers in targeting specific vulnerabilities.`,
      severity: "low",
      confidence: 0.8,
      provider: "BuiltWith",
      providerCategory: "Technology Profiling",
      evidence: techs.slice(0, 15).map((t) => ({
        key: t.category,
        value: `${t.name}${t.version ? ` v${t.version}` : ""}`,
      })),
      impact: "Technology fingerprinting aids targeted attacks",
      remediation: [
        "Remove or obfuscate server headers revealing technology versions",
        "Use security headers to prevent information leakage",
        "Disable directory listing and error messages in production",
        "Consider using a Web Application Firewall (WAF)",
      ],
      tags: ["domain", "technology", "fingerprinting"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  return findings;
}
