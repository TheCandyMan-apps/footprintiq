import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Finding } from '@/lib/ufm';
import { calculateExposureReductionScore } from '@/lib/exposureReductionScore';

interface PrivacyRiskTrendChartProps {
  findings: Finding[];
  className?: string;
}

interface TrendPoint {
  label: string;
  score: number;
  exposures: number;
  highRisk: number;
}

/**
 * Simulates a trend using scan findings data.
 * In production this would pull from historical scan snapshots.
 */
function simulateTrend(findings: Finding[]): TrendPoint[] {
  const totalFindings = findings.length;
  const highRisk = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length;
  const resolved = findings.filter(f =>
    (f as any).status === 'resolved' || (f as any).is_resolved === true
  ).length;

  const currentScore = calculateExposureReductionScore(findings).score;

  // Simulate historical snapshots going back 6 periods
  const points: TrendPoint[] = [];
  const labels = ['6w ago', '5w ago', '4w ago', '3w ago', '2w ago', '1w ago', 'Now'];

  for (let i = 0; i < labels.length; i++) {
    const progress = i / (labels.length - 1); // 0 → 1
    // Score improves over time toward current (simulates remediation progress)
    const baseScore = Math.max(0, currentScore - Math.round((1 - progress) * (15 + resolved * 2)));
    // Exposures decrease as items get resolved
    const activeExposures = Math.round(totalFindings - resolved * progress);
    // High risk decreases slightly over time
    const activeHighRisk = Math.round(highRisk * (1 - progress * 0.3));

    points.push({
      label: labels[i],
      score: Math.min(100, Math.max(0, baseScore)),
      exposures: Math.max(0, activeExposures),
      highRisk: Math.max(0, activeHighRisk),
    });
  }

  return points;
}

export function PrivacyRiskTrendChart({ findings, className }: PrivacyRiskTrendChartProps) {
  const trendData = useMemo(() => simulateTrend(findings), [findings]);

  const chartConfig = {
    score: {
      label: 'Reduction Score',
      color: 'hsl(142, 71%, 45%)',
    },
    exposures: {
      label: 'Exposure Count',
      color: 'hsl(var(--primary))',
    },
    highRisk: {
      label: 'High-Risk',
      color: 'hsl(0, 84%, 60%)',
    },
  };

  const first = trendData[0];
  const last = trendData[trendData.length - 1];
  const scoreDelta = last.score - first.score;
  const exposureDelta = last.exposures - first.exposures;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Privacy Risk Trend
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Track how your exposure evolves over time and measure your reduction progress.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-xs">
              Track how your exposure evolves over time and measure your reduction progress.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              {scoreDelta > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : scoreDelta < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={scoreDelta > 0 ? 'text-green-500 font-medium' : scoreDelta < 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                {scoreDelta > 0 ? '+' : ''}{scoreDelta} pts
              </span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              Exposures: {exposureDelta > 0 ? '+' : ''}{exposureDelta}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ComposedChart data={trendData} accessibilityLayer>
            <defs>
              <linearGradient id="trendScoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="trendHighRiskFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="hsl(142, 71%, 45%)"
              fill="url(#trendScoreFill)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(142, 71%, 45%)' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="exposures"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="highRisk"
              stroke="hsl(0, 84%, 60%)"
              fill="url(#trendHighRiskFill)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          </ComposedChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded bg-green-500 inline-block" /> Score
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded bg-primary inline-block" /> Exposures
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded bg-red-500 inline-block border-dashed" /> High-Risk
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
