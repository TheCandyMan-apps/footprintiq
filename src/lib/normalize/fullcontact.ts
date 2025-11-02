import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface FullContactResult {
  fullName?: string;
  ageRange?: string;
  gender?: string;
  location?: string;
  title?: string;
  organization?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  photos?: Array<{ url: string }>;
  emails?: Array<{ value: string }>;
  phones?: Array<{ value: string }>;
  details?: {
    employment?: Array<{ name?: string; title?: string; current?: boolean }>;
    education?: Array<{ name?: string; degree?: string }>;
  };
}

export function normalizeFullContact(
  result: FullContactResult,
  target: string,
  type: string
): Finding[] {
  const findings: Finding[] = [];

  if (!result || Object.keys(result).length === 0) {
    return findings;
  }

  const evidence: Array<{ key: string; value: any }> = [];

  if (result.fullName) evidence.push({ key: "Name", value: result.fullName });
  if (result.location) evidence.push({ key: "Location", value: result.location });
  if (result.title) evidence.push({ key: "Title", value: result.title });
  if (result.organization) evidence.push({ key: "Company", value: result.organization });
  
  if (result.details?.employment?.length) {
    const current = result.details.employment.find(e => e.current);
    if (current) {
      evidence.push({ key: "Current Employer", value: `${current.title} at ${current.name}` });
    }
  }

  const socialProfiles: string[] = [];
  if (result.twitter) socialProfiles.push(`Twitter: ${result.twitter}`);
  if (result.linkedin) socialProfiles.push(`LinkedIn: ${result.linkedin}`);
  if (result.facebook) socialProfiles.push(`Facebook: ${result.facebook}`);

  if (evidence.length > 0) {
    findings.push({
      id: generateFindingId("fullcontact", "person_enrichment", target),
      type: "identity" as const,
      title: `Person Profile Found`,
      description: `FullContact enriched profile for ${target} with ${evidence.length} data points.`,
      severity: "info" as any,
      confidence: 0.85,
      provider: "FullContact",
      providerCategory: "People Intelligence",
      evidence,
      impact: "Detailed personal and professional information available",
      remediation: [
        "Review data accuracy",
        "Check privacy settings on social profiles",
        "Consider reputation management if needed",
      ],
      tags: ["identity", "enrichment", "professional"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  if (socialProfiles.length > 0) {
    findings.push({
      id: generateFindingId("fullcontact", "social_profiles", target),
      type: "social_media" as const,
      title: `${socialProfiles.length} Social Profile${socialProfiles.length > 1 ? "s" : ""} Found`,
      description: `FullContact discovered ${socialProfiles.length} social media profile(s).`,
      severity: "info" as any,
      confidence: 0.8,
      provider: "FullContact",
      providerCategory: "Social Intelligence",
      evidence: socialProfiles.map((p, i) => ({ key: `Profile ${i + 1}`, value: p })),
      impact: "Social media presence mapped",
      remediation: ["Verify profile ownership", "Secure accounts with 2FA"],
      tags: ["social", "profiles"],
      observedAt: new Date().toISOString(),
      raw: { socialProfiles },
    });
  }

  return findings;
}
