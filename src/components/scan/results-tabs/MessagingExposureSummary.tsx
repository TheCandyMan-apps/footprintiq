/**
 * MessagingExposureSummary – Compact combined risk summary
 * across all active messaging modules (Telegram + WhatsApp).
 */

import { useMemo } from "react";
import { Shield, ShieldAlert, ShieldX, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { riskBadgeClass, BADGE_SIZE } from "@/lib/badgeStyles";

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
  if (score >= 60) return { label: "Elevated", key: "elevated" as const, icon: ShieldX, color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/15" };
  if (score >= 30) return { label: "Moderate", key: "moderate" as const, icon: ShieldAlert, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" };
  return { label: "Low", key: "low" as const, icon: Shield, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/5", border: "border-green-500/15" };
}

export function MessagingExposureSummary({ scores }: MessagingExposureSummaryProps) {
  const summary = useMemo(() => {
    const active = scores.filter((s) => s.signalCount > 0 || s.riskScore > 0);
    if (active.length === 0) return null;
    const totalWeight = active.reduce((sum, s) => sum + (s.weight ?? 1), 0);
    const weightedRisk = active.reduce((sum, s) => sum + s.riskScore * (s.weight ?? 1), 0) / totalWeight;
    const combinedRisk = Math.round(weightedRisk);
    const avgConfidence = active.reduce((sum, s) => sum + s.confidence, 0) / active.length;
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
    <div className={cn("rounded-xl border px-5 py-5 space-y-3 shadow-card", level.border, level.bg)}>
      {/* Top row: score + risk badge + stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LevelIcon className={cn("h-4 w-4 shrink-0", level.color)} />
          <span className={cn("text-lg font-bold tabular-nums", level.color)}>
            {summary.risk}/100
          </span>
          <Badge variant="outline" className={cn(BADGE_SIZE, riskBadgeClass(level.key))}>
            {level.label}
          </Badge>
        </div>

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {summary.signalCount} signal{summary.signalCount !== 1 ? "s" : ""}
          </span>
          <span>
            {summary.confidence}%
            {" "}
            <span className="text-muted-foreground/60">
              {summary.confidence > 70 ? "High confidence" : summary.confidence >= 40 ? "Moderate confidence" : "Limited data"}
            </span>
          </span>
          {/* Platform badges */}
          {summary.sources.map((src) => (
            <Badge key={src} variant="secondary" className="text-[9px] h-4 px-1.5 font-medium">
              {src}
            </Badge>
          ))}
        </div>
      </div>

    </div>
  );
}
