import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface VirusTotalV3Result {
  id: string;
  type: "domain" | "ip_address";
  attributes?: {
    last_analysis_stats?: {
      malicious: number;
      suspicious: number;
      harmless: number;
      undetected: number;
    };
    last_analysis_date?: number;
    categories?: Record<string, string>;
  };
}

export function normalizeVirusTotalV3(result: VirusTotalV3Result, target: string): Finding[] {
  const findings: Finding[] = [];
  
  const stats = result.attributes?.last_analysis_stats;
  if (!stats) return findings;
  
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = malicious + suspicious + stats.harmless + stats.undetected;
  const detectionRate = total > 0 ? (malicious + suspicious) / total : 0;
  
  if (malicious > 0 || suspicious > 0) {
    const severity =
      malicious > 10 ? "critical" : malicious > 5 ? "high" : suspicious > 10 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("virustotal_v3", result.type === "domain" ? "domain_reputation" : "ip_reputation", target),
      type: (result.type === "domain" ? "domain_reputation" : "ip_exposure") as any,
      title: `VirusTotal: ${malicious} Malicious, ${suspicious} Suspicious`,
      description: `VirusTotal v3 detected ${malicious} malicious and ${suspicious} suspicious verdict(s) for ${target} out of ${total} engine(s).`,
      severity: severity as any,
      confidence: 0.85,
      provider: "VirusTotal",
      providerCategory: "Multi-Engine Scanning",
      evidence: [
        { key: "Malicious", value: malicious },
        { key: "Suspicious", value: suspicious },
        { key: "Harmless", value: stats.harmless },
        { key: "Undetected", value: stats.undetected },
        { key: "Detection Rate", value: `${(detectionRate * 100).toFixed(1)}%` },
      ],
      impact: "Indicator may be involved in malware, phishing, or other malicious activity",
      remediation: [
        "Review VirusTotal report for details",
        "Check for false positives",
        "Investigate if legitimate and flag as such",
        "Block or monitor this indicator",
      ],
      tags: [result.type === "domain" ? "domain" : "ip", "reputation", "virustotal"],
      observedAt: result.attributes?.last_analysis_date
        ? new Date(result.attributes.last_analysis_date * 1000).toISOString()
        : new Date().toISOString(),
      url: `https://www.virustotal.com/gui/${result.type === "domain" ? "domain" : "ip-address"}/${target}`,
      raw: result,
    });
  }
  
  return findings;
}
