import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type PlanTier, getTierLabel } from "@/lib/billing/planCapabilities";

interface LockedInsightTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredTier: PlanTier;
  className?: string;
  /** Custom CTA text */
  ctaText?: string;
}

/** CTA copy for different insight types */
const getCTAText = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('correlation') || lowerTitle.includes('link')) {
    return 'See why this result exists';
  }
  if (lowerTitle.includes('evidence') || lowerTitle.includes('source')) {
    return 'Unlock full exposure details';
  }
  if (lowerTitle.includes('context') || lowerTitle.includes('confidence')) {
    return 'Reduce false positives with Pro';
  }
  return 'Unlock full exposure details';
};

export function LockedInsightTile({ 
  title, 
  description, 
  icon, 
  requiredTier, 
  className,
  ctaText,
}: LockedInsightTileProps) {
  const displayCTA = ctaText || getCTAText(title);

  return (
    <Card className={cn("relative overflow-hidden group cursor-pointer", className)}>
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
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px] transition-colors group-hover:bg-background/80">
        <div className="text-center p-4 max-w-[220px]">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold text-sm mb-1">{displayCTA}</p>
          <p className="text-xs text-muted-foreground mb-4">{description}</p>
          <Button size="sm" variant="default" asChild className="w-full group-hover:shadow-md transition-shadow">
            <Link to="/pricing">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Upgrade to {getTierLabel(requiredTier)}
            </Link>
          </Button>
          {/* Educational microcopy */}
          <p className="text-[9px] text-muted-foreground/60 mt-3">
            Public data becomes risky when combined.
          </p>
        </div>
      </div>
    </Card>
  );
}
