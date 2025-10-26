import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DarkWebSignal } from "@/lib/darkweb/signal";

interface Props {
  signal: DarkWebSignal;
  showDetails?: boolean;
}

export function DarkWebSignalBadge({ signal, showDetails = true }: Props) {
  const getVariant = () => {
    if (signal.score >= 80) return "destructive";
    if (signal.score >= 60) return "default";
    if (signal.score >= 30) return "secondary";
    return "outline";
  };

  const getTrendIcon = () => {
    if (signal.trend === "increasing") return <TrendingUp className="w-3 h-3" />;
    if (signal.trend === "decreasing") return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  if (!showDetails) {
    return (
      <Badge variant={getVariant()} className="gap-1">
        <Shield className="w-3 h-3" />
        Dark Web: {signal.score}
        {getTrendIcon()}
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className="gap-1 cursor-help">
            <Shield className="w-3 h-3" />
            Dark Web Signal: {signal.score}/100
            {getTrendIcon()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-semibold">Signal Breakdown:</p>
            <ul className="text-sm space-y-1">
              {signal.explanation.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
            {signal.sources.length > 0 && (
              <>
                <p className="font-semibold mt-3">Sources:</p>
                <ul className="text-sm space-y-1">
                  {signal.sources.map((source, idx) => (
                    <li key={idx}>
                      • {source.provider}: {source.count} finding{source.count > 1 ? 's' : ''}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DarkWebSignalGated() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 cursor-help opacity-60">
            <Shield className="w-3 h-3" />
            Dark Web (Gated)
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-sm">
            Dark-web intelligence is policy-gated. Enable in Admin → Policies to access
            DeHashed, IntelX, and DarkSearch findings.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
