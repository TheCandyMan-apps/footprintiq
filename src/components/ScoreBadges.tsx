import { Badge } from "./ui/badge";
import { Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import type { EntityScore } from "@/lib/score";

interface RiskBadgeProps {
  riskScore: number;
  riskLevel: EntityScore["riskLevel"];
}

export function RiskBadge({ riskScore, riskLevel }: RiskBadgeProps) {
  const colors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-blue-500 text-white",
    minimal: "bg-green-500 text-white",
  };

  const icons = {
    critical: <AlertTriangle className="w-3 h-3" />,
    high: <AlertTriangle className="w-3 h-3" />,
    medium: <Shield className="w-3 h-3" />,
    low: <Shield className="w-3 h-3" />,
    minimal: <Shield className="w-3 h-3" />,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${colors[riskLevel]} flex items-center gap-1`}>
            {icons[riskLevel]}
            Risk: {riskScore.toFixed(1)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium capitalize">{riskLevel} Risk</p>
          <p className="text-xs text-muted-foreground">
            Score calculated from finding severity and provider corroboration
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ConfidenceBadgeProps {
  confidenceScore: number;
  confidenceLevel: EntityScore["confidenceLevel"];
  providerCount: number;
}

export function ConfidenceBadge({ confidenceScore, confidenceLevel, providerCount }: ConfidenceBadgeProps) {
  const colors = {
    very_high: "bg-primary text-primary-foreground",
    high: "bg-blue-600 text-white",
    medium: "bg-slate-500 text-white",
    low: "bg-slate-400 text-white",
  };

  const labels = {
    very_high: "Very High",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${colors[confidenceLevel]} flex items-center gap-1`}>
            <TrendingUp className="w-3 h-3" />
            Confidence: {confidenceScore.toFixed(1)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">{labels[confidenceLevel]} Confidence</p>
          <p className="text-xs text-muted-foreground">
            Based on {providerCount} provider{providerCount !== 1 ? "s" : ""} and data quality
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ScoreBadgesProps {
  score: EntityScore;
}

export function ScoreBadges({ score }: ScoreBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <RiskBadge riskScore={score.riskScore} riskLevel={score.riskLevel} />
      <ConfidenceBadge
        confidenceScore={score.confidenceScore}
        confidenceLevel={score.confidenceLevel}
        providerCount={score.providerCount}
      />
      <Badge variant="outline" className="flex items-center gap-1">
        {score.providerCount} {score.providerCount === 1 ? "Provider" : "Providers"}
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1">
        {score.findingCount} {score.findingCount === 1 ? "Finding" : "Findings"}
      </Badge>
    </div>
  );
}
