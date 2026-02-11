import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExposureLevel, ExposureCategory } from '@/lib/exposureScore';
import {
  getExposureLevelColor,
  getExposureLevelBgColor,
  getExposureLevelLabel,
} from '@/lib/exposureScore';
import type { ExposureDriver } from '@/lib/exposureScoreDrivers';

interface ExposureScoreCardProps {
  score: number;
  level: ExposureLevel;
  drivers: ExposureDriver[];
  isLocked?: boolean;
  /** Full category breakdown for Pro users */
  categories?: ExposureCategory[];
  /** Max drivers to show (default: all) */
  maxDrivers?: number;
  onUpgradeClick?: () => void;
  className?: string;
}

export function ExposureScoreCard({
  score,
  level,
  drivers,
  isLocked = false,
  categories,
  maxDrivers,
  onUpgradeClick,
  className,
}: ExposureScoreCardProps) {
  const visibleDrivers = maxDrivers ? drivers.slice(0, maxDrivers) : drivers;
  const hiddenDriverCount = maxDrivers ? Math.max(0, drivers.length - maxDrivers) : 0;

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Score circle */}
          <div className="flex-shrink-0 self-center sm:self-start">
            <div
              className={cn(
                'flex flex-col items-center justify-center w-24 h-24 rounded-full border-[3px] transition-colors',
                getExposureLevelBgColor(level)
              )}
            >
              <span className={cn('text-3xl font-bold tabular-nums', getExposureLevelColor(level))}>
                {score}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-semibold text-foreground">Exposure Score</h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium px-2 py-0.5',
                  getExposureLevelBgColor(level),
                  getExposureLevelColor(level)
                )}
              >
                {getExposureLevelLabel(level)}
              </Badge>
            </div>

            {/* Drivers list */}
            <ul className="space-y-1.5">
              {visibleDrivers.map((driver, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                  <span>{driver.label}</span>
                </li>
              ))}
            </ul>

            {/* Category breakdown (Pro only) */}
            {categories && !isLocked && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs font-medium text-muted-foreground mb-2">Category Breakdown</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1.5 text-xs">
                      {cat.detected ? (
                        <CheckCircle2 className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className={cn(cat.detected ? 'text-foreground' : 'text-muted-foreground/60')}>
                        {cat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked section for Free users */}
            {isLocked && (
              <div className="pt-3 border-t border-border/30">
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      Unlock full exposure breakdown + remediation steps
                      {hiddenDriverCount > 0 && ` (+${hiddenDriverCount} more insights)`}
                    </span>
                  </div>
                  {onUpgradeClick && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onUpgradeClick}
                      className="text-xs gap-1.5 flex-shrink-0 border-primary/30 text-primary hover:bg-primary/5"
                    >
                      Upgrade to Pro
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
