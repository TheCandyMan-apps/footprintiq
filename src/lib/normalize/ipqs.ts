import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";
import type { CarrierData } from "./numverify";

export interface IPQSPhoneResult {
  phone_number: string;
  valid: boolean;
  active: boolean;
  carrier: string;
  line_type: string;
  country: string;
  region: string;
  city: string;
  zip_code?: string;
  risky: boolean;
  recent_abuse: boolean;
  fraud_score: number;
  leaked: boolean;
  spammer: boolean;
  voip: boolean;
  VOIP?: boolean; // Alternative field name from API
  prepaid?: boolean;
}

/**
 * Extract carrier data from IPQS result for merging
 */
export function extractIPQSCarrierData(result: IPQSPhoneResult, phone: string): CarrierData | null {
  if (!result.valid) return null;

  return {
    carrier: result.carrier || null,
    lineType: result.line_type || null,
    country: result.country || null,
    countryCode: null, // IPQS doesn't provide country code
    location: result.city && result.region 
      ? `${result.city}, ${result.region}` 
      : result.city || result.region || null,
    internationalFormat: result.phone_number || phone,
    localFormat: null,
    provider: 'ipqs_phone',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract risk data from IPQS result
 */
export interface IPQSRiskData {
  fraudScore: number;
  isVoip: boolean;
  isRisky: boolean;
  leaked: boolean;
  recentAbuse: boolean;
  spammer: boolean;
  active: boolean;
  prepaid: boolean;
}

export function extractIPQSRiskData(result: IPQSPhoneResult): IPQSRiskData {
  return {
    fraudScore: result.fraud_score || 0,
    isVoip: result.voip || result.VOIP || false,
    isRisky: result.risky || false,
    leaked: result.leaked || false,
    recentAbuse: result.recent_abuse || false,
    spammer: result.spammer || false,
    active: result.active || false,
    prepaid: result.prepaid || false,
  };
}

export function normalizeIPQS(result: IPQSPhoneResult, phone: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.leaked || result.recent_abuse || result.fraud_score > 75) {
    findings.push({
      id: generateFindingId("ipqs", "phone_intelligence", phone),
      type: "phone_intelligence" as const,
      title: `Phone Number Security Risk Detected`,
      description: `${phone} has been flagged for ${result.leaked ? "data leak" : result.recent_abuse ? "recent abuse" : "high fraud score"}.`,
      severity: result.fraud_score > 85 ? "high" : "medium",
      confidence: 0.75,
      provider: "IPQualityScore",
      providerCategory: "Phone Intelligence",
      evidence: [
        { key: "Phone Number", value: result.phone_number },
        { key: "Valid", value: result.valid },
        { key: "Active", value: result.active },
        { key: "Carrier", value: result.carrier },
        { key: "Line Type", value: result.line_type },
        { key: "Location", value: `${result.city || ""}, ${result.region || ""}, ${result.country}`.trim() },
        { key: "Fraud Score", value: `${result.fraud_score}/100` },
        { key: "Leaked in Database", value: result.leaked },
        { key: "Recent Abuse", value: result.recent_abuse },
        { key: "VoIP", value: result.voip || result.VOIP || false },
      ],
      impact: result.leaked
        ? "Phone number exposed in data breaches and may be targeted"
        : "Phone number associated with suspicious or fraudulent activity",
      remediation: [
        "Change your phone number if possible",
        "Enable carrier PIN/password protection",
        "Be alert for SIM-swapping attacks",
        "Enable spam call filtering",
        "Don't share phone number on public profiles",
        "Use alternate numbers for online registrations",
        "Monitor carrier account for unauthorized changes",
      ],
      tags: ["phone", "fraud", "leak", result.line_type?.toLowerCase() || "unknown"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  if (result.voip || result.VOIP) {
    findings.push({
      id: generateFindingId("ipqs", "phone_intelligence", `${phone}_voip`),
      type: "phone_intelligence" as const,
      title: `VoIP Phone Number Detected`,
      description: `${phone} is a VoIP number, which may have lower security protections.`,
      severity: "low",
      confidence: 0.8,
      provider: "IPQualityScore",
      providerCategory: "Phone Intelligence",
      evidence: [
        { key: "Phone Number", value: result.phone_number },
        { key: "Line Type", value: "VoIP" },
        { key: "Carrier", value: result.carrier },
      ],
      impact: "VoIP numbers are easier to spoof and may be used in phishing attempts",
      remediation: [
        "Consider using a carrier-provided number for sensitive accounts",
        "Enable additional verification methods beyond SMS",
        "Be cautious of SMS-based 2FA vulnerabilities",
      ],
      tags: ["phone", "voip", "security"],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }

  return findings;
}
