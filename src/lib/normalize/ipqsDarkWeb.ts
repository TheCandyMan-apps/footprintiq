import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface IPQSDarkWebResult {
  success: boolean;
  message?: string;
  found: boolean;
  email?: string;
  source?: string;
  first_seen?: {
    human: string;
    timestamp: number;
    iso: string;
  };
  last_seen?: {
    human: string;
    timestamp: number;
    iso: string;
  };
  plain_text?: boolean;
  request_id?: string;
  // Extended breach data if available
  breaches?: Array<{
    name: string;
    date?: string;
    domain?: string;
    data_classes?: string[];
  }>;
  exposure_count?: number;
}

/**
 * Extract dark web exposure data
 */
export interface IPQSDarkWebData {
  found: boolean;
  source: string | null;
  firstSeen: string | null;
  lastSeen: string | null;
  plainTextExposed: boolean;
  exposureCount: number;
}

export function extractIPQSDarkWebData(result: IPQSDarkWebResult): IPQSDarkWebData {
  return {
    found: result.found || false,
    source: result.source || null,
    firstSeen: result.first_seen?.human || null,
    lastSeen: result.last_seen?.human || null,
    plainTextExposed: result.plain_text || false,
    exposureCount: result.exposure_count || (result.found ? 1 : 0),
  };
}

export function normalizeIPQSDarkWeb(result: IPQSDarkWebResult, email: string): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();
  
  if (!result.found) {
    // No exposure found - create a positive finding
    findings.push({
      id: generateFindingId("ipqs_darkweb", "darkweb_clear", email),
      type: "darkweb_scan" as const,
      title: `No Dark Web Exposure Found`,
      description: `Email ${email} was not found in dark web databases or known data breaches.`,
      severity: "info",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "Dark Web Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Dark Web Found", value: "false" },
        { key: "Scan Date", value: now },
      ],
      impact: "No immediate dark web exposure detected for this email address",
      remediation: [
        "Continue monitoring for future exposures",
        "Maintain strong password hygiene",
        "Enable two-factor authentication where possible",
      ],
      tags: ["email", "darkweb", "clear"],
      observedAt: now,
      raw: result,
    });
    return findings;
  }
  
  // Email found in dark web / breaches
  const severity = result.plain_text ? "high" : "medium";
  
  findings.push({
    id: generateFindingId("ipqs_darkweb", "darkweb_exposure", email),
    type: "darkweb_exposure" as const,
    title: `Dark Web Exposure Detected`,
    description: `Email ${email} has been found exposed in dark web databases${result.source ? ` (source: ${result.source})` : ''}.`,
    severity: severity,
    confidence: 0.9,
    provider: "IPQualityScore",
    providerCategory: "Dark Web Intelligence",
    evidence: [
      { key: "Email", value: email },
      { key: "Dark Web Found", value: "true" },
      { key: "Source", value: result.source || 'Unknown' },
      { key: "First Seen", value: result.first_seen?.human || 'Unknown' },
      { key: "Last Seen", value: result.last_seen?.human || 'Unknown' },
      { key: "Plain Text Password", value: String(result.plain_text || false) },
      { key: "Exposure Count", value: String(result.exposure_count || 1) },
    ],
    impact: result.plain_text 
      ? "Email and password exposed in plain text - immediate credential change required"
      : "Email found in breach data - associated credentials may be compromised",
    remediation: [
      "Change passwords immediately for all accounts using this email",
      "Enable two-factor authentication on all accounts",
      "Check for unauthorized access to accounts",
      "Consider using a password manager with unique passwords",
      "Monitor accounts for suspicious activity",
      "Consider identity theft protection services",
    ],
    tags: ["email", "darkweb", "breach", "exposure"],
    observedAt: now,
    raw: result,
  });
  
  // Plain text password exposure - additional critical finding
  if (result.plain_text) {
    findings.push({
      id: generateFindingId("ipqs_darkweb", "plaintext_password", email),
      type: "credential_exposure" as const,
      title: `Plain Text Password Exposed`,
      description: `Email ${email} has passwords exposed in plain text in dark web databases.`,
      severity: "high",
      confidence: 0.95,
      provider: "IPQualityScore",
      providerCategory: "Dark Web Intelligence",
      evidence: [
        { key: "Email", value: email },
        { key: "Plain Text Exposure", value: "true" },
        { key: "Source", value: result.source || 'Unknown' },
      ],
      impact: "Attackers have direct access to credentials without needing to crack password hashes",
      remediation: [
        "URGENT: Change all passwords immediately",
        "Assume all accounts using this email are compromised",
        "Enable 2FA on all accounts",
        "Check for unauthorized transactions or changes",
        "Report to relevant financial institutions",
      ],
      tags: ["email", "password", "plaintext", "critical"],
      observedAt: now,
      raw: result,
    });
  }
  
  // Individual breach findings if available
  if (result.breaches && result.breaches.length > 0) {
    result.breaches.forEach((breach, index) => {
      findings.push({
        id: generateFindingId("ipqs_darkweb", `breach_${breach.name}`, email),
        type: "breach_detail" as const,
        title: `Breach: ${breach.name}`,
        description: `Email ${email} was exposed in the ${breach.name} data breach${breach.date ? ` on ${breach.date}` : ''}.`,
        severity: "medium",
        confidence: 0.85,
        provider: "IPQualityScore",
        providerCategory: "Dark Web Intelligence",
        evidence: [
          { key: "Email", value: email },
          { key: "Breach Name", value: breach.name },
          { key: "Breach Date", value: breach.date || 'Unknown' },
          { key: "Domain", value: breach.domain || 'Unknown' },
          { key: "Data Classes", value: breach.data_classes?.join(', ') || 'Unknown' },
        ],
        impact: `Data from the ${breach.name} breach may include: ${breach.data_classes?.join(', ') || 'various personal information'}`,
        remediation: [
          `Change password for ${breach.domain || 'affected service'}`,
          "Check if you reused this password elsewhere",
          "Enable 2FA where available",
        ],
        tags: ["email", "breach", breach.name.toLowerCase().replace(/\s+/g, '-')],
        observedAt: now,
        raw: breach,
      });
    });
  }

  return findings;
}
