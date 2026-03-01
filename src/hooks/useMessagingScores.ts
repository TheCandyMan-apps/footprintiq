/**
 * useMessagingScores – Shared hook for combined Telegram + WhatsApp risk scoring.
 * Uses combineMessagingScores from messaging_score.ts as the single source of truth.
 */

import { useMemo } from "react";
import { useTelegramFindings } from "@/hooks/useTelegramFindings";
import { processWhatsAppSignals, type WhatsAppAdapterInput } from "@/lib/messaging/whatsapp_signal_adapter";
import { flags } from "@/lib/featureFlags";
import { combineMessagingScores, type CombinedMessagingScore, type PlatformScore } from "@/lib/messaging/messaging_score";
import type { MessagingScoreInput } from "@/components/scan/results-tabs/MessagingExposureSummary";

interface UseMessagingScoresOptions {
  scanId: string;
  phoneNumber?: string;
  isPhoneTarget: boolean;
}

export function useMessagingScores({ scanId, phoneNumber, isPhoneTarget }: UseMessagingScoresOptions) {
  const { findings: telegramFindings, loading: telegramLoading } = useTelegramFindings(scanId);
  const showWhatsApp = isPhoneTarget && flags.whatsappBasic;

  const telegramScore = useMemo<MessagingScoreInput | null>(() => {
    if (!telegramFindings.length) return null;
    let maxRisk = 0;
    let totalSignals = 0;
    const confidences: number[] = [];
    for (const f of telegramFindings) {
      totalSignals++;
      const risk = Number(f.meta?.risk_score ?? f.meta?.risk ?? 0);
      if (risk > maxRisk) maxRisk = risk;
      const conf = Number(f.meta?.confidence ?? 0.5);
      confidences.push(conf);
    }
    const avgConf = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
    return { label: "Telegram", riskScore: maxRisk, confidence: avgConf, signalCount: totalSignals };
  }, [telegramFindings]);

  const whatsAppScore = useMemo<MessagingScoreInput | null>(() => {
    if (!showWhatsApp || !phoneNumber) return null;
    const input: WhatsAppAdapterInput = { phoneNumber };
    const bundle = processWhatsAppSignals(input);
    if (!bundle.signals.length && bundle.riskContribution === 0) return null;
    return {
      label: "WhatsApp",
      riskScore: bundle.riskContribution,
      confidence: bundle.overallConfidence,
      signalCount: bundle.signals.length,
    };
  }, [showWhatsApp, phoneNumber]);

  // Legacy scores array (for MessagingExposureSummary component)
  const scores = useMemo<MessagingScoreInput[]>(() => {
    return [telegramScore, whatsAppScore].filter(Boolean) as MessagingScoreInput[];
  }, [telegramScore, whatsAppScore]);

  // Build PlatformScore inputs for the shared utility
  const telegramPlatform = useMemo<PlatformScore | undefined>(() => {
    if (!telegramScore) return undefined;
    return { score: telegramScore.riskScore, confidence: telegramScore.confidence, signals: telegramScore.signalCount };
  }, [telegramScore]);

  const whatsAppPlatform = useMemo<PlatformScore | undefined>(() => {
    if (!whatsAppScore) return undefined;
    return { score: whatsAppScore.riskScore, confidence: whatsAppScore.confidence, signals: whatsAppScore.signalCount };
  }, [whatsAppScore]);

  // Combined score via the shared utility
  const combined = useMemo<CombinedMessagingScore>(() => {
    return combineMessagingScores({ telegram: telegramPlatform, whatsapp: whatsAppPlatform });
  }, [telegramPlatform, whatsAppPlatform]);

  return {
    scores,
    combined: combined.platforms > 0 ? {
      risk: combined.score,
      confidence: Math.round(combined.confidence * 100),
      signalCount: combined.signals,
      platformCount: combined.platforms,
      sources: [telegramScore && "Telegram", whatsAppScore && "WhatsApp"].filter(Boolean) as string[],
      level: combined.level,
    } : null,
    loading: telegramLoading,
    hasData: scores.length > 0,
    showWhatsApp,
  };
}
