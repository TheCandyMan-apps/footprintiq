/**
 * MessagingExposureSummary – Compact combined risk summary
 * across all active messaging modules (Telegram + WhatsApp).
 */

import { useMemo } from "react";
import { Shield, ShieldAlert, ShieldX, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MessagingScoreInput {
  label: string;
  riskScore: number;       // 0–100
  confidence: number;      // 0–1
  signalCount: number;
  weight?: number;         // optional weighting factor (default 1)
}

interface MessagingExposureSummaryProps {
  scores: MessagingScoreInput[];
}

function getRiskLevel(score: number) {
  if (score >= 60) return { label: "Elevated", icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
  if (score >= 30) return { label: "Moderate", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { label: "Low", icon: Shield, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
}

export function MessagingExposureSummary({ scores }: MessagingExposureSummaryProps) {
  const summary = useMemo(() => {
    const active = scores.filter((s) => s.signalCount > 0 || s.riskScore > 0);

    if (active.length === 0) return null;

    // Weighted average for risk
    const totalWeight = active.reduce((sum, s) => sum + (s.weight ?? 1), 0);
    const weightedRisk = active.reduce((sum, s) => sum + s.riskScore * (s.weight ?? 1), 0) / totalWeight;
    const combinedRisk = Math.round(weightedRisk);

    // Average confidence
    const avgConfidence = active.reduce((sum, s) => sum + s.confidence, 0) / active.length;

    // Total signals
    const totalSignals = active.reduce((sum, s) => sum + s.signalCount, 0);

    return {
      risk: combinedRisk,
      confidence: Math.round(avgConfidence * 100),
      signalCount: totalSignals,
      sources: active.map((s) => s.label),
    };
  }, [scores]);

  if (!summary) return null;

  const level = getRiskLevel(summary.risk);
  const LevelIcon = level.icon;

  return (
    <div className={cn("rounded-lg border px-3 py-2.5 flex items-center gap-3 flex-wrap", level.border, level.bg)}>
      {/* Risk icon + score */}
      <div className="flex items-center gap-2">
        <LevelIcon className={cn("h-4 w-4 shrink-0", level.color)} />
        <span className={cn("text-sm font-semibold tabular-nums", level.color)}>
          {summary.risk}/100
        </span>
        <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 font-medium", level.border, level.color)}>
          {level.label}
        </Badge>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-border/60 hidden sm:block" />

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {summary.signalCount} signal{summary.signalCount !== 1 ? "s" : ""}
        </span>
        <span>
          {summary.confidence}% confidence
        </span>
        <span className="hidden sm:inline">
          {summary.sources.join(" + ")}
        </span>
      </div>
    </div>
  );
}
