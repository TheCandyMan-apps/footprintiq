import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, Globe, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RESULTS_SPACING, RESULTS_TYPOGRAPHY, RESULTS_BORDERS, RESULTS_BACKGROUNDS } from '../styles';

interface StatRow {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface CompactStatsCardProps {
  accountsFound: number;
  platformsChecked: number;
  breachExposure: number;
  reuseSignals: number;
}

export function CompactStatsCard({ 
  accountsFound, 
  platformsChecked, 
  breachExposure, 
  reuseSignals 
}: CompactStatsCardProps) {
  const stats: StatRow[] = [
    {
      label: 'Accounts',
      value: accountsFound,
      icon: <BarChart3 className="w-3 h-3" />,
    },
    {
      label: 'Platforms',
      value: platformsChecked,
      icon: <Globe className="w-3 h-3" />,
    },
    {
      label: 'Breaches',
      value: breachExposure > 0 ? breachExposure : '—',
      icon: <AlertTriangle className="w-3 h-3" />,
      highlight: breachExposure > 0,
    },
    {
      label: 'Reuse',
      value: reuseSignals > 0 ? `${reuseSignals}%` : '—',
      icon: <RefreshCw className="w-3 h-3" />,
    },
  ];

  return (
    <Card className={RESULTS_BORDERS.cardBorder}>
      <CardHeader className="pb-1.5 pt-2.5 px-3">
        <h4 className={`${RESULTS_TYPOGRAPHY.sectionTitle} flex items-center gap-1.5`}>
          <Shield className="w-3 h-3" />
          Stats
        </h4>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        <div className="space-y-1">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className={cn(
                'flex items-center justify-between py-1 px-2 rounded text-xs',
                stat.highlight ? 'bg-destructive/5' : RESULTS_BACKGROUNDS.muted
              )}
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {stat.icon}
                {stat.label}
              </span>
              <span className={cn(
                'font-medium tabular-nums',
                stat.highlight && 'text-destructive'
              )}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
