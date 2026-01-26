/**
 * ProUpgradeBlock Component
 * 
 * Inline upgrade block for Free users with "Unlock the full analysis" title,
 * benefit bullets, and CTA.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Sparkles, ArrowRight, Shield, Lock } from 'lucide-react';
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
  'See why each finding exists',
  'Confidence scores on all signals',
  'Full connection graph',
  'Export reports & evidence packs',
];

const COMPACT_BENEFITS = [
  'Full confidence scoring',
  'Complete source access',
  'Export capabilities',
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
              {hiddenCount > 0 
                ? `${hiddenCount} more findings available`
                : 'Unlock full analysis'
              }
            </p>
            <p className="text-[10px] text-muted-foreground">
              Free shows what exists. Pro explains what it means.
            </p>
          </div>
        </div>
        <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleUpgrade}>
          Upgrade
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
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Unlock the full analysis</h3>
              <ul className="space-y-1 mb-3">
                {COMPACT_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="h-7 text-xs w-full" onClick={handleUpgrade}>
                <Sparkles className="h-3 w-3 mr-1" />
                Upgrade to Pro
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
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Unlock the full analysis</h3>
            <p className="text-xs text-muted-foreground">
              Free shows what exists. Pro explains what it means.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-4">
          {BENEFITS.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Stats callout */}
        {signalsFound > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/30 mb-4">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {signalsFound} signal{signalsFound !== 1 ? 's' : ''} found 
              {hiddenCount > 0 && <> · {hiddenCount} hidden</>}
            </span>
          </div>
        )}

        {/* CTA */}
        <Button className="w-full" onClick={handleUpgrade}>
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade to Pro
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Trust line */}
        <p className="mt-3 text-center text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1">
          <Shield className="h-2.5 w-2.5" />
          Public sources only • Ethical OSINT • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
}
