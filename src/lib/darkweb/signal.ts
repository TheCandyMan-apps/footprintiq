/**
 * Dark-Web Signal Score Calculator
 * Computes risk score from IntelX, DeHashed, DarkSearch metadata
 * Policy-gated and PII-free
 */

import { Finding } from "@/lib/ufm";
import { providerConfig } from "@/lib/config";

export interface DarkWebSignal {
  score: number; // 0-100
  trend: "increasing" | "stable" | "decreasing";
  explanation: string[];
  sources: {
    provider: string;
    weight: number;
    count: number;
    lastSeen: string;
  }[];
}

const PROVIDER_WEIGHTS = {
  dehashed: 0.9, // Enterprise-grade breach data
  intelx: 0.8,   // Paste/leak intelligence
  darksearch: 0.6, // Dark web indexing
} as const;

const RECENCY_DECAY_DAYS = 90;

/**
 * Calculate dark-web signal score for an entity
 */
export function calculateDarkWebSignal(findings: Finding[]): DarkWebSignal {
  // Filter for dark-web providers
  const darkwebProviders = ["DeHashed", "IntelX", "DarkSearch"];
  const darkwebFindings = findings.filter(f => 
    darkwebProviders.includes(f.provider)
  );

  if (darkwebFindings.length === 0) {
    return {
      score: 0,
      trend: "stable",
      explanation: ["No dark-web exposure detected"],
      sources: [],
    };
  }

  // Group by provider
  const byProvider = new Map<string, Finding[]>();
  darkwebFindings.forEach(f => {
    const key = f.provider.toLowerCase();
    if (!byProvider.has(key)) byProvider.set(key, []);
    byProvider.get(key)!.push(f);
  });

  let totalScore = 0;
  const sources: DarkWebSignal["sources"] = [];
  const explanation: string[] = [];

  // Calculate score per provider
  byProvider.forEach((providerFindings, providerKey) => {
    const weight = PROVIDER_WEIGHTS[providerKey as keyof typeof PROVIDER_WEIGHTS] || 0.5;
    const count = providerFindings.length;
    
    // Recency factor
    const mostRecent = providerFindings.reduce((latest, f) => {
      const fDate = new Date(f.observedAt);
      return fDate > latest ? fDate : latest;
    }, new Date(0));

    const daysSince = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.3, 1 - (daysSince / RECENCY_DECAY_DAYS));

    // Severity factor
    const severityWeights = { critical: 1.0, high: 0.8, medium: 0.5, low: 0.3, info: 0.1 };
    const avgSeverity = providerFindings.reduce((sum, f) => 
      sum + (severityWeights[f.severity] || 0), 0
    ) / count;

    // Provider score
    const providerScore = weight * count * recencyFactor * avgSeverity * 20; // Scale to 0-100
    totalScore += providerScore;

    sources.push({
      provider: providerKey,
      weight,
      count,
      lastSeen: mostRecent.toISOString(),
    });

    explanation.push(
      `${count} finding${count > 1 ? 's' : ''} from ${providerKey} (${Math.round(recencyFactor * 100)}% recent)`
    );
  });

  // Cap at 100
  const finalScore = Math.min(100, Math.round(totalScore));

  // Determine trend (simplified - would need historical data)
  const trend = finalScore > 70 ? "increasing" : finalScore < 30 ? "decreasing" : "stable";

  if (sources.length > 1) {
    explanation.unshift(`${sources.length} distinct dark-web sources detected`);
  }

  return {
    score: finalScore,
    trend,
    explanation,
    sources,
  };
}

/**
 * Check if dark-web sources are allowed by policy
 */
export function isDarkWebAllowed(): boolean {
  return providerConfig.allowDarkwebSources;
}

/**
 * Get gated message when dark-web is disabled
 */
export function getDarkWebGatedMessage(): string {
  return "Dark-web intelligence is policy-gated. Enable in Admin → Policies to access DeHashed, IntelX, and DarkSearch findings.";
}

/**
 * Explain score in user-friendly terms
 */
export function explainScore(score: number): {
  level: "low" | "medium" | "high" | "critical";
  message: string;
} {
  if (score >= 80) {
    return {
      level: "critical",
      message: "Significant dark-web exposure detected across multiple sources",
    };
  } else if (score >= 60) {
    return {
      level: "high",
      message: "Notable dark-web presence with recent activity",
    };
  } else if (score >= 30) {
    return {
      level: "medium",
      message: "Moderate dark-web exposure detected",
    };
  } else {
    return {
      level: "low",
      message: "Minimal dark-web footprint",
    };
  }
}
