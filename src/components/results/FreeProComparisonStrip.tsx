import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FreeProComparisonStripProps {
  onUpgradeClick?: () => void;
  className?: string;
}

const FREE_FEATURES = [
  'Snapshot exposure',
  '10 findings',
  'Basic confidence score',
];

const PRO_FEATURES = [
  'Full platform coverage',
  'Exposure prioritization scoring',
  'Removal pathway mapping',
  'Curated opt-out database',
  'Exportable remediation plan',
  'Historical tracking & risk trends',
];

export function FreeProComparisonStrip({ onUpgradeClick, className }: FreeProComparisonStripProps) {
  return (
    <Card className={cn('overflow-hidden border-primary/20', className)}>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border/40">
          {/* Free Column */}
          <div className="p-4 bg-muted/10">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Free
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Column */}
          <div className="p-4 bg-primary/5">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Pro
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-t border-border/30">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={onUpgradeClick}
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Unlock Full Exposure Intelligence
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
