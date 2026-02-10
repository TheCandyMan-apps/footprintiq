import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceScoreBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Show educational microcopy below the badge */
  showMicrocopy?: boolean;
}

const EDUCATIONAL_TIPS = [
  "False positives happen — validation matters.",
  "Confidence reflects match quality, not threat level.",
  "Lower scores may still be genuine matches.",
];

export function ConfidenceScoreBadge({ 
  score, 
  showIcon = true, 
  size = "md",
  className,
  showMicrocopy = false,
}: ConfidenceScoreBadgeProps) {
  const getConfidenceLevel = () => {
    if (score >= 85) return { label: "Very High", variant: "default" as const, icon: Shield, color: "text-emerald-600" };
    if (score >= 70) return { label: "High", variant: "secondary" as const, icon: Shield, color: "text-green-600" };
    if (score >= 50) return { label: "Medium", variant: "outline" as const, icon: Info, color: "text-yellow-600" };
    if (score >= 30) return { label: "Low", variant: "outline" as const, icon: AlertTriangle, color: "text-orange-600" };
    return { label: "Very Low", variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" };
  };

  const level = getConfidenceLevel();
  const Icon = level.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  // Select tip based on score range
  const getTip = () => {
    if (score < 50) return EDUCATIONAL_TIPS[2];
    if (score < 70) return EDUCATIONAL_TIPS[0];
    return EDUCATIONAL_TIPS[1];
  };

  const badge = (
    <Badge 
      variant={level.variant}
      className={cn(
        "flex items-center gap-1.5 font-medium",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{score}%</span>
      <span className="text-muted-foreground">•</span>
      <span>{level.label}</span>
    </Badge>
  );

  if (showMicrocopy) {
    return (
      <div className="space-y-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {badge}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-center">
          <p className="text-xs">{getTip()}</p>
          <a href="/guides/interpret-osint-results" className="text-[10px] underline underline-offset-2 text-primary mt-1 block">What confidence levels mean</a>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {getTip()}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          <p className="text-xs">{getTip()}</p>
          <a href="/guides/interpret-osint-results" className="text-[10px] underline underline-offset-2 text-primary mt-1 block">What confidence levels mean</a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
