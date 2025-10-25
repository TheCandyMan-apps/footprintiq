import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface AbstractPhoneResult {
  phone: string;
  valid: boolean;
  format?: {
    international: string;
    local: string;
  };
  country?: {
    code: string;
    name: string;
  };
  carrier?: string;
  line_type?: string;
}

export function normalizeAbstractPhone(result: AbstractPhoneResult, phone: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.valid) {
    findings.push({
      id: generateFindingId("abstract_phone", "phone_validation", phone),
      type: "phone_intelligence" as const,
      title: `Phone Validated: ${result.format?.international || phone}`,
      description: `AbstractAPI validated phone number as ${result.line_type || "unknown type"} in ${
        result.country?.name || "unknown country"
      }.`,
      severity: "info" as any,
      confidence: 0.85,
      provider: "AbstractAPI Phone",
      providerCategory: "Phone Intelligence",
      evidence: [
        { key: "Valid", value: true },
        { key: "Country", value: result.country?.name || "Unknown" },
        { key: "Carrier", value: result.carrier || "Unknown" },
        { key: "Line Type", value: result.line_type || "Unknown" },
      ],
      impact: "Phone number is valid and can receive calls/messages",
      remediation: [],
      tags: ["phone", "validation"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
