import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface IntelXResult {
  count?: number;
  records?: Array<{
    name: string;
    date: string;
    bucket: string;
  }>;
}

export function normalizeIntelX(result: IntelXResult, query: string): Finding[] {
  const findings: Finding[] = [];
  
  const count = result.count || 0;
  
  if (count > 0 && result.records && result.records.length > 0) {
    const severity = count > 10 ? "high" : count > 3 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("intelx", "artifact_paste_mention", query),
      type: "breach" as const,
      title: `Paste/Leak: ${count} Record${count > 1 ? "s" : ""}`,
      description: `IntelX found ${count} paste/leak record(s) mentioning "${query}". (Metadata only; content not retrieved.)`,
      severity: severity as any,
      confidence: 0.75,
      provider: "IntelX",
      providerCategory: "Paste/Leak Intelligence",
      evidence: result.records.slice(0, 5).map((record) => ({
        key: record.name,
        value: `${record.bucket} (${record.date})`,
      })),
      impact: "Pastes may contain credentials, PII, or other sensitive data",
      remediation: [
        "Investigate paste contents (with proper authorization)",
        "Rotate credentials if exposed",
        "Monitor for additional leaks",
      ],
      tags: ["paste", "leak", "darkweb"],
      observedAt: new Date().toISOString(),
      raw: { count },
    });
  }
  
  return findings;
}
