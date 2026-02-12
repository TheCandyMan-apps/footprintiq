/**
 * ProUpgradeBlock Component
 * 
 * Inline upgrade block for Free users with conversion-optimized copy.
 * 
 * Title: "Unlock the full analysis"
 * Body: "Free shows what exists. Pro explains what it means."
 * Trust line: "Public sources only • Ethical OSINT • Cancel anytime"
 * 
 * Rules:
 * - No urgency, discounts, or countdowns
 * - Never shown during scan processing
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ProUpgradeBlockProps {
  variant?: 'default' | 'compact' | 'inline';
  signalsFound?: number;
  hiddenCount?: number;
  onUpgradeClick?: () => void;
  className?: string;
}

const BENEFITS = [
  'Full identity correlation visibility',
  'False positive reduction & confidence scoring',
  'Exposure trend tracking over time',
  'Removal workflow tracking',
  'Exportable intelligence reports',
];

const COMPACT_BENEFITS = [
  'Full correlation visibility',
  'False positive reduction',
  'Exportable reports',
];

export function ProUpgradeBlock({
  variant = 'default',
  signalsFound = 0,
  hiddenCount = 0,
  onUpgradeClick,
  className,
}: ProUpgradeBlockProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate('/pricing');
    }
  };

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5',
        className
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              Switch to Pro Intelligence
            </p>
            <p className="text-[10px] text-muted-foreground">
              Full correlation analysis, trend tracking, and exportable reports.
            </p>
          </div>
        </div>
        <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleUpgrade}>
          Switch to Pro Intelligence
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden border-primary/20', className)}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Switch to Pro Intelligence</h3>
              <p className="text-[10px] text-muted-foreground mb-2">
                Full correlation analysis, trend tracking, and exportable reports.
              </p>
              <ul className="space-y-1 mb-3">
                {COMPACT_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="h-7 text-xs w-full" onClick={handleUpgrade}>
                Switch to Pro Intelligence
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: Full upgrade block
  return (
    <Card className={cn('overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent', className)}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Switch to Pro Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Full identity correlation, false positive reduction, and structured reporting.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2.5 mb-5">
          {BENEFITS.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button className="w-full" size="lg" onClick={handleUpgrade}>
          Switch to Pro Intelligence
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Trust line */}
        <p className="mt-4 text-center text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
          <Shield className="h-2.5 w-2.5" />
          Public sources only • Ethical OSINT • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
}
