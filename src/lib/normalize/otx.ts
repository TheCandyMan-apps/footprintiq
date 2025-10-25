import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface OTXResult {
  indicator: string;
  pulse_count?: number;
  pulses?: Array<{
    name: string;
    description?: string;
    tags?: string[];
  }>;
  validation?: Array<{
    source: string;
    message: string;
  }>;
}

export function normalizeOTX(result: OTXResult, target: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.pulse_count && result.pulse_count > 0) {
    const severity = result.pulse_count > 10 ? "high" : result.pulse_count > 3 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("otx", "ip_reputation", target),
      type: "domain_reputation" as const,
      title: `Threat Intelligence: ${result.pulse_count} Pulse${result.pulse_count > 1 ? "s" : ""}`,
      description: `AlienVault OTX reports ${result.pulse_count} threat pulse(s) associated with ${target}.`,
      severity: severity as any,
      confidence: 0.75,
      provider: "AlienVault OTX",
      providerCategory: "Threat Intel",
      evidence: (result.pulses || []).slice(0, 5).map((p) => ({
        key: p.name,
        value: p.description || "No description",
      })),
      impact: "Indicator may be associated with malicious activity or campaigns",
      remediation: [
        "Investigate the nature of threat pulses",
        "Check if this is a false positive",
        "Review logs for suspicious activity",
        "Consider blocking or monitoring this indicator",
      ],
      tags: ["threat", "reputation", "otx"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
