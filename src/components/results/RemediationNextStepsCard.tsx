import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, ListChecks, CheckCircle2, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExposureDriver } from '@/lib/exposureScoreDrivers';
import type { RemediationPlan, Impact, Effort } from '@/lib/remediationPlan';

interface RemediationNextStepsCardProps {
  drivers: ExposureDriver[];
  plan: RemediationPlan;
  isLocked?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const config: Record<Impact, { label: string; className: string }> = {
    high: { label: 'High impact', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    med: { label: 'Medium impact', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    low: { label: 'Low impact', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  };
  const c = config[impact];
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', c.className)}>
      <Zap className="h-2.5 w-2.5 mr-0.5" />
      {c.label}
    </Badge>
  );
}

function EffortBadge({ effort }: { effort: Effort }) {
  const config: Record<Effort, { label: string; className: string }> = {
    easy: { label: 'Quick', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    med: { label: 'Moderate', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    hard: { label: 'Involved', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  };
  const c = config[effort];
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', c.className)}>
      <Clock className="h-2.5 w-2.5 mr-0.5" />
      {c.label}
    </Badge>
  );
}

export function RemediationNextStepsCard({
  drivers,
  plan,
  isLocked = false,
  onUpgradeClick,
  className,
}: RemediationNextStepsCardProps) {
  if (plan.steps.length === 0) return null;

  const visibleDrivers = isLocked ? drivers.slice(0, 1) : drivers;
  const hiddenDrivers = isLocked ? Math.max(0, drivers.length - 1) : 0;
  const visibleSteps = isLocked ? plan.steps.slice(0, 1) : plan.steps;
  const hiddenSteps = isLocked ? Math.max(0, plan.steps.length - 1) : 0;

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">Next Steps</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
            {plan.steps.length} step{plan.steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground leading-relaxed">{plan.summary}</p>

        {/* Top drivers */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Top drivers</p>
          <ul className="space-y-1">
            {visibleDrivers.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary/60" />
                <span>{d.label}</span>
              </li>
            ))}
          </ul>
          {isLocked && hiddenDrivers > 0 && (
            <p className="text-[10px] text-muted-foreground/60 mt-1 ml-5">
              +{hiddenDrivers} more driver{hiddenDrivers !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Steps */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-2">Recommended next steps</p>
          <div className="space-y-3">
            {visibleSteps.map((step, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  {!isLocked && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ImpactBadge impact={step.impact} />
                      <EffortBadge effort={step.effort} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locked overlay / CTA */}
        {isLocked && hiddenSteps > 0 && (
          <div className="relative">
            {/* Blurred preview of next step */}
            {plan.steps[1] && (
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20 blur-[6px] select-none pointer-events-none" aria-hidden>
                <p className="text-sm font-medium text-foreground">{plan.steps[1].title}</p>
                <p className="text-xs text-muted-foreground">{plan.steps[1].description}</p>
              </div>
            )}

            {/* CTA overlay */}
            <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {hiddenSteps} more personalised step{hiddenSteps !== 1 ? 's' : ''} available with Pro
                  </span>
                </div>
                {onUpgradeClick && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onUpgradeClick}
                    className="text-xs gap-1.5 flex-shrink-0 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Unlock all steps
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Includes impact ratings, effort estimates, and a full remediation checklist.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
