import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface IPQSEmailResult {
  valid: boolean;
  disposable: boolean;
  honeypot: boolean;
  deliverability: string;
  fraud_score: number;
  recent_abuse: boolean;
  leaked: boolean;
  suspect: boolean;
  spam_trap_score: string;
  catch_all: boolean;
  domain_age?: {
    human: string;
    timestamp: number;
    iso: string;
  };
  first_seen?: {
    human: string;
    timestamp: number;
    iso: string;
  };
  spf_record: boolean;
  dmarc_record: boolean;
  smtp_score: number;
  overall_score: number;
  sanitized_email: string;
  dns_valid: boolean;
  message: string;
  success: boolean;
}

export function normalizeIPQSEmail(result: IPQSEmailResult, email: string): Finding[] {
  const findings: Finding[] = [];
  
  // Basic email validation
  if (result.valid !== undefined) {
    const severity = result.fraud_score > 75 ? "high" : result.fraud_score > 50 ? "medium" : result.fraud_score > 25 ? "low" : "info";
    
    findings.push({
      id: generateFindingId("ipqs_email", "email_validation", email),
      type: "identity" as const,
      title: `Email Fraud Score: ${result.fraud_score}/100`,
      description: `${email} has a fraud score of ${result.fraud_score}/100. ${result.deliverability === 'high' ? 'High deliverability.' : result.deliverability === 'low' ? 'Low deliverability.' : ''}`,
      severity,
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Valid", value: result.valid },
        { key: "Fraud Score", value: `${result.fraud_score}/100` },
        { key: "Deliverability", value: result.deliverability || "unknown" },
        { key: "Domain Age", value: result.domain_age?.human || "Unknown" },
        { key: "First Seen", value: result.first_seen?.human || "Unknown" },
        { key: "SPF Record", value: result.spf_record },
        { key: "DMARC Record", value: result.dmarc_record },
        { key: "DNS Valid", value: result.dns_valid },
      ],
      impact: severity === "high" 
        ? "High-risk email - may be associated with fraud or abuse"
        : severity === "medium"
        ? "Email has moderate risk indicators"
        : "Email validation completed",
      remediation: severity !== "info" ? [
        "Verify identity through additional channels",
        "Enable additional email verification steps",
        "Monitor for suspicious activity",
      ] : [],
      tags: ["email", "fraud", "validation"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  // Disposable email detection
  if (result.disposable) {
    findings.push({
      id: generateFindingId("ipqs_email", "disposable", email),
      type: "identity" as const,
      title: "Disposable Email Detected",
      description: `${email} is a disposable/temporary email address.`,
      severity: "medium",
      confidence: 0.9,
      provider: "IPQualityScore",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Disposable", value: true },
        { key: "Domain", value: email.split("@")[1] || "" },
      ],
      impact: "Disposable emails are often used to avoid verification and may indicate fraud",
      remediation: [
        "Consider requiring a non-disposable email for account creation",
        "Implement additional verification steps",
      ],
      tags: ["email", "disposable", "temporary"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  // Data leak detection
  if (result.leaked) {
    findings.push({
      id: generateFindingId("ipqs_email", "leaked", email),
      type: "breach" as const,
      title: "Email Found in Data Leaks",
      description: `${email} has been found in data breach or leak databases.`,
      severity: "high",
      confidence: 0.85,
      provider: "IPQualityScore",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Leaked", value: true },
        { key: "First Seen", value: result.first_seen?.human || "Unknown" },
      ],
      impact: "Email credentials may have been compromised in a data breach",
      remediation: [
        "Change passwords on all accounts using this email",
        "Enable two-factor authentication",
        "Monitor for unauthorized access",
        "Check haveibeenpwned.com for additional breach details",
      ],
      tags: ["email", "breach", "leaked", "security"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  // Spam trap / honeypot detection
  if (result.honeypot || result.spam_trap_score !== "none") {
    findings.push({
      id: generateFindingId("ipqs_email", "spam_trap", email),
      type: "identity" as const,
      title: "Spam Trap Risk Detected",
      description: `${email} may be a spam trap or honeypot address.`,
      severity: "medium",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Honeypot", value: result.honeypot },
        { key: "Spam Trap Score", value: result.spam_trap_score || "none" },
      ],
      impact: "Sending to spam traps can damage sender reputation and lead to blacklisting",
      remediation: [
        "Verify the email owner through other channels",
        "Remove from mailing lists if unverified",
      ],
      tags: ["email", "spam", "honeypot", "trap"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  // Recent abuse detection
  if (result.recent_abuse) {
    findings.push({
      id: generateFindingId("ipqs_email", "abuse", email),
      type: "identity" as const,
      title: "Recent Abuse Activity Detected",
      description: `${email} has been associated with recent abuse or fraudulent activity.`,
      severity: "high",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "Email Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Recent Abuse", value: true },
        { key: "Fraud Score", value: `${result.fraud_score}/100` },
      ],
      impact: "Email has been flagged for recent fraudulent or abusive behavior",
      remediation: [
        "Block or flag this email for review",
        "Implement additional verification",
        "Monitor for suspicious activity",
      ],
      tags: ["email", "abuse", "fraud", "security"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  return findings;
}
