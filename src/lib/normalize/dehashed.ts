import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface DeHashedResult {
  total?: number;
  entries?: Array<{
    database_name: string;
    email?: string;
    username?: string;
    hashed_password?: string;
  }>;
}

export function normalizeDeHashed(result: DeHashedResult, query: string): Finding[] {
  const findings: Finding[] = [];
  
  const total = result.total || 0;
  
  if (total === 0) {
    // No breaches found - this is good news!
    findings.push({
      id: generateFindingId("dehashed", "no_credential_exposure", query),
      type: "breach" as const,
      title: "No Credential Exposures Found",
      description: `DeHashed found no credential exposures for "${query}". This target does not appear in known breach databases.`,
      severity: "low" as any,
      confidence: 0.9,
      provider: "DeHashed",
      providerCategory: "Credential Intelligence",
      evidence: [
        { key: "Status", value: "Clean" },
        { key: "Breaches Found", value: "0" },
      ],
      impact: "No known credential compromises detected",
      remediation: [
        "Continue monitoring for new breaches",
        "Maintain strong, unique passwords",
        "Keep multi-factor authentication enabled",
      ],
      tags: ["credentials", "all-clear"],
      observedAt: new Date().toISOString(),
      raw: { total: 0 },
    });
  } else if (total > 0) {
    const severity = total > 10 ? "critical" : total > 3 ? "high" : "medium";
    
    const databaseNames = result.entries
      ? Array.from(new Set(result.entries.map((e) => e.database_name))).slice(0, 5)
      : [];
    
    findings.push({
      id: generateFindingId("dehashed", "credential_exposure_summary", query),
      type: "breach" as const,
      title: `Credential Exposure: ${total} Record${total > 1 ? "s" : ""}`,
      description: `DeHashed found ${total} credential exposure(s) for "${query}" across multiple breach databases. (Counts only; no PII retrieved.)`,
      severity: severity as any,
      confidence: 0.85,
      provider: "DeHashed",
      providerCategory: "Credential Intelligence",
      evidence: [
        { key: "Total Records", value: total },
        { key: "Databases", value: databaseNames.join(", ") || "Unknown" },
      ],
      impact: "Credentials may be compromised and used for account takeover",
      remediation: [
        "Reset passwords immediately",
        "Enable multi-factor authentication",
        "Check for unauthorized account access",
        "Monitor for additional exposures",
      ],
      tags: ["credentials", "breach", "exposure"],
      observedAt: new Date().toISOString(),
      raw: { total, databases: databaseNames },
    });
  }
  
  return findings;
}
