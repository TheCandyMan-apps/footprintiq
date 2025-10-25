import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface AbstractCompanyResult {
  domain: string;
  name?: string;
  country?: string;
  year_founded?: number;
  industry?: string;
  employees_count?: number;
  linkedin_url?: string;
}

export function normalizeAbstractCompany(result: AbstractCompanyResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.name) {
    findings.push({
      id: generateFindingId("abstract_company", "company_profile", domain),
      type: "identity" as const,
      title: `Company: ${result.name}`,
      description: `AbstractAPI identified ${result.name}${result.industry ? ` in ${result.industry}` : ""}${
        result.country ? `, based in ${result.country}` : ""
      }.`,
      severity: "info" as any,
      confidence: 0.75,
      provider: "AbstractAPI Company",
      providerCategory: "Business Intelligence",
      evidence: [
        { key: "Name", value: result.name },
        { key: "Industry", value: result.industry || "Unknown" },
        { key: "Country", value: result.country || "Unknown" },
        ...(result.year_founded ? [{ key: "Founded", value: result.year_founded }] : []),
        ...(result.employees_count ? [{ key: "Employees", value: result.employees_count }] : []),
      ],
      impact: "Company profile provides business context",
      remediation: [],
      tags: ["company", "business", "profile"],
      observedAt: new Date().toISOString(),
      url: result.linkedin_url,
      raw: result,
    });
  }
  
  return findings;
}
