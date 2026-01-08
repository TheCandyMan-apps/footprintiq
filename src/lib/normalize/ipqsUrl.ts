import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface IPQSURLResult {
  success: boolean;
  message?: string;
  unsafe: boolean;
  domain: string;
  ip_address: string;
  server: string;
  content_type: string;
  status_code: number;
  page_size: number;
  domain_rank: number;
  dns_valid: boolean;
  parking: boolean;
  spamming: boolean;
  malware: boolean;
  phishing: boolean;
  suspicious: boolean;
  adult: boolean;
  risk_score: number;
  category: string;
  domain_age: {
    human: string;
    timestamp: number;
    iso: string;
  };
  redirected: boolean;
  final_url?: string;
  request_id?: string;
}

/**
 * Extract URL risk data from IPQS result
 */
export interface IPQSURLRiskData {
  riskScore: number;
  isUnsafe: boolean;
  isMalware: boolean;
  isPhishing: boolean;
  isSpamming: boolean;
  isSuspicious: boolean;
  isParking: boolean;
  isAdult: boolean;
  domainAge: string;
  domainRank: number;
  category: string;
}

export function extractIPQSURLRiskData(result: IPQSURLResult): IPQSURLRiskData {
  return {
    riskScore: result.risk_score || 0,
    isUnsafe: result.unsafe || false,
    isMalware: result.malware || false,
    isPhishing: result.phishing || false,
    isSpamming: result.spamming || false,
    isSuspicious: result.suspicious || false,
    isParking: result.parking || false,
    isAdult: result.adult || false,
    domainAge: result.domain_age?.human || 'Unknown',
    domainRank: result.domain_rank || 0,
    category: result.category || 'Unknown',
  };
}

export function normalizeIPQSURL(result: IPQSURLResult, url: string): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();
  
  // Always generate basic URL analysis finding
  const riskLevel = result.risk_score > 85 ? 'high' : result.risk_score > 50 ? 'medium' : result.risk_score > 25 ? 'low' : 'info';
  
  findings.push({
    id: generateFindingId("ipqs_url", "url_analysis", url),
    type: "url_analysis" as const,
    title: `URL Security Analysis: ${result.domain}`,
    description: `URL ${url} has been analyzed with a risk score of ${result.risk_score}/100.`,
    severity: riskLevel,
    confidence: 0.85,
    provider: "IPQualityScore",
    providerCategory: "URL Intelligence",
    evidence: [
      { key: "URL", value: url },
      { key: "Domain", value: result.domain || 'Unknown' },
      { key: "Risk Score", value: `${result.risk_score}/100` },
      { key: "Category", value: result.category || 'Unknown' },
      { key: "Domain Age", value: result.domain_age?.human || 'Unknown' },
      { key: "Domain Rank", value: result.domain_rank?.toString() || 'Unknown' },
      { key: "IP Address", value: result.ip_address || 'Unknown' },
      { key: "Status Code", value: result.status_code?.toString() || 'Unknown' },
      { key: "DNS Valid", value: String(result.dns_valid) },
    ],
    impact: "URL analysis helps identify potentially malicious or suspicious websites",
    remediation: [
      "Review the URL's reputation before clicking",
      "Use browser security extensions",
      "Report suspicious URLs to relevant authorities",
    ],
    tags: ["url", "security", result.category?.toLowerCase() || "unknown"],
    observedAt: now,
    raw: result,
  });
  
  // Phishing Detection
  if (result.phishing) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_phishing", url),
      type: "url_phishing" as const,
      title: `Phishing URL Detected`,
      description: `URL ${url} has been identified as a phishing site.`,
      severity: "high",
      confidence: 0.9,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Phishing", value: "true" },
        { key: "Risk Score", value: `${result.risk_score}/100` },
      ],
      impact: "Phishing sites attempt to steal credentials, personal information, or financial data",
      remediation: [
        "Do not enter any credentials on this site",
        "Report to Google Safe Browsing and PhishTank",
        "Warn others who may have accessed this URL",
        "Check for similar phishing domains",
      ],
      tags: ["url", "phishing", "threat", "high-risk"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Malware Detection
  if (result.malware) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_malware", url),
      type: "url_malware" as const,
      title: `Malware Distribution URL Detected`,
      description: `URL ${url} is associated with malware distribution.`,
      severity: "high",
      confidence: 0.9,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Malware", value: "true" },
        { key: "Risk Score", value: `${result.risk_score}/100` },
      ],
      impact: "Visiting this URL may result in malware infection on your device",
      remediation: [
        "Do not visit or download anything from this URL",
        "Block this domain at the network level",
        "Scan any systems that accessed this URL",
        "Report to security vendors",
      ],
      tags: ["url", "malware", "threat", "high-risk"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Spam Domain
  if (result.spamming) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_spam", url),
      type: "url_spam" as const,
      title: `Spam Domain Detected`,
      description: `URL ${url} is from a domain known for spamming activities.`,
      severity: "medium",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Spamming", value: "true" },
        { key: "Risk Score", value: `${result.risk_score}/100` },
      ],
      impact: "Spam domains often distribute unwanted content or are used in email spam campaigns",
      remediation: [
        "Add domain to email spam filters",
        "Block domain in web filters",
        "Report to spam blocklists",
      ],
      tags: ["url", "spam"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Suspicious URL
  if (result.suspicious && !result.phishing && !result.malware) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_suspicious", url),
      type: "url_suspicious" as const,
      title: `Suspicious URL Detected`,
      description: `URL ${url} shows suspicious characteristics.`,
      severity: "medium",
      confidence: 0.75,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Suspicious", value: "true" },
        { key: "Risk Score", value: `${result.risk_score}/100` },
        { key: "Domain Age", value: result.domain_age?.human || 'Unknown' },
      ],
      impact: "Suspicious URLs may be newly registered or exhibit patterns common to malicious sites",
      remediation: [
        "Exercise caution when interacting with this URL",
        "Verify the legitimacy of the site through other means",
        "Monitor for further suspicious indicators",
      ],
      tags: ["url", "suspicious"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Parking Domain
  if (result.parking) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_parking", url),
      type: "url_parking" as const,
      title: `Parked Domain Detected`,
      description: `URL ${url} points to a parked domain.`,
      severity: "low",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Parking", value: "true" },
      ],
      impact: "Parked domains are not actively used and may be squatted or waiting for sale",
      remediation: [
        "This URL does not lead to active content",
        "May indicate typosquatting if similar to a known brand",
      ],
      tags: ["url", "parking"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Adult Content
  if (result.adult) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_adult", url),
      type: "url_adult" as const,
      title: `Adult Content URL`,
      description: `URL ${url} contains adult content.`,
      severity: "info",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "URL", value: url },
        { key: "Domain", value: result.domain || 'Unknown' },
        { key: "Adult", value: "true" },
        { key: "Category", value: result.category || 'Adult' },
      ],
      impact: "This URL may contain content unsuitable for all audiences",
      remediation: [
        "Apply content filtering if required by policy",
        "Consider age verification requirements",
      ],
      tags: ["url", "adult", "content"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Redirect Detection
  if (result.redirected && result.final_url) {
    findings.push({
      id: generateFindingId("ipqs_url", "url_redirect", url),
      type: "url_redirect" as const,
      title: `URL Redirect Detected`,
      description: `URL ${url} redirects to ${result.final_url}.`,
      severity: "info",
      confidence: 0.9,
      provider: "IPQualityScore",
      providerCategory: "URL Intelligence",
      evidence: [
        { key: "Original URL", value: url },
        { key: "Final URL", value: result.final_url },
        { key: "Redirected", value: "true" },
      ],
      impact: "URL redirects can hide the true destination and may be used in phishing",
      remediation: [
        "Verify the final destination is expected",
        "Be cautious of shortened URLs that redirect",
      ],
      tags: ["url", "redirect"],
      observedAt: now,
      raw: result,
    });
  }

  return findings;
}
