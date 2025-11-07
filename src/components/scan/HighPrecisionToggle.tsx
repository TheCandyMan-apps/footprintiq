import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HighPrecisionToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPremium?: boolean;
}

export function HighPrecisionToggle({ 
  enabled, 
  onChange, 
  isPremium = false 
}: HighPrecisionToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <Crosshair className={`w-5 h-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="high-precision" className="cursor-pointer">
              High-Precision Mode
            </Label>
            <Badge variant="secondary">Premium</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Narrows geocoding results to specific regions using geographic bounds.
                    Improves accuracy for known regions (US, EU, Asia-Pacific).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enhanced accuracy with regional bounds
          </p>
        </div>
      </div>
      <Switch
        id="high-precision"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={!isPremium}
      />
    </div>
  );
}
