/**
 * messaging_score.ts – Shared scoring utility for Messaging Intelligence.
 *
 * Single source of truth for combining Telegram + WhatsApp risk scores.
 * Used by useMessagingScores hook, SummaryTab, MessagingExposureSummary, and Timeline.
 */

export type RiskLevel = 'minimal' | 'moderate' | 'elevated';

/** Map a 0-100 score to a named risk level. */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 60) return 'elevated';
  if (score >= 30) return 'moderate';
  return 'minimal';
}

export interface PlatformScore {
  score: number;       // 0–100
  confidence: number;  // 0–1
  signals: number;
}

export interface CombinedMessagingScore {
  score: number;       // 0–100
  confidence: number;  // 0–1
  signals: number;
  platforms: number;
  level: RiskLevel;
}

/**
 * Combine Telegram and/or WhatsApp scores into a single summary.
 *
 * Weighting: scores are weighted by signal count (signals as weights).
 * If only one platform exists, its values pass through.
 * Score is clamped to 0–100.
 * Confidence is a signal-weighted average.
 */
export function combineMessagingScores(input: {
  telegram?: PlatformScore;
  whatsapp?: PlatformScore;
}): CombinedMessagingScore {
  const entries: PlatformScore[] = [];
  if (input.telegram && (input.telegram.signals > 0 || input.telegram.score > 0)) {
    entries.push(input.telegram);
  }
  if (input.whatsapp && (input.whatsapp.signals > 0 || input.whatsapp.score > 0)) {
    entries.push(input.whatsapp);
  }

  if (entries.length === 0) {
    return { score: 0, confidence: 0, signals: 0, platforms: 0, level: 'minimal' };
  }

  const totalSignals = entries.reduce((sum, e) => sum + e.signals, 0);

  // Weighted average by signal count (minimum weight of 1 to avoid /0)
  const totalWeight = entries.reduce((sum, e) => sum + Math.max(e.signals, 1), 0);
  const weightedScore = entries.reduce(
    (sum, e) => sum + e.score * Math.max(e.signals, 1),
    0,
  ) / totalWeight;
  const weightedConfidence = entries.reduce(
    (sum, e) => sum + e.confidence * Math.max(e.signals, 1),
    0,
  ) / totalWeight;

  const score = Math.round(Math.min(100, Math.max(0, weightedScore)));

  return {
    score,
    confidence: Math.round(weightedConfidence * 100) / 100,
    signals: totalSignals,
    platforms: entries.length,
    level: getRiskLevel(score),
  };
}
