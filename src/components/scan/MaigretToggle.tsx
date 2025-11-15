import { HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MaigretToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function MaigretToggle({ enabled, onChange, disabled }: MaigretToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2">
        <Label htmlFor="maigret-toggle" className="cursor-pointer">
          Username OSINT Scan (Multi-Tool)
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Checks 300+ social platforms for username presence using multiple OSINT tools (Maigret, WhatsMyName, GoSearch). 
                Results show linked profiles with confidence scores.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Switch
        id="maigret-toggle"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
