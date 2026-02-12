import { Shield, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnonModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPremium?: boolean;
  className?: string;
}

export function AnonModeToggle({
  enabled,
  onChange,
  isPremium = false,
  className,
}: AnonModeToggleProps) {
  return (
    <Card className={cn("p-4 border-border/50", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Label
                htmlFor="anon-mode"
                className="text-sm font-medium cursor-pointer"
              >
                Anonymous Mode
              </Label>
              {!isPremium && (
                <Badge variant="secondary" className="text-xs py-0">
                  Pro
                </Badge>
              )}
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Learn about Anonymous Mode"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium mb-1">Anonymous Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Routes scan requests through anonymizing proxies (including Tor when available)
                      to mask your IP address. Protects your identity when scanning sensitive targets.
                      May slow down scans slightly.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mask your IP during scans
            </p>
          </div>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch
                  id="anon-mode"
                  checked={enabled}
                  onCheckedChange={onChange}
                  disabled={!isPremium}
                />
              </div>
            </TooltipTrigger>
            {!isPremium && (
              <TooltipContent side="left">
                <p className="text-xs">Available with Pro Intelligence</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
