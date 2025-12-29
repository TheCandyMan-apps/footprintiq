import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ScanLimitReachedProps {
  scansUsed: number;
  scansLimit: number;
  className?: string;
}

/**
 * ScanLimitReached - Friendly upgrade prompt when free user hits their scan limit.
 * Displayed instead of the scan form/button.
 */
export function ScanLimitReached({ 
  scansUsed, 
  scansLimit, 
  className 
}: ScanLimitReachedProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-muted/30 via-background to-muted/20 border-border",
      className
    )}>
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2">Monthly Scan Limit Reached</h3>

        {/* Friendly explanation */}
        <p className="text-sm text-muted-foreground mb-4">
          You've used {scansUsed} of {scansLimit} scan{scansLimit !== 1 ? 's' : ''} this month. 
          Upgrade to Pro for more scans and full analysis capabilities.
        </p>

        {/* Usage indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Your limit resets at the start of next month</span>
        </div>

        {/* Upgrade CTA */}
        <Button 
          onClick={() => navigate('/pricing')}
          size="lg"
          className="w-full max-w-xs"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Unlock Full Analysis
        </Button>

        {/* Value props */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="font-medium text-foreground mb-1">100 scans/month</p>
            <p>Pro plan includes comprehensive OSINT coverage</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="font-medium text-foreground mb-1">Full Analysis</p>
            <p>Context, evidence, correlation & AI insights</p>
          </div>
        </div>

        {/* Educational microcopy */}
        <p className="text-[10px] text-muted-foreground/60 mt-6">
          Pro users gain investigator-grade clarity on their digital exposure.
        </p>
      </div>
    </Card>
  );
}

/**
 * Compact inline version for scan buttons/forms
 */
export function ScanLimitReachedInline({ 
  scansUsed, 
  scansLimit,
  className 
}: ScanLimitReachedProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border/50",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Scan limit reached</p>
          <p className="text-xs text-muted-foreground">
            {scansUsed}/{scansLimit} scans used this month
          </p>
        </div>
      </div>
      <Button 
        onClick={() => navigate('/pricing')}
        size="sm"
      >
        <TrendingUp className="h-4 w-4 mr-1.5" />
        Unlock Full Analysis
      </Button>
    </div>
  );
}
