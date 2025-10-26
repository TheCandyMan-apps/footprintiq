import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HELP, HelpKey } from "@/lib/help/copy";

interface HelpIconProps {
  helpKey?: HelpKey;
  text?: string;
  className?: string;
}

export function HelpIcon({ helpKey, text, className = "" }: HelpIconProps) {
  const content = helpKey ? HELP[helpKey] : text;
  
  if (!content) return null;
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Help"
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${className}`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
