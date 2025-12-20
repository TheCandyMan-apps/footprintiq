import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { type PlanTier, getTierLabel } from "@/lib/billing/planCapabilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LockedExportButtonProps {
  label: string;
  requiredTier: PlanTier;
  icon?: React.ReactNode;
}

export function LockedExportButton({ label, requiredTier, icon }: LockedExportButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start opacity-60 cursor-not-allowed" 
            disabled
          >
            {icon || <Lock className="h-4 w-4 mr-2" />}
            <span className="flex-1 text-left">{label}</span>
            <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-sm mb-2">
            {label} requires {getTierLabel(requiredTier)} plan
          </p>
          <Button size="sm" variant="secondary" asChild className="w-full">
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
