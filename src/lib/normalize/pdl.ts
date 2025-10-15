import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface PeopleDataLabsResult {
  full_name?: string;
  location?: string;
  job_title?: string;
  job_company?: string;
  emails?: string[];
  phone_numbers?: string[];
  profiles?: Array<{
    network: string;
    url: string;
    username?: string;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
  }>;
  work_experience?: Array<{
    company: string;
    title?: string;
    start_date?: string;
    end_date?: string;
  }>;
}

export function normalizePeopleDataLabs(result: PeopleDataLabsResult, query: string): Finding[] {
  const findings: Finding[] = [];
  
  const dataPoints = [
    result.full_name && "Full Name",
    result.location && "Location",
    result.job_title && "Job Title",
    result.job_company && "Employer",
    result.emails && result.emails.length > 0 && `${result.emails.length} Email(s)`,
    result.phone_numbers && result.phone_numbers.length > 0 && `${result.phone_numbers.length} Phone(s)`,
    result.profiles && result.profiles.length > 0 && `${result.profiles.length} Profile(s)`,
    result.education && result.education.length > 0 && "Education",
    result.work_experience && result.work_experience.length > 0 && "Work History",
  ].filter(Boolean) as string[];

  if (dataPoints.length > 0) {
    findings.push({
      id: generateFindingId("pdl", "identity", query),
      type: "identity" as const,
      title: `${dataPoints.length} Personal Data Points Found`,
      description: `Extensive personal information about ${query} is available in people-search databases.`,
      severity: dataPoints.length > 5 ? "high" : "medium",
      confidence: 0.7,
      provider: "People Data Labs",
      providerCategory: "Identity Enrichment",
      evidence: [
        ...(result.full_name ? [{ key: "Full Name", value: result.full_name }] : []),
        ...(result.location ? [{ key: "Location", value: result.location }] : []),
        ...(result.job_title ? [{ key: "Job Title", value: result.job_title }] : []),
        ...(result.job_company ? [{ key: "Company", value: result.job_company }] : []),
        ...(result.emails ? result.emails.map((e, i) => ({ key: `Email ${i + 1}`, value: e })) : []),
        ...(result.phone_numbers ? result.phone_numbers.map((p, i) => ({ key: `Phone ${i + 1}`, value: p })) : []),
        ...(result.profiles ? result.profiles.slice(0, 5).map((p, i) => ({ key: `${p.network} Profile`, value: p.url })) : []),
      ],
      impact: "Personal and professional information can be used for social engineering, phishing, or identity theft",
      remediation: [
        "Submit opt-out requests to people-search sites",
        "Review and tighten privacy settings on professional networks (LinkedIn, etc.)",
        "Remove or limit personal information from public profiles",
        "Consider using a P.O. Box for business registration",
        "Enable privacy settings on social media",
        "Use FootprintIQ's automated data removal service",
      ],
      tags: ["identity", "pii", "people_search", "enrichment"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  return findings;
}
