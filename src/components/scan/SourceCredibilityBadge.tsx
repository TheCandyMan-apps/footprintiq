import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, ShieldAlert, ShieldCheck, Info } from "lucide-react";

interface SourceCredibilityBadgeProps {
  score: number;
  confidence?: number;
  reasoning?: string;
  dataQuality?: number;
}

export function SourceCredibilityBadge({ 
  score, 
  confidence, 
  reasoning,
  dataQuality 
}: SourceCredibilityBadgeProps) {
  const getCredibilityLevel = (s: number) => {
    if (s >= 0.8) return { label: "High", variant: "default" as const, icon: ShieldCheck, color: "text-green-500" };
    if (s >= 0.5) return { label: "Medium", variant: "secondary" as const, icon: Shield, color: "text-yellow-500" };
    return { label: "Low", variant: "destructive" as const, icon: ShieldAlert, color: "text-red-500" };
  };

  const level = getCredibilityLevel(score);
  const Icon = level.icon;
  const percentage = Math.round(score * 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={level.variant} className="gap-1.5 cursor-help">
            <Icon className={`h-3.5 w-3.5 ${level.color}`} />
            <span>{level.label} ({percentage}%)</span>
            {confidence !== undefined && (
              <span className="text-xs opacity-70">±{Math.round((1 - confidence) * 100)}%</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">Source Credibility</p>
                <p className="text-sm">Score: {percentage}% credible</p>
                {confidence !== undefined && (
                  <p className="text-sm">Confidence: {Math.round(confidence * 100)}%</p>
                )}
                {dataQuality !== undefined && (
                  <p className="text-sm">Data Quality: {Math.round(dataQuality * 100)}%</p>
                )}
                {reasoning && (
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    {reasoning}
                  </p>
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
