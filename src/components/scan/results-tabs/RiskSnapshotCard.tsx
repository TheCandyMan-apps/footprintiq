/**
 * RiskSnapshotCard Component
 * 
 * Displays a compact risk assessment snapshot with plan-aware visibility.
 */

import { Shield, AlertTriangle, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type RiskSnapshot } from '@/lib/results/resultsViewModel';
import { type PlanTier } from '@/lib/billing/planCapabilities';

interface RiskSnapshotCardProps {
  snapshot: RiskSnapshot;
  plan: PlanTier;
  isFullAccess: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  clean: {
    icon: CheckCircle2,
    label: 'Clean',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
  },
  exposed: {
    icon: AlertTriangle,
    label: 'Exposed',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  at_risk: {
    icon: AlertCircle,
    label: 'At Risk',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
};

const RISK_LEVEL_CONFIG = {
  low: { label: 'Low', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  moderate: { label: 'Moderate', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400' },
  critical: { label: 'Critical', color: 'bg-destructive/20 text-destructive' },
};

export function RiskSnapshotCard({ snapshot, plan, isFullAccess, className }: RiskSnapshotCardProps) {
  const statusConfig = STATUS_CONFIG[snapshot.status];
  const riskConfig = RISK_LEVEL_CONFIG[snapshot.riskLevel];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', statusConfig.bg)}>
              <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold">{statusConfig.label}</span>
                <Badge className={cn('text-[8px] px-1.5 py-0 h-4', riskConfig.color)}>
                  {riskConfig.label} Risk
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {snapshot.signalsFound} signals detected
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Signals</div>
              <div className="text-sm font-semibold">{snapshot.signalsFound}</div>
            </div>
            
            {isFullAccess ? (
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">High Confidence</div>
                <div className="text-sm font-semibold text-primary">
                  {snapshot.highConfidenceCount}
                </div>
              </div>
            ) : (
              <div className="text-right opacity-60">
                <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Lock className="h-2 w-2" />
                  Pro
                </div>
                <div className="text-sm font-semibold text-muted-foreground">—</div>
              </div>
            )}
          </div>
        </div>

        {/* Free user hint */}
        {!isFullAccess && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />
              Confidence scoring and detailed analysis available in Pro
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
