import { Finding, Severity } from "../ufm";

/**
 * Predictive Risk Index (PRI)
 * 
 * Calculates a 0-100 risk score weighted by:
 * - Breach exposure (40%)
 * - Open ports/vulnerabilities (25%)
 * - Username reuse (15%)
 * - Platform exposure diversity (10%)
 * - NSFW/suspicious adjacency (10%)
 */

export interface RiskContribution {
  category: string;
  score: number;
  weight: number;
  findings: number;
}

export interface PredictiveRiskIndex {
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  contributions: RiskContribution[];
  recommendation: string;
}

const severityScores: Record<Severity, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
  info: 10,
};

/**
 * Calculate Predictive Risk Index from findings
 */
export function calculatePRI(findings: Finding[]): PredictiveRiskIndex {
  const contributions: RiskContribution[] = [
    calculateBreachRisk(findings),
    calculateVulnerabilityRisk(findings),
    calculateUsernameReuseRisk(findings),
    calculateExposureDiversityRisk(findings),
    calculateAdjacencyRisk(findings),
  ];

  // Weighted sum
  const score = contributions.reduce((sum, c) => sum + c.score * c.weight, 0);
  const normalizedScore = Math.min(100, Math.round(score));

  const level = getRiskLevel(normalizedScore);
  const recommendation = getRecommendation(normalizedScore, contributions);

  return {
    score: normalizedScore,
    level,
    contributions,
    recommendation,
  };
}

/**
 * Breach exposure risk (40% weight)
 */
function calculateBreachRisk(findings: Finding[]): RiskContribution {
  const breaches = findings.filter((f) => f.type === "breach");
  
  if (breaches.length === 0) {
    return { category: "Data Breaches", score: 0, weight: 0.4, findings: 0 };
  }

  // Weighted by severity and recency
  let breachScore = 0;
  breaches.forEach((breach) => {
    const severityScore = severityScores[breach.severity];
    const ageInDays = (Date.now() - new Date(breach.observedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyMultiplier = ageInDays < 90 ? 1.5 : ageInDays < 365 ? 1.2 : 1.0;
    breachScore += severityScore * recencyMultiplier;
  });

  const normalizedScore = Math.min(100, breachScore / breaches.length);

  return {
    category: "Data Breaches",
    score: normalizedScore,
    weight: 0.4,
    findings: breaches.length,
  };
}

/**
 * Vulnerability/open ports risk (25% weight)
 */
function calculateVulnerabilityRisk(findings: Finding[]): RiskContribution {
  const vulns = findings.filter(
    (f) => f.type === "ip_exposure" || f.type === "domain_reputation"
  );

  if (vulns.length === 0) {
    return { category: "Vulnerabilities", score: 0, weight: 0.25, findings: 0 };
  }

  const avgSeverity =
    vulns.reduce((sum, v) => sum + severityScores[v.severity], 0) / vulns.length;

  return {
    category: "Vulnerabilities",
    score: avgSeverity,
    weight: 0.25,
    findings: vulns.length,
  };
}

/**
 * Username reuse risk (15% weight)
 */
function calculateUsernameReuseRisk(findings: Finding[]): RiskContribution {
  const usernames = new Map<string, number>();

  findings.forEach((f) => {
    f.evidence.forEach((e) => {
      if (e.key === "username" && typeof e.value === "string") {
        const username = e.value.toLowerCase();
        usernames.set(username, (usernames.get(username) || 0) + 1);
      }
    });
  });

  const reusedUsernames = Array.from(usernames.values()).filter((count) => count > 1);
  const reuseScore = reusedUsernames.length > 0
    ? Math.min(100, (reusedUsernames.reduce((sum, count) => sum + count, 0) / usernames.size) * 100)
    : 0;

  return {
    category: "Username Reuse",
    score: reuseScore,
    weight: 0.15,
    findings: reusedUsernames.length,
  };
}

/**
 * Platform exposure diversity risk (10% weight)
 */
function calculateExposureDiversityRisk(findings: Finding[]): RiskContribution {
  const platforms = new Set(findings.map((f) => f.provider));
  const diversityScore = Math.min(100, platforms.size * 10); // More platforms = higher risk

  return {
    category: "Platform Exposure",
    score: diversityScore,
    weight: 0.1,
    findings: platforms.size,
  };
}

/**
 * NSFW/suspicious adjacency risk (10% weight)
 */
function calculateAdjacencyRisk(findings: Finding[]): RiskContribution {
  const suspiciousKeywords = ["nsfw", "adult", "xxx", "leaked", "hack", "dump"];
  
  let adjacencyScore = 0;
  findings.forEach((f) => {
    const titleLower = f.title.toLowerCase();
    const descLower = f.description.toLowerCase();
    const hasSuspicious = suspiciousKeywords.some(
      (kw) => titleLower.includes(kw) || descLower.includes(kw)
    );
    if (hasSuspicious) adjacencyScore += 20;
  });

  return {
    category: "Suspicious Adjacency",
    score: Math.min(100, adjacencyScore),
    weight: 0.1,
    findings: Math.floor(adjacencyScore / 20),
  };
}

/**
 * Get risk level label
 */
function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Generate contextual recommendation
 */
function getRecommendation(score: number, contributions: RiskContribution[]): string {
  if (score < 40) {
    return "Your digital footprint is relatively secure. Continue monitoring for changes.";
  }

  const topRisks = contributions
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 2);

  if (topRisks.length === 0) {
    return "No significant risks detected.";
  }

  const recommendations = topRisks.map((risk) => {
    switch (risk.category) {
      case "Data Breaches":
        return "Change passwords on breached accounts immediately";
      case "Vulnerabilities":
        return "Review and secure exposed services/domains";
      case "Username Reuse":
        return "Use unique usernames across platforms";
      case "Platform Exposure":
        return "Consider removing unused accounts";
      case "Suspicious Adjacency":
        return "Review content associations and remove sensitive data";
      default:
        return "Review findings and take corrective action";
    }
  });

  return recommendations.join(". ") + ".";
}
