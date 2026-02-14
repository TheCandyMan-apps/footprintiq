/**
 * Exposure Reduction Score™ Card
 * 
 * Large visual score circle with color-coded levels.
 * Free: Current score only + upgrade CTA.
 * Pro: Score + trend, % improvement, before/after, historical graph.
 */

import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, ArrowRight, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type ReductionLevel,
  getReductionLevelLabel,
  getReductionColor,
  getReductionBgColor,
  getReductionStrokeColor,
} from '@/lib/exposureReductionScore';

interface ExposureReductionScoreCardProps {
  score: number;
  level: ReductionLevel;
  isLocked?: boolean;
  /** Pro-only: previous score for comparison */
  previousScore?: number;
  /** Pro-only: historical scores for sparkline */
  history?: { date: string; score: number }[];
  onUpgradeClick?: () => void;
  className?: string;
}

function AnimatedScoreCircle({ score, level }: { score: number; level: ReductionLevel }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(5, (animatedScore / 100) * 100);
  const offset = circumference - (percentage / 100) * circumference;
  const strokeColor = getReductionStrokeColor(level);

  useEffect(() => {
    let startTime: number;
    let frame: number;
    const duration = 1500;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      setAnimatedScore(Math.round(easeOut(progress) * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [score]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          fill="none"
          opacity="0.2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-bold tabular-nums', getReductionColor(level))}>
          {animatedScore}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function MiniSparkline({ history }: { history: { date: string; score: number }[] }) {
  if (history.length < 2) return null;

  const width = 120;
  const height = 32;
  const padding = 2;
  const scores = history.map(h => h.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((s, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((s - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExposureReductionScoreCard({
  score,
  level,
  isLocked = false,
  previousScore,
  history,
  onUpgradeClick,
  className,
}: ExposureReductionScoreCardProps) {
  const improvement = previousScore != null ? score - previousScore : null;
  const improvementPct = previousScore != null && previousScore > 0
    ? Math.round(((score - previousScore) / previousScore) * 100)
    : null;

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Score circle */}
          <AnimatedScoreCircle score={score} level={level} />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h3 className="text-sm font-semibold text-foreground">Exposure Reduction Score™</h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium px-2 py-0.5',
                  getReductionBgColor(level),
                  getReductionColor(level)
                )}
              >
                {getReductionLevelLabel(level)}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    This score reflects your overall digital exposure risk and improves as exposures are resolved.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Pro: Trend + improvement */}
            {!isLocked && improvement != null && (
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm">
                  {improvement > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : improvement < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    'font-medium',
                    improvement > 0 ? 'text-green-500' : improvement < 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {improvement > 0 ? '+' : ''}{improvement} pts
                  </span>
                  {improvementPct != null && (
                    <span className="text-xs text-muted-foreground">
                      ({improvementPct > 0 ? '+' : ''}{improvementPct}%)
                    </span>
                  )}
                </div>

                {/* Before vs After */}
                {previousScore != null && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-muted">{previousScore}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className={cn('px-1.5 py-0.5 rounded font-medium', getReductionBgColor(level), getReductionColor(level))}>
                      {score}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Pro: Historical sparkline */}
            {!isLocked && history && history.length > 1 && (
              <div className="flex items-center gap-2">
                <MiniSparkline history={history} />
                <span className="text-[10px] text-muted-foreground">Score trend</span>
              </div>
            )}

            {/* Free: Upgrade CTA */}
            {isLocked && (
              <div className="pt-2 border-t border-border/30 space-y-2">
                <div className="flex items-center gap-3 justify-center sm:justify-between flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Unlock Score Tracking with Pro</span>
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
                <p className="text-[11px] text-muted-foreground/70">
                  Pro includes score trends, % improvement tracking, and historical comparison graphs.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
