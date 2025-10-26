import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HELP_ENTRIES } from "@/lib/help/copy";

interface HelpTooltipProps {
  helpKey: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function HelpTooltip({ helpKey, side = "top", className }: HelpTooltipProps) {
  const helpEntry = HELP_ENTRIES[helpKey];

  if (!helpEntry) {
    console.warn(`Help key "${helpKey}" not found in help registry`);
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors ${className}`}
          onClick={(e) => e.preventDefault()}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help: {helpEntry.title}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="font-semibold mb-1">{helpEntry.title}</p>
        <p className="text-sm text-muted-foreground">{helpEntry.content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
