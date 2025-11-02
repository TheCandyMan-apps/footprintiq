import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface PiplResult {
  person?: {
    names?: Array<{ display?: string }>;
    emails?: Array<{ address?: string }>;
    phones?: Array<{ display?: string }>;
    addresses?: Array<{ display?: string }>;
    jobs?: Array<{ title?: string; organization?: string }>;
    educations?: Array<{ school?: string; degree?: string }>;
    images?: Array<{ url?: string }>;
    urls?: Array<{ url?: string }>;
    usernames?: Array<{ content?: string }>;
  };
  possible_persons?: Array<any>;
}

export function normalizePipl(result: PiplResult, target: string): Finding[] {
  const findings: Finding[] = [];

  if (!result?.person && !result?.possible_persons?.length) {
    return findings;
  }

  const person = result.person;
  if (person) {
    const evidence: Array<{ key: string; value: any }> = [];

    if (person.names?.length) {
      evidence.push({ key: "Names", value: person.names.map(n => n.display).join(", ") });
    }
    if (person.addresses?.length) {
      evidence.push({ key: "Addresses", value: person.addresses.map(a => a.display).join("; ") });
    }
    if (person.jobs?.length) {
      const jobs = person.jobs.map(j => `${j.title} at ${j.organization}`).join("; ");
      evidence.push({ key: "Employment", value: jobs });
    }
    if (person.educations?.length) {
      const edu = person.educations.map(e => `${e.degree} from ${e.school}`).join("; ");
      evidence.push({ key: "Education", value: edu });
    }

    if (evidence.length > 0) {
      findings.push({
        id: generateFindingId("pipl", "person_record", target),
        type: "identity" as const,
        title: `Comprehensive Person Record Found`,
        description: `Pipl found detailed identity information for ${target}.`,
        severity: "medium" as any,
        confidence: 0.9,
        provider: "Pipl",
        providerCategory: "Identity Resolution",
        evidence,
        impact: "Extensive personal data including employment and education history available",
        remediation: [
          "Verify data accuracy",
          "Request data removal if needed",
          "Monitor for misuse",
        ],
        tags: ["identity", "pii", "background"],
        observedAt: new Date().toISOString(),
        raw: person,
      });
    }

    if (person.usernames?.length) {
      findings.push({
        id: generateFindingId("pipl", "usernames", target),
        type: "social_media" as const,
        title: `${person.usernames.length} Username${person.usernames.length > 1 ? "s" : ""} Found`,
        description: `Pipl discovered ${person.usernames.length} associated username(s).`,
        severity: "info" as any,
        confidence: 0.75,
        provider: "Pipl",
        providerCategory: "Username Intelligence",
        evidence: person.usernames.map((u, i) => ({ key: `Username ${i + 1}`, value: u.content })),
        impact: "Online identities mapped across platforms",
        remediation: ["Secure accounts", "Enable 2FA"],
        tags: ["usernames", "identity"],
        observedAt: new Date().toISOString(),
        raw: { usernames: person.usernames },
      });
    }
  }

  return findings;
}
