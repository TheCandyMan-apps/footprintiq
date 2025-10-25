import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface ApifyResult {
  username: string;
  found: boolean;
  url?: string;
  platform?: string;
  metadata?: Record<string, any>;
}

export function normalizeApify(results: ApifyResult[], username: string): Finding[] {
  const findings: Finding[] = [];
  
  const foundSites = results.filter((r) => r.found);
  
  if (foundSites.length > 0) {
    findings.push({
      id: generateFindingId("apify", "username_presence", username),
      type: "social_media" as const,
      title: `Username Found on ${foundSites.length} Platform${foundSites.length > 1 ? "s" : ""}`,
      description: `Apify discovered the username "${username}" on ${foundSites.length} JS-heavy platform(s).`,
      severity: "info" as any,
      confidence: 0.75,
      provider: "Apify",
      providerCategory: "Username Intelligence",
      evidence: foundSites.map((site) => ({
        key: site.platform || "Unknown",
        value: site.url || "No URL",
      })),
      impact: "Username presence may link to additional profiles or identities",
      remediation: [
        "Review found profiles for accuracy",
        "Ensure profiles are properly secured",
      ],
      tags: ["username", "social", "presence"],
      observedAt: new Date().toISOString(),
      raw: foundSites,
    });
  }
  
  return findings;
}
