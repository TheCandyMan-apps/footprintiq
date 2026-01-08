import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface NumverifyResult {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string | null;
}

/**
 * Normalize Numverify API response into standardized findings
 */
export function normalizeNumverify(result: NumverifyResult, phone: string): Finding[] {
  const findings: Finding[] = [];

  if (!result.valid) {
    return findings;
  }

  // Main carrier intelligence finding
  findings.push({
    id: generateFindingId("numverify", "carrier_intel", phone),
    type: "phone_intelligence" as const,
    title: `Carrier: ${result.carrier || 'Unknown'} (${result.line_type || 'unknown'})`,
    description: `Phone validated as ${result.line_type || 'unknown'} line in ${result.country_name || 'unknown country'}.`,
    severity: "info",
    confidence: 0.9, // Numverify has high accuracy for carrier data
    provider: "Numverify",
    providerCategory: "Carrier Intelligence",
    evidence: [
      { key: "Phone", value: phone },
      { key: "Valid", value: result.valid },
      { key: "Line Type", value: result.line_type || "unknown" },
      { key: "Carrier", value: result.carrier || "Unknown" },
      { key: "Country", value: result.country_name || "Unknown" },
      { key: "Country Code", value: result.country_code || "Unknown" },
      { key: "Country Prefix", value: result.country_prefix || "Unknown" },
      { key: "Location", value: result.location || "Unknown" },
      { key: "Local Format", value: result.local_format || phone },
      { key: "International Format", value: result.international_format || phone },
    ],
    impact: "Phone carrier and type identified for verification",
    remediation: [],
    tags: ["phone", "carrier", result.line_type?.toLowerCase() || "unknown", "numverify"],
    observedAt: new Date().toISOString(),
    raw: result,
  });

  return findings;
}

/**
 * Extract carrier data from Numverify result for merging
 */
export function extractNumverifyCarrierData(result: NumverifyResult): CarrierData | null {
  if (!result.valid) return null;

  return {
    carrier: result.carrier || null,
    lineType: result.line_type || null,
    country: result.country_name || null,
    countryCode: result.country_code || null,
    location: result.location || null,
    internationalFormat: result.international_format || null,
    localFormat: result.local_format || null,
    provider: 'numverify',
    confidence: 0.9,
    timestamp: new Date().toISOString(),
  };
}

// Shared carrier data type for merging
export interface CarrierData {
  carrier: string | null;
  lineType: string | null;
  country: string | null;
  countryCode: string | null;
  location: string | null;
  internationalFormat: string | null;
  localFormat: string | null;
  provider: string;
  confidence: number;
  timestamp: string;
}
