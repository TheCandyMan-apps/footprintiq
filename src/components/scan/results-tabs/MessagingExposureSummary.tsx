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
  if (score >= 60) return { label: "Elevated", icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", barClass: "[&_div]:bg-destructive" };
  if (score >= 30) return { label: "Moderate", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", barClass: "[&_div]:bg-amber-500" };
  return { label: "Low", icon: Shield, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", barClass: "[&_div]:bg-green-500" };
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
    <div className={cn("rounded-lg border px-3 py-2.5 space-y-2", level.border, level.bg)}>
      {/* Top row: score + risk badge + stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LevelIcon className={cn("h-4 w-4 shrink-0", level.color)} />
          <span className={cn("text-lg font-bold tabular-nums", level.color)}>
            {summary.risk}/100
          </span>
          <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 font-medium", level.border, level.color)}>
            {level.label}
          </Badge>
        </div>

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
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

      {/* Risk metric bar */}
      <div className="pt-2">
        <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              summary.risk >= 60 ? "bg-destructive" : summary.risk >= 30 ? "bg-amber-500" : "bg-green-500"
            )}
            style={{ width: `${summary.risk}%` }}
          />
        </div>
      </div>
    </div>
  );
}
