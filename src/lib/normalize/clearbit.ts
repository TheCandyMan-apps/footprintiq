import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface ClearbitResult {
  name?: string;
  domain?: string;
  category?: {
    industry?: string;
    sector?: string;
  };
  metrics?: {
    employees?: number;
    employeesRange?: string;
    annualRevenue?: number;
  };
  location?: string;
  description?: string;
  linkedin?: { handle?: string };
  twitter?: { handle?: string };
  facebook?: { handle?: string };
  tech?: string[];
  tags?: string[];
  person?: {
    name?: { fullName?: string };
    email?: string;
    employment?: { name?: string; title?: string; role?: string };
  };
}

export function normalizeClearbit(
  result: ClearbitResult,
  target: string,
  type: string
): Finding[] {
  const findings: Finding[] = [];

  if (!result || Object.keys(result).length === 0) {
    return findings;
  }

  if (type === 'domain' || type === 'company') {
    const evidence: Array<{ key: string; value: any }> = [];

    if (result.name) evidence.push({ key: "Company", value: result.name });
    if (result.category?.industry) evidence.push({ key: "Industry", value: result.category.industry });
    if (result.metrics?.employeesRange) {
      evidence.push({ key: "Employees", value: result.metrics.employeesRange });
    }
    if (result.metrics?.annualRevenue) {
      evidence.push({ key: "Revenue", value: `$${(result.metrics.annualRevenue / 1_000_000).toFixed(1)}M` });
    }
    if (result.location) evidence.push({ key: "Location", value: result.location });
    if (result.tech?.length) {
      evidence.push({ key: "Technologies", value: result.tech.slice(0, 10).join(", ") });
    }

    if (evidence.length > 0) {
      findings.push({
        id: generateFindingId("clearbit", "company_profile", target),
        type: "identity" as const,
        title: `Company Profile: ${result.name || target}`,
        description: `Clearbit enriched company data for ${target}.`,
        severity: "info" as any,
        confidence: 0.9,
        provider: "Clearbit",
        providerCategory: "Company Intelligence",
        evidence,
        impact: "Detailed company information and tech stack revealed",
        remediation: ["Review public data accuracy", "Monitor competitive intelligence"],
        tags: ["company", "enrichment", "corporate"],
        observedAt: new Date().toISOString(),
        raw: result,
      });
    }
  } else if (result.person) {
    const evidence: Array<{ key: string; value: any }> = [];

    if (result.person.name?.fullName) {
      evidence.push({ key: "Name", value: result.person.name.fullName });
    }
    if (result.person.employment) {
      const emp = result.person.employment;
      evidence.push({ key: "Role", value: `${emp.title} at ${emp.name}` });
    }

    if (evidence.length > 0) {
      findings.push({
        id: generateFindingId("clearbit", "person_profile", target),
        type: "identity" as const,
        title: `Person Profile Found`,
        description: `Clearbit found professional information for ${target}.`,
        severity: "info" as any,
        confidence: 0.85,
        provider: "Clearbit",
        providerCategory: "People Intelligence",
        evidence,
        impact: "Professional identity and employment details available",
        remediation: ["Verify profile accuracy", "Update LinkedIn privacy settings"],
        tags: ["identity", "professional"],
        observedAt: new Date().toISOString(),
        raw: result.person,
      });
    }
  }

  return findings;
}
