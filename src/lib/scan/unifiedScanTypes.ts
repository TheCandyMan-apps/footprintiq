/**
 * Unified Scan Types
 * 
 * Defines the scan contract for the unified scan interface.
 * These types are used by UnifiedScanForm and passed to ScanProgress/backend.
 */

export type ScanMode = "free_fast" | "standard" | "pro_deep";

export type EnhancerKey =
  | "deep_coverage"
  | "connections_graph"
  | "confidence_signals"
  | "breach_context"
  | "carrier_intel"
  | "risk_signals"
  | "expanded_sources"
  | "disambiguation";

export type DetectedType = "username" | "email" | "phone" | "name";

export interface UnifiedScanConfig {
  query: string;
  detectedType: DetectedType;
  scanMode: ScanMode;
  enhancers: EnhancerKey[];
  turnstile_token?: string;
}

export interface EnhancerConfig {
  key: EnhancerKey;
  label: string;
  description: string;
}

/**
 * Enhancer definitions organized by detected input type.
 * Pro users can enable these; Free users see them locked.
 */
export const ENHANCERS_BY_TYPE: Record<DetectedType, EnhancerConfig[]> = {
  username: [
    { 
      key: "deep_coverage", 
      label: "Deep profile sweep", 
      description: "Search 500+ platforms including social media, forums, gaming sites" 
    },
    { 
      key: "connections_graph", 
      label: "Connections graph", 
      description: "Visualize relationships between discovered profiles" 
    },
    { 
      key: "confidence_signals", 
      label: "Higher confidence signals", 
      description: "Advanced verification to reduce false positives" 
    },
  ],
  email: [
    { 
      key: "breach_context", 
      label: "Breach context & verification", 
      description: "Full breach history with password exposure details" 
    },
    { 
      key: "risk_signals", 
      label: "Reputation / risk signals", 
      description: "Email deliverability, fraud scoring, and spam detection" 
    },
  ],
  phone: [
    { 
      key: "carrier_intel", 
      label: "Carrier & line intelligence", 
      description: "Carrier lookup, line type, and geographic data" 
    },
    { 
      key: "risk_signals", 
      label: "Reputation / risk signals", 
      description: "Fraud scoring and spam detection" 
    },
  ],
  name: [
    { 
      key: "expanded_sources", 
      label: "Expanded sources", 
      description: "Search across people databases and public records" 
    },
    { 
      key: "disambiguation", 
      label: "Disambiguation signals", 
      description: "Cross-reference to reduce false matches" 
    },
  ],
};

/**
 * Derives the scan mode based on user tier and selected enhancers.
 * 
 * Rules:
 * - Free + username + no enhancers => free_fast
 * - Anything else Free => standard (enhancers forced empty)
 * - Pro + any enhancer selected => pro_deep
 * - Pro + none selected => standard
 */
export function deriveScanMode(
  isFree: boolean,
  detectedType: DetectedType,
  enhancers: EnhancerKey[]
): { scanMode: ScanMode; finalEnhancers: EnhancerKey[] } {
  if (isFree) {
    // Free users cannot use enhancers
    const scanMode: ScanMode = detectedType === "username" ? "free_fast" : "standard";
    return { scanMode, finalEnhancers: [] };
  }
  
  // Pro user
  const scanMode: ScanMode = enhancers.length > 0 ? "pro_deep" : "standard";
  return { scanMode, finalEnhancers: enhancers };
}
