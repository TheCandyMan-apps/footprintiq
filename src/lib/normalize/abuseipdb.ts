import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface AbuseIPDBResult {
  ipAddress: string;
  abuseConfidenceScore?: number;
  totalReports?: number;
  numDistinctUsers?: number;
  lastReportedAt?: string;
  usageType?: string;
  isp?: string;
  domain?: string;
}

export function normalizeAbuseIPDB(result: AbuseIPDBResult, ip: string): Finding[] {
  const findings: Finding[] = [];
  
  const score = result.abuseConfidenceScore || 0;
  
  if (score > 0) {
    const severity =
      score > 75 ? "critical" : score > 50 ? "high" : score > 25 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("abuseipdb", "ip_abuse", ip),
      type: "ip_exposure" as const,
      title: `IP Abuse Score: ${score}%`,
      description: `AbuseIPDB reports an abuse confidence score of ${score}% for ${ip} based on ${result.totalReports || 0} report(s).`,
      severity: severity as any,
      confidence: 0.8,
      provider: "AbuseIPDB",
      providerCategory: "IP Reputation",
      evidence: [
        { key: "Abuse Score", value: `${score}%` },
        { key: "Total Reports", value: result.totalReports || 0 },
        { key: "Distinct Reporters", value: result.numDistinctUsers || 0 },
        { key: "Last Reported", value: result.lastReportedAt || "Unknown" },
        { key: "ISP", value: result.isp || "Unknown" },
      ],
      impact: "IP may be associated with spam, attacks, or malicious activity",
      remediation: [
        "Investigate the source of abuse reports",
        "Check if your server has been compromised",
        "Review outbound traffic for suspicious activity",
        "Consider rotating the IP if abuse is confirmed",
      ],
      tags: ["ip", "abuse", "reputation"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
