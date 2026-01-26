/**
 * Evidence Gating Utility
 * 
 * Ensures analysis sections only render when they have sufficient supporting evidence.
 * Prevents misleading displays of severity, risk, or warnings without justification.
 */

export interface EvidenceRequirements {
  /** Minimum number of supporting signals/findings */
  minEvidenceCount: number;
  /** Minimum confidence threshold (0-100) */
  minConfidence: number;
  /** Whether a human-readable justification is required */
  requiresJustification: boolean;
}

export interface EvidencePayload {
  /** Number of supporting signals */
  evidenceCount: number;
  /** Confidence score (0-100) */
  confidence?: number | null;
  /** Human-readable explanation */
  justification?: string | null;
}

/**
 * Severity thresholds - defines minimum requirements for each severity level
 */
export const SEVERITY_THRESHOLDS: Record<string, EvidenceRequirements> = {
  critical: { minEvidenceCount: 3, minConfidence: 80, requiresJustification: true },
  high: { minEvidenceCount: 2, minConfidence: 70, requiresJustification: true },
  medium: { minEvidenceCount: 1, minConfidence: 50, requiresJustification: false },
  low: { minEvidenceCount: 1, minConfidence: 0, requiresJustification: false },
};

/**
 * Default requirements for rendering any analysis section
 */
export const DEFAULT_REQUIREMENTS: EvidenceRequirements = {
  minEvidenceCount: 1,
  minConfidence: 0,
  requiresJustification: false,
};

/**
 * Check if an analysis section should be rendered based on evidence
 */
export function shouldRenderSection(payload: EvidencePayload, requirements: EvidenceRequirements = DEFAULT_REQUIREMENTS): boolean {
  // Must have at least the minimum evidence count
  if (payload.evidenceCount < requirements.minEvidenceCount) {
    return false;
  }

  // Check confidence if required
  if (requirements.minConfidence > 0) {
    const confidence = payload.confidence ?? 0;
    if (confidence < requirements.minConfidence) {
      return false;
    }
  }

  // Check justification if required
  if (requirements.requiresJustification) {
    if (!payload.justification || payload.justification.trim().length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a severity label can be displayed based on evidence
 */
export function canShowSeverity(
  severity: 'critical' | 'high' | 'medium' | 'low',
  payload: EvidencePayload
): boolean {
  const requirements = SEVERITY_THRESHOLDS[severity];
  if (!requirements) return false;
  return shouldRenderSection(payload, requirements);
}

/**
 * Get the maximum severity that can be shown given the evidence
 * Returns null if no severity should be displayed
 */
export function getMaxAllowedSeverity(payload: EvidencePayload): 'critical' | 'high' | 'medium' | 'low' | null {
  // Check from highest to lowest
  const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  
  for (const severity of severities) {
    if (canShowSeverity(severity, payload)) {
      return severity;
    }
  }
  
  return null;
}

/**
 * Clamp a severity to the maximum allowed based on evidence
 * Returns null if no severity should be shown
 */
export function clampSeverity(
  requestedSeverity: 'critical' | 'high' | 'medium' | 'low',
  payload: EvidencePayload
): 'critical' | 'high' | 'medium' | 'low' | null {
  const maxAllowed = getMaxAllowedSeverity(payload);
  
  if (!maxAllowed) return null;
  
  // Severity ranking
  const ranking: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  
  // Return the lower of the two
  if (ranking[requestedSeverity] <= ranking[maxAllowed]) {
    return requestedSeverity;
  }
  
  return maxAllowed;
}

/**
 * Check if Catfish Detection should render
 */
export function shouldRenderCatfishDetection(
  catfishRisk: string | null | undefined,
  dataPointsCount: number,
  analysisText?: string | null
): boolean {
  // Don't render if no risk assessment
  if (!catfishRisk || catfishRisk === 'N/A') {
    return false;
  }
  
  // Must have at least 1 data point
  if (dataPointsCount < 1) {
    return false;
  }
  
  // For HIGH/CRITICAL, require analysis text
  if ((catfishRisk === 'HIGH' || catfishRisk === 'CRITICAL') && (!analysisText || analysisText.trim().length === 0)) {
    return false;
  }
  
  return true;
}

/**
 * Check if Timeline section should render
 */
export function shouldRenderTimeline(eventsCount: number): boolean {
  return eventsCount > 0;
}

/**
 * Check if Connections/Relationship graph should render
 */
export function shouldRenderConnections(nodesCount: number): boolean {
  return nodesCount > 0;
}

/**
 * Check if Privacy Score should render
 */
export function shouldRenderPrivacyScore(
  score: number | null | undefined,
  findingsCount: number
): boolean {
  // Must have a valid score
  if (score === null || score === undefined) {
    return false;
  }
  
  // Must have at least 1 finding to justify the score
  if (findingsCount < 1) {
    return false;
  }
  
  return true;
}

/**
 * Check if Anomaly Detection section should render
 */
export function shouldRenderAnomalies(
  anomaliesCount: number,
  hasExplanation: boolean
): boolean {
  if (anomaliesCount < 1) {
    return false;
  }
  
  // For anomalies, always require some explanation
  return hasExplanation;
}

/**
 * Check if Risk/Severity badge should be shown
 */
export function shouldShowRiskBadge(payload: EvidencePayload): boolean {
  return shouldRenderSection(payload, { minEvidenceCount: 1, minConfidence: 0, requiresJustification: false });
}
