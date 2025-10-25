import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface HunterResult {
  domain: string;
  pattern?: string;
  emails?: Array<{
    value: string;
    type: string;
    confidence?: number;
  }>;
  organization?: string;
}

export function normalizeHunter(result: HunterResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.pattern) {
    findings.push({
      id: generateFindingId("hunter", "domain_email_pattern", domain),
      type: "domain_tech" as const,
      title: `Email Pattern: ${result.pattern}`,
      description: `Hunter.io discovered the email pattern "${result.pattern}" for ${domain}${
        result.organization ? ` (${result.organization})` : ""
      }.`,
      severity: "info" as any,
      confidence: 0.8,
      provider: "Hunter.io",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Pattern", value: result.pattern },
        { key: "Domain", value: domain },
        ...(result.organization ? [{ key: "Organization", value: result.organization }] : []),
        ...(result.emails
          ? result.emails.slice(0, 5).map((e, i) => ({
              key: `Example ${i + 1}`,
              value: e.value.replace(/^(.{3}).*(@.*)$/, "$1***$2"), // Mask email
            }))
          : []),
      ],
      impact: "Email patterns can be used for targeted phishing or social engineering",
      remediation: [
        "Be aware that email addresses following this pattern are publicly known",
        "Train employees on phishing awareness",
        "Implement email authentication (SPF, DKIM, DMARC)",
      ],
      tags: ["domain", "email", "osint"],
      observedAt: new Date().toISOString(),
      raw: { ...result, emails: undefined }, // Exclude emails from raw
    });
  }
  
  return findings;
}
