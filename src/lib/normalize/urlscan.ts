import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface URLScanResult {
  uuid?: string;
  page?: {
    url: string;
    domain: string;
  };
  verdicts?: {
    overall?: {
      score: number;
      malicious: boolean;
    };
  };
  task?: {
    screenshotURL?: string;
  };
  lists?: {
    ips?: string[];
    domains?: string[];
  };
}

export function normalizeURLScan(result: URLScanResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  const score = result.verdicts?.overall?.score || 0;
  const malicious = result.verdicts?.overall?.malicious || false;
  
  if (score > 0 || malicious) {
    const severity = malicious ? "high" : score > 50 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("urlscan", "phish_suspect_url", domain),
      type: "domain_reputation" as const,
      title: `Phishing/Malicious Score: ${score}`,
      description: `URLScan.io ${malicious ? "flagged" : "scored"} ${domain} as ${
        malicious ? "malicious" : "suspicious"
      } (score: ${score}).`,
      severity: severity as any,
      confidence: 0.8,
      provider: "URLScan.io",
      providerCategory: "Phishing Detection",
      evidence: [
        { key: "Score", value: score },
        { key: "Malicious", value: malicious },
        { key: "Scan UUID", value: result.uuid || "Unknown" },
      ],
      impact: "Domain may be involved in phishing, malware, or scam activity",
      remediation: [
        "Verify domain ownership and legitimacy",
        "Check for compromised pages",
        "Review URLScan report for details",
        "Submit false positive if this is an error",
      ],
      tags: ["domain", "phishing", "malware"],
      observedAt: new Date().toISOString(),
      url: result.task?.screenshotURL,
      raw: result,
    });
  }
  
  return findings;
}
