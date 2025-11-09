import { useSpiderFootHealth } from "@/hooks/useSpiderFootHealth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle, Loader2 } from "lucide-react";

export function SpiderFootStatusIndicator() {
  const { health, loading } = useSpiderFootHealth();

  if (loading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Checking SpiderFoot status...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const isConfigured = health?.status === 'ok';
  const isUnreachable = health?.status === 'unreachable';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Circle 
            className={`w-3 h-3 ${
              isConfigured 
                ? 'fill-green-500 text-green-500' 
                : isUnreachable
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-red-500 text-red-500'
            }`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">
              {isConfigured ? '🟢 SpiderFoot Ready' : isUnreachable ? '🟡 SpiderFoot Unreachable' : '🔴 SpiderFoot Not Configured'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {health?.message || 'Add SPIDERFOOT_API_URL in secrets to enable'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
