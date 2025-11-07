import { Progress } from "@/components/ui/progress";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceScoreIndicatorProps {
  score: number;
  label?: string;
  showDetails?: boolean;
  providerCount?: number;
  dataQuality?: number;
  className?: string;
}

export function ConfidenceScoreIndicator({ 
  score, 
  label = "Confidence Score",
  showDetails = true,
  providerCount,
  dataQuality,
  className 
}: ConfidenceScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 30) return "text-orange-600";
    return "text-red-600";
  };

  const getReliabilityText = () => {
    if (score >= 85) return "Highly reliable data";
    if (score >= 70) return "Reliable data";
    if (score >= 50) return "Moderately reliable";
    if (score >= 30) return "Less reliable";
    return "Questionable data";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Confidence score is calculated based on provider agreement, data quality, 
                  and cross-validation between sources. Higher scores indicate more reliable data.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={cn("text-2xl font-bold", getTextColor())}>{score}%</span>
      </div>

      <div className="relative">
        <Progress value={score} className="h-3" />
        <div 
          className={cn("absolute top-0 left-0 h-3 rounded-full transition-all", getColor())}
          style={{ width: `${score}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          {score >= 70 ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="space-y-1">
            <p>{getReliabilityText()}</p>
            {(providerCount !== undefined || dataQuality !== undefined) && (
              <div className="flex flex-wrap gap-3 text-xs">
                {providerCount !== undefined && (
                  <span>
                    <strong>{providerCount}</strong> provider{providerCount !== 1 ? 's' : ''}
                  </span>
                )}
                {dataQuality !== undefined && (
                  <span>
                    <strong>{dataQuality}%</strong> data quality
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
