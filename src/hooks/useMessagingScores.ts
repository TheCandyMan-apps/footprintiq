/**
 * useMessagingScores – Shared hook for combined Telegram + WhatsApp risk scoring.
 * Used by MessagingTab (summary bar) and SummaryTab (compact card).
 */

import { useMemo } from "react";
import { useTelegramFindings } from "@/hooks/useTelegramFindings";
import { processWhatsAppSignals, type WhatsAppAdapterInput } from "@/lib/messaging/whatsapp_signal_adapter";
import { flags } from "@/lib/featureFlags";
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

  const scores = useMemo<MessagingScoreInput[]>(() => {
    return [telegramScore, whatsAppScore].filter(Boolean) as MessagingScoreInput[];
  }, [telegramScore, whatsAppScore]);

  // Combined summary values
  const combined = useMemo(() => {
    const active = scores.filter((s) => s.signalCount > 0 || s.riskScore > 0);
    if (active.length === 0) return null;
    const totalWeight = active.reduce((sum, s) => sum + (s.weight ?? 1), 0);
    const weightedRisk = active.reduce((sum, s) => sum + s.riskScore * (s.weight ?? 1), 0) / totalWeight;
    const avgConfidence = active.reduce((sum, s) => sum + s.confidence, 0) / active.length;
    const totalSignals = active.reduce((sum, s) => sum + s.signalCount, 0);
    return {
      risk: Math.round(weightedRisk),
      confidence: Math.round(avgConfidence * 100),
      signalCount: totalSignals,
      platformCount: active.length,
      sources: active.map((s) => s.label),
    };
  }, [scores]);

  return {
    scores,
    combined,
    loading: telegramLoading,
    hasData: scores.length > 0,
    showWhatsApp,
  };
}
