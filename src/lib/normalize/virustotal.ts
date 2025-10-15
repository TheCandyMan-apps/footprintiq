import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface VirusTotalResult {
  domain: string;
  positives: number;
  total: number;
  scan_date: string;
  permalink?: string;
  detected_urls?: Array<{
    url: string;
    positives: number;
    total: number;
  }>;
  categories?: Record<string, string>;
}

export function normalizeVirusTotal(result: VirusTotalResult, domain: string): Finding[] {
  const findings: Finding[] = [];
  
  const detectionRate = result.total > 0 ? result.positives / result.total : 0;
  
  if (result.positives > 0) {
    let severity: "critical" | "high" | "medium" = "medium";
    if (detectionRate > 0.3) severity = "critical";
    else if (detectionRate > 0.1) severity = "high";
    
    findings.push({
      id: generateFindingId("virustotal", "domain_reputation", domain),
      type: "domain_reputation" as const,
      title: `Domain Flagged by ${result.positives} Security Vendors`,
      description: `${domain} has been flagged as malicious or suspicious by ${result.positives} out of ${result.total} security vendors.`,
      severity,
      confidence: 0.8,
      provider: "VirusTotal",
      providerCategory: "Domain Reputation",
      evidence: [
        { key: "Domain", value: domain },
        { key: "Detections", value: `${result.positives}/${result.total}` },
        { key: "Detection Rate", value: `${(detectionRate * 100).toFixed(1)}%` },
        { key: "Last Scanned", value: result.scan_date },
        ...(result.categories ? Object.entries(result.categories).map(([vendor, category]) => ({
          key: vendor,
          value: category,
        })) : []),
      ],
      impact: detectionRate > 0.3
        ? "High risk of malware, phishing, or other malicious activity"
        : "Potential security concerns detected by multiple vendors",
      remediation: [
        "Verify you own or control this domain",
        "Scan your website for malware and malicious code",
        "Review all third-party scripts and plugins",
        "Check for compromised credentials or unauthorized access",
        "Submit false positive report to security vendors if this is an error",
        "Implement web application firewall (WAF)",
        "Enable HTTPS and security headers (CSP, HSTS)",
      ],
      tags: ["domain", "reputation", "malware", "security"],
      observedAt: result.scan_date || new Date().toISOString(),
      url: result.permalink,
      raw: result,
    });
  }

  if (result.detected_urls && result.detected_urls.length > 0) {
    const maliciousUrls = result.detected_urls.filter((u) => u.positives > 0);
    if (maliciousUrls.length > 0) {
      findings.push({
        id: generateFindingId("virustotal", "domain_reputation", `${domain}_urls`),
        type: "domain_reputation" as const,
        title: `${maliciousUrls.length} Malicious URLs Found on Domain`,
        description: `${maliciousUrls.length} URLs on ${domain} have been flagged as malicious by security vendors.`,
        severity: "high",
        confidence: 0.75,
        provider: "VirusTotal",
        providerCategory: "Domain Reputation",
        evidence: maliciousUrls.slice(0, 10).map((url, idx) => ({
          key: `URL ${idx + 1}`,
          value: `${url.url} (${url.positives}/${url.total} detections)`,
        })),
        impact: "Multiple malicious or compromised pages detected on your domain",
        remediation: [
          "Remove or quarantine all flagged URLs immediately",
          "Scan entire website for malware and backdoors",
          "Review recent file changes and uploads",
          "Change all admin credentials",
          "Restore from clean backup if compromise is widespread",
        ],
        tags: ["domain", "malicious_urls", "compromise"],
        observedAt: new Date().toISOString(),
        raw: { detected_urls: maliciousUrls },
      });
    }
  }

  return findings;
}
