import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SovereigntyScoreGauge } from './SovereigntyScoreGauge';
import { Shield, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface ScoreFactors {
  completedBonus: number;
  overdueDeduction: number;
  rejectedDeduction: number;
  successRateBonus: number;
}

interface SovereigntyScoreHeroProps {
  score: number;
  stats: {
    total: number;
    active: number;
    completed: number;
    rejected: number;
    pending: number;
    overdue: number;
    successRate: number;
  };
}

export function SovereigntyScoreHero({ score, stats }: SovereigntyScoreHeroProps) {
  const factors: ScoreFactors = {
    completedBonus: stats.completed * 5,
    overdueDeduction: stats.overdue * 10,
    rejectedDeduction: stats.rejected * 3,
    successRateBonus: stats.successRate > 50 ? 20 : 0,
  };

  const getTrend = () => {
    if (stats.total === 0) return 'neutral';
    if (stats.overdue > 0) return 'down';
    if (stats.successRate >= 70) return 'up';
    return 'neutral';
  };

  const trend = getTrend();

  const factorRows = [
    { label: 'Removals completed', value: `+${factors.completedBonus}`, positive: true, icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { label: 'Overdue penalties', value: factors.overdueDeduction > 0 ? `-${factors.overdueDeduction}` : '0', positive: false, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { label: 'Rejected penalties', value: factors.rejectedDeduction > 0 ? `-${factors.rejectedDeduction}` : '0', positive: false, icon: <XCircle className="h-3.5 w-3.5" /> },
    { label: 'Success rate bonus', value: factors.successRateBonus > 0 ? `+${factors.successRateBonus}` : '0', positive: true, icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary)), transparent 60%)' }} />
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <SovereigntyScoreGauge score={score} size={180} />
          <div className="flex items-center gap-1.5 mt-2">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
            {trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs attention' : 'Stable'}
            </span>
          </div>
        </div>

        {/* Factor breakdown */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Score Breakdown</h3>
            <Badge variant="outline" className="text-xs ml-auto">Base: 50</Badge>
          </div>

          <div className="space-y-2">
            {factorRows.map((factor) => (
              <div key={factor.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {factor.icon}
                  {factor.label}
                </span>
                <span className={`font-mono font-medium ${
                  factor.value.startsWith('+') && factor.value !== '+0' ? 'text-green-500' :
                  factor.value.startsWith('-') ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {factor.value}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
            <span className="font-medium">Total Score</span>
            <span className="font-bold text-lg">{score}/100</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
