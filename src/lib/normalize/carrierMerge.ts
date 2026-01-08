import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";
import type { CarrierData } from "./numverify";

/**
 * Provider priority for conflict resolution
 * Higher priority = more trusted for that data type
 */
const PROVIDER_PRIORITY: Record<string, Record<string, number>> = {
  carrier: {
    numverify: 95,      // Carrier lookup specialists
    twilio_lookup: 90,  // Carrier-focused API
    ipqs_phone: 80,     // Good but secondary focus
    abstract_phone: 75, // General phone intel
  },
  lineType: {
    numverify: 90,
    twilio_lookup: 95,  // Excellent line type detection
    ipqs_phone: 85,
    abstract_phone: 80,
  },
  location: {
    numverify: 95,      // Very accurate location data
    ipqs_phone: 85,
    abstract_phone: 80,
    twilio_lookup: 75,
  },
  risk: {
    ipqs_phone: 95,     // Risk intelligence specialists
    numverify: 50,      // No risk data
    abstract_phone: 60,
    twilio_lookup: 55,
  },
};

/**
 * Conflict resolution rules for carrier data
 */
interface ConflictResolution {
  field: string;
  values: { value: string | null; provider: string; confidence: number }[];
  resolvedValue: string | null;
  resolvedProvider: string;
  resolutionMethod: 'priority' | 'consensus' | 'highest_confidence' | 'most_specific';
  conflictDetected: boolean;
}

/**
 * Calculate merged confidence score based on provider agreement
 */
export function calculateMergedConfidence(
  sources: CarrierData[],
  field: keyof CarrierData
): number {
  if (sources.length === 0) return 0;
  if (sources.length === 1) return sources[0].confidence;

  // Get non-null values for this field
  const values = sources
    .filter(s => s[field] != null)
    .map(s => ({
      value: String(s[field]).toLowerCase().trim(),
      confidence: s.confidence,
      provider: s.provider,
    }));

  if (values.length === 0) return 0;

  // Group by value
  const grouped = new Map<string, typeof values>();
  for (const v of values) {
    const group = grouped.get(v.value) || [];
    group.push(v);
    grouped.set(v.value, group);
  }

  // Find consensus
  const largestGroup = [...grouped.values()].sort((a, b) => b.length - a.length)[0];
  const agreementRatio = largestGroup.length / values.length;

  // Base confidence from average of agreeing sources
  const avgConfidence = largestGroup.reduce((sum, v) => sum + v.confidence, 0) / largestGroup.length;

  // Boost for multi-source agreement
  const agreementBoost = agreementRatio === 1 
    ? 0.1  // Full agreement
    : agreementRatio >= 0.67 
      ? 0.05  // Majority agreement
      : -0.1; // Significant disagreement

  return Math.min(1, Math.max(0, avgConfidence + agreementBoost));
}

/**
 * Resolve conflict for a specific field using priority and consensus rules
 */
export function resolveFieldConflict(
  sources: CarrierData[],
  field: keyof CarrierData
): ConflictResolution {
  const fieldKey = field as string;
  const priorities = PROVIDER_PRIORITY[fieldKey] || PROVIDER_PRIORITY.carrier;

  const values = sources
    .filter(s => s[field] != null && s[field] !== '' && s[field] !== 'Unknown')
    .map(s => ({
      value: s[field] as string | null,
      provider: s.provider,
      confidence: s.confidence,
      priority: priorities[s.provider] || 50,
    }));

  if (values.length === 0) {
    return {
      field: fieldKey,
      values: [],
      resolvedValue: null,
      resolvedProvider: 'none',
      resolutionMethod: 'priority',
      conflictDetected: false,
    };
  }

  // Check for consensus
  const normalizedValues = values.map(v => ({
    ...v,
    normalizedValue: v.value?.toLowerCase().trim(),
  }));

  const uniqueValues = new Set(normalizedValues.map(v => v.normalizedValue));
  const hasConflict = uniqueValues.size > 1;

  let resolvedValue: string | null;
  let resolvedProvider: string;
  let resolutionMethod: ConflictResolution['resolutionMethod'];

  if (!hasConflict) {
    // All sources agree
    const highestConfidence = values.sort((a, b) => b.confidence - a.confidence)[0];
    resolvedValue = highestConfidence.value;
    resolvedProvider = highestConfidence.provider;
    resolutionMethod = 'consensus';
  } else {
    // Conflict exists - use priority-based resolution
    const sorted = values.sort((a, b) => {
      // First by priority
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Then by confidence
      return b.confidence - a.confidence;
    });

    resolvedValue = sorted[0].value;
    resolvedProvider = sorted[0].provider;
    resolutionMethod = 'priority';
  }

  return {
    field: fieldKey,
    values: values.map(v => ({ value: v.value, provider: v.provider, confidence: v.confidence })),
    resolvedValue,
    resolvedProvider,
    resolutionMethod,
    conflictDetected: hasConflict,
  };
}

/**
 * Merge multiple carrier data sources into a single unified result
 */
export interface MergedCarrierResult {
  carrier: string | null;
  lineType: string | null;
  country: string | null;
  countryCode: string | null;
  location: string | null;
  internationalFormat: string | null;
  localFormat: string | null;
  
  // Merge metadata
  sources: string[];
  sourceCount: number;
  overallConfidence: number;
  conflictResolutions: ConflictResolution[];
  hasConflicts: boolean;
  
  // Risk data (from IPQS primarily)
  riskScore: number | null;
  isVoip: boolean;
  isRisky: boolean;
  leaked: boolean;
  recentAbuse: boolean;
  spammer: boolean;
}

/**
 * Merge carrier data from multiple providers with conflict resolution
 */
export function mergeCarrierData(sources: CarrierData[]): MergedCarrierResult {
  if (sources.length === 0) {
    return {
      carrier: null,
      lineType: null,
      country: null,
      countryCode: null,
      location: null,
      internationalFormat: null,
      localFormat: null,
      sources: [],
      sourceCount: 0,
      overallConfidence: 0,
      conflictResolutions: [],
      hasConflicts: false,
      riskScore: null,
      isVoip: false,
      isRisky: false,
      leaked: false,
      recentAbuse: false,
      spammer: false,
    };
  }

  // Resolve each field independently
  const carrierResolution = resolveFieldConflict(sources, 'carrier');
  const lineTypeResolution = resolveFieldConflict(sources, 'lineType');
  const countryResolution = resolveFieldConflict(sources, 'country');
  const countryCodeResolution = resolveFieldConflict(sources, 'countryCode');
  const locationResolution = resolveFieldConflict(sources, 'location');
  const intlFormatResolution = resolveFieldConflict(sources, 'internationalFormat');
  const localFormatResolution = resolveFieldConflict(sources, 'localFormat');

  const resolutions = [
    carrierResolution,
    lineTypeResolution,
    countryResolution,
    countryCodeResolution,
    locationResolution,
    intlFormatResolution,
    localFormatResolution,
  ];

  // Calculate overall confidence
  const fieldConfidences = [
    calculateMergedConfidence(sources, 'carrier'),
    calculateMergedConfidence(sources, 'lineType'),
    calculateMergedConfidence(sources, 'country'),
  ];
  const overallConfidence = fieldConfidences.reduce((a, b) => a + b, 0) / fieldConfidences.length;

  return {
    carrier: carrierResolution.resolvedValue,
    lineType: lineTypeResolution.resolvedValue,
    country: countryResolution.resolvedValue,
    countryCode: countryCodeResolution.resolvedValue,
    location: locationResolution.resolvedValue,
    internationalFormat: intlFormatResolution.resolvedValue,
    localFormat: localFormatResolution.resolvedValue,
    sources: [...new Set(sources.map(s => s.provider))],
    sourceCount: sources.length,
    overallConfidence,
    conflictResolutions: resolutions.filter(r => r.conflictDetected),
    hasConflicts: resolutions.some(r => r.conflictDetected),
    riskScore: null, // Set separately from IPQS
    isVoip: false,
    isRisky: false,
    leaked: false,
    recentAbuse: false,
    spammer: false,
  };
}

/**
 * Create a unified carrier finding from merged data
 */
export function createMergedCarrierFinding(
  phone: string,
  merged: MergedCarrierResult
): Finding {
  const conflictNote = merged.hasConflicts
    ? ` (${merged.conflictResolutions.length} conflict(s) resolved)`
    : '';

  const evidenceItems: Array<{ key: string; value: string | boolean | number }> = [
    { key: "Phone", value: phone },
    { key: "Carrier", value: merged.carrier || "Unknown" },
    { key: "Line Type", value: merged.lineType || "unknown" },
    { key: "Country", value: merged.country || "Unknown" },
    { key: "Country Code", value: merged.countryCode || "Unknown" },
    { key: "Location", value: merged.location || "Unknown" },
    { key: "Sources", value: merged.sources.join(", ") },
    { key: "Source Count", value: merged.sourceCount },
    { key: "Confidence", value: `${Math.round(merged.overallConfidence * 100)}%` },
    { key: "Conflicts Resolved", value: merged.conflictResolutions.length },
  ];

  // Add format info if available
  if (merged.internationalFormat) {
    evidenceItems.push({ key: "International Format", value: merged.internationalFormat });
  }

  // Add conflict details
  for (const resolution of merged.conflictResolutions) {
    evidenceItems.push({
      key: `${resolution.field} Conflict`,
      value: `Resolved using ${resolution.resolutionMethod}: ${resolution.resolvedValue} (from ${resolution.resolvedProvider})`,
    });
  }

  return {
    id: generateFindingId("carrier_merged", "unified_intel", phone),
    type: "phone_intelligence" as const,
    title: `Carrier: ${merged.carrier || 'Unknown'} (${merged.lineType || 'unknown'})`,
    description: `Phone validated as ${merged.lineType || 'unknown'} line in ${merged.country || 'unknown country'}. Corroborated by ${merged.sourceCount} provider(s)${conflictNote}.`,
    severity: merged.isVoip ? "low" : "info",
    confidence: merged.overallConfidence,
    provider: "Merged Intelligence",
    providerCategory: "Carrier Intelligence",
    evidence: evidenceItems,
    impact: merged.sourceCount > 1 
      ? "High-confidence carrier data from multiple corroborating sources"
      : "Phone carrier and type identified for verification",
    remediation: [],
    tags: [
      "phone", 
      "carrier", 
      merged.lineType?.toLowerCase() || "unknown",
      "merged",
      ...merged.sources,
    ],
    observedAt: new Date().toISOString(),
    raw: {
      merged,
      conflictResolutions: merged.conflictResolutions,
    },
  };
}

/**
 * Create risk findings from merged data (primarily IPQS)
 */
export function createMergedRiskFindings(
  phone: string,
  merged: MergedCarrierResult & {
    riskScore: number | null;
    fraudScore?: number;
    isVoip: boolean;
    isRisky: boolean;
    leaked: boolean;
    recentAbuse: boolean;
    spammer: boolean;
  }
): Finding[] {
  const findings: Finding[] = [];

  // High-risk finding
  if (merged.riskScore !== null && (merged.riskScore > 50 || merged.leaked || merged.recentAbuse || merged.spammer)) {
    const riskFactors: string[] = [];
    if (merged.spammer) riskFactors.push("Known Spammer");
    if (merged.recentAbuse) riskFactors.push("Recent Abuse");
    if (merged.leaked) riskFactors.push("Found in Data Leak");
    if (merged.isRisky) riskFactors.push("High Risk");

    const severity = merged.riskScore > 75 ? "high" : merged.riskScore > 50 ? "medium" : "low";

    findings.push({
      id: generateFindingId("risk_merged", "risk_signal", phone),
      type: "phone_intelligence" as const,
      title: riskFactors.length > 0
        ? `Risk: ${riskFactors.slice(0, 2).join(", ")}`
        : `Fraud Score: ${merged.riskScore}`,
      description: `Phone has fraud score of ${merged.riskScore}/100. ${riskFactors.length > 0 ? `Risk factors: ${riskFactors.join(", ")}.` : ""}`,
      severity,
      confidence: 0.85,
      provider: "Merged Intelligence",
      providerCategory: "Risk Intelligence",
      evidence: [
        { key: "Phone", value: phone },
        { key: "Fraud Score", value: `${merged.riskScore}/100` },
        { key: "Is Spammer", value: merged.spammer },
        { key: "Recent Abuse", value: merged.recentAbuse },
        { key: "Leaked", value: merged.leaked },
        { key: "Risk Factors", value: riskFactors.length },
      ],
      impact: severity === "high"
        ? "High-risk phone number - proceed with caution"
        : "Phone has some risk indicators",
      remediation: severity !== "low" ? [
        "Verify identity through additional channels",
        "Enable additional security measures",
        "Be cautious of SIM-swapping attacks",
      ] : [],
      tags: ["phone", "risk", ...riskFactors.map(r => r.toLowerCase().replace(/\s+/g, "-"))],
      observedAt: new Date().toISOString(),
    });
  }

  // VoIP detection
  if (merged.isVoip) {
    findings.push({
      id: generateFindingId("voip_merged", "voip_detection", phone),
      type: "phone_intelligence" as const,
      title: "VoIP Number Detected",
      description: `Phone number is a VoIP line, which may have lower security protections.`,
      severity: "low",
      confidence: 0.9,
      provider: "Merged Intelligence",
      providerCategory: "Carrier Intelligence",
      evidence: [
        { key: "Phone", value: phone },
        { key: "Is VoIP", value: true },
        { key: "Carrier", value: merged.carrier || "Unknown" },
        { key: "Sources", value: merged.sources.join(", ") },
      ],
      impact: "VoIP numbers are easier to spoof and may be used in phishing",
      remediation: [
        "Consider additional verification methods",
        "Be cautious of SMS-based 2FA vulnerabilities",
      ],
      tags: ["phone", "voip", "security"],
      observedAt: new Date().toISOString(),
    });
  }

  return findings;
}
