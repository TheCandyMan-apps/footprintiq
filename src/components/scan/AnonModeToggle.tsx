import { Shield, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AnonModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPremium?: boolean;
}

export function AnonModeToggle({ enabled, onChange, isPremium = false }: AnonModeToggleProps) {
  return (
    <Card className="p-4 border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Shield className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="anon-mode" className="text-base font-medium">
                Anonymous Mode
              </Label>
              {!isPremium && (
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Routes all scan requests through anonymizing proxies (including Tor when available)
                      to protect your identity and prevent tracking. Premium feature.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Mask your IP and enhance privacy during scans
            </p>
          </div>
        </div>
        <Switch
          id="anon-mode"
          checked={enabled}
          onCheckedChange={onChange}
          disabled={!isPremium}
        />
      </div>
    </Card>
  );
}
