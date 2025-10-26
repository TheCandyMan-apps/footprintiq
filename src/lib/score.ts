import type { Finding } from "./ufm";

/**
 * Risk & Confidence Scoring Engine
 * Computes risk and confidence scores based on provider data, severity, and finding patterns
 */

export interface ScoreWeights {
  severityCritical: number;
  severityHigh: number;
  severityMedium: number;
  severityLow: number;
  severityInfo: number;
  providerBonus: number;
  confidenceWeight: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  severityCritical: 25,
  severityHigh: 15,
  severityMedium: 10,
  severityLow: 5,
  severityInfo: 2,
  providerBonus: 2, // Bonus per unique provider
  confidenceWeight: 0.8, // Multiplier for finding confidence
};

export interface EntityScore {
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  providerCount: number;
  findingCount: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  topProviders: string[];
  riskLevel: "critical" | "high" | "medium" | "low" | "minimal";
  confidenceLevel: "very_high" | "high" | "medium" | "low";
}

/**
 * Calculate risk score based on findings
 */
export function calculateRiskScore(
  findings: Finding[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  if (findings.length === 0) return 0;

  let totalScore = 0;

  // Count severities and calculate base score
  for (const finding of findings) {
    let severityScore = 0;
    switch (finding.severity) {
      case "critical":
        severityScore = weights.severityCritical;
        break;
      case "high":
        severityScore = weights.severityHigh;
        break;
      case "medium":
        severityScore = weights.severityMedium;
        break;
      case "low":
        severityScore = weights.severityLow;
        break;
      case "info":
        severityScore = weights.severityInfo;
        break;
    }

    // Apply confidence weight
    totalScore += severityScore * (finding.confidence * weights.confidenceWeight);
  }

  // Add bonus for multiple providers (corroboration)
  const uniqueProviders = new Set(findings.map((f) => f.provider)).size;
  totalScore += uniqueProviders * weights.providerBonus;

  // Normalize to 0-100 scale with logarithmic scaling for high values
  let normalizedScore = Math.min(100, totalScore);
  if (normalizedScore > 80) {
    normalizedScore = 80 + (normalizedScore - 80) * 0.5; // Compress high scores
  }

  return Math.round(normalizedScore * 100) / 100;
}

/**
 * Calculate confidence score based on provider agreement and data quality
 */
export function calculateConfidenceScore(findings: Finding[]): number {
  if (findings.length === 0) return 0;

  // Count unique providers
  const uniqueProviders = new Set(findings.map((f) => f.provider)).size;

  // Average confidence from findings
  const avgConfidence =
    findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;

  // Provider diversity bonus (more providers = higher confidence)
  const providerBonus = Math.min(uniqueProviders * 0.15, 0.5);

  // Calculate final confidence score
  const confidenceScore = (avgConfidence * 0.7 + providerBonus) * 100;

  return Math.round(Math.min(100, confidenceScore) * 100) / 100;
}

/**
 * Get severity breakdown from findings
 */
export function getSeverityBreakdown(findings: Finding[]): EntityScore["severityBreakdown"] {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  );
}

/**
 * Get top providers by finding count
 */
export function getTopProviders(findings: Finding[], limit: number = 5): string[] {
  const providerCounts = findings.reduce((acc, finding) => {
    acc[finding.provider] = (acc[finding.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(providerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([provider]) => provider);
}

/**
 * Determine risk level from risk score
 */
export function getRiskLevel(riskScore: number): EntityScore["riskLevel"] {
  if (riskScore >= 80) return "critical";
  if (riskScore >= 60) return "high";
  if (riskScore >= 40) return "medium";
  if (riskScore >= 20) return "low";
  return "minimal";
}

/**
 * Determine confidence level from confidence score
 */
export function getConfidenceLevel(confidenceScore: number): EntityScore["confidenceLevel"] {
  if (confidenceScore >= 85) return "very_high";
  if (confidenceScore >= 70) return "high";
  if (confidenceScore >= 50) return "medium";
  return "low";
}

/**
 * Calculate comprehensive entity score
 */
export function calculateEntityScore(
  findings: Finding[],
  weights?: ScoreWeights
): EntityScore {
  const riskScore = calculateRiskScore(findings, weights);
  const confidenceScore = calculateConfidenceScore(findings);
  const severityBreakdown = getSeverityBreakdown(findings);
  const topProviders = getTopProviders(findings);
  const providerCount = new Set(findings.map((f) => f.provider)).size;

  return {
    riskScore,
    confidenceScore,
    providerCount,
    findingCount: findings.length,
    severityBreakdown,
    topProviders,
    riskLevel: getRiskLevel(riskScore),
    confidenceLevel: getConfidenceLevel(confidenceScore),
  };
}

/**
 * Calculate edge confidence based on evidence strength
 */
export function calculateEdgeConfidence(
  providers: string[],
  evidenceCount: number
): number {
  const providerWeight = Math.min(providers.length * 15, 60);
  const evidenceWeight = Math.min(evidenceCount * 10, 40);
  return Math.min(100, providerWeight + evidenceWeight);
}
