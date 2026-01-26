/**
 * RiskSnapshotCard Component
 * 
 * Displays a narrative-focused risk assessment with plan-aware visibility.
 * Shows signals count and high-confidence matches in a clear, non-alarmist way.
 * 
 * EVIDENCE GATING: Risk levels are only shown when sufficient evidence exists.
 * - Critical/High require justification and minimum evidence thresholds
 * - If evidence is insufficient, the section does not render severity
 */

import { Shield, AlertTriangle, CheckCircle2, AlertCircle, Lock, TrendingUp, Eye, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type RiskSnapshot } from '@/lib/results/resultsViewModel';
import { type PlanTier } from '@/lib/billing/planCapabilities';
import { shouldRenderSection, clampSeverity } from '@/lib/evidenceGating';

interface RiskSnapshotCardProps {
  snapshot: RiskSnapshot;
  plan: PlanTier;
  isFullAccess: boolean;
  variant?: 'default' | 'narrative';
  className?: string;
}

const STATUS_CONFIG = {
  clean: {
    icon: CheckCircle2,
    label: 'Minimal Exposure',
    narrative: 'Your digital footprint appears well-managed',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  exposed: {
    icon: AlertTriangle,
    label: 'Exposure Detected',
    narrative: 'Some public information was discovered',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  at_risk: {
    icon: AlertCircle,
    label: 'Review Recommended',
    narrative: 'Findings that may need your attention',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
};

const RISK_LEVEL_CONFIG = {
  low: { label: 'Low', color: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
  moderate: { label: 'Moderate', color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' },
  high: { label: 'High', color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  critical: { label: 'Critical', color: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function RiskSnapshotCard({ 
  snapshot, 
  plan, 
  isFullAccess, 
  variant = 'default',
  className 
}: RiskSnapshotCardProps) {
  const statusConfig = STATUS_CONFIG[snapshot.status];
  const StatusIcon = statusConfig.icon;

  // Evidence gating: check if we have enough evidence to show the risk level
  const hasEvidence = snapshot.signalsFound > 0;
  const evidencePayload = {
    evidenceCount: snapshot.signalsFound,
    confidence: snapshot.highConfidenceCount > 0 ? 70 : 30,
    justification: snapshot.signalsFound > 0 ? 'Signals detected' : null,
  };
  
  // Clamp the risk level based on evidence
  const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    critical: 'critical',
    high: 'high',
    moderate: 'medium',
    low: 'low',
  };
  const requestedSeverity = severityMap[snapshot.riskLevel] || 'low';
  const allowedSeverity = hasEvidence ? clampSeverity(requestedSeverity, evidencePayload) : null;
  
  // Get the appropriate risk config - use the clamped severity or hide it
  const displayRiskLevel = allowedSeverity 
    ? (allowedSeverity === 'medium' ? 'moderate' : allowedSeverity) as keyof typeof RISK_LEVEL_CONFIG
    : null;
  const riskConfig = displayRiskLevel ? RISK_LEVEL_CONFIG[displayRiskLevel] : null;

  // Narrative variant for Free users - shows "Risk Snapshot" card
  if (variant === 'narrative') {
    return (
      <Card className={cn('overflow-hidden border-border/50', className)}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Risk Snapshot</h3>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Signals Detected */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {snapshot.signalsFound}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Signals detected
              </div>
            </div>

            {/* High-Confidence Matches */}
            <div className="text-center">
              {isFullAccess ? (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {snapshot.highConfidenceCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    High-confidence
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {snapshot.highConfidenceCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    High-confidence
                  </div>
                </>
              )}
            </div>

            {/* Overall Risk - Only show if evidence supports it */}
            <div className="text-center">
              {isFullAccess && riskConfig ? (
                <>
                  <Badge 
                    variant="outline"
                    className={cn('text-xs px-2 py-0.5 h-auto', riskConfig.color)}
                  >
                    {riskConfig.label}
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Overall risk
                  </div>
                </>
              ) : isFullAccess && !riskConfig ? (
                // Has access but insufficient evidence for risk level
                <>
                  <span className="text-lg font-semibold text-muted-foreground">—</span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Insufficient data
                  </div>
                </>
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1 cursor-help">
                          <span className="text-lg font-semibold text-muted-foreground">
                            Unclear
                          </span>
                          <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-[220px] text-center p-3"
                      >
                        <p className="text-xs">
                          Free scans confirm presence. Pro clarifies risk and relevance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Overall risk
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default compact variant (for Pro users)
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
                {riskConfig ? (
                  <Badge className={cn('text-[8px] px-1.5 py-0 h-4', riskConfig.color)}>
                    {riskConfig.label} Risk
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 text-muted-foreground">
                    Assessing
                  </Badge>
                )}
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
