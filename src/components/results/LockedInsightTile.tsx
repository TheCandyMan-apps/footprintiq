import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type PlanTier, getTierLabel } from "@/lib/billing/planCapabilities";

interface LockedInsightTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredTier: PlanTier;
  className?: string;
}

export function LockedInsightTile({ 
  title, 
  description, 
  icon, 
  requiredTier, 
  className 
}: LockedInsightTileProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Blurred placeholder content */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded animate-pulse" />
            <div className="h-16 bg-gradient-to-r from-muted/30 to-muted/10 rounded" />
            <div className="h-4 w-2/3 bg-gradient-to-r from-muted/20 to-muted/5 rounded" />
          </div>
        </CardContent>
      </div>
      
      {/* Overlay with upgrade CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
        <div className="text-center p-4 max-w-[200px]">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm mb-1">{title}</p>
          <p className="text-xs text-muted-foreground mb-4">{description}</p>
          <Button size="sm" variant="default" asChild className="w-full">
            <Link to="/pricing">
              Upgrade to {getTierLabel(requiredTier)}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
