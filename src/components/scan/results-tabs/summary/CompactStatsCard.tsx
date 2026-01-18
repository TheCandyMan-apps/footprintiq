import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      label: 'Accounts found',
      value: accountsFound,
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      label: 'Platforms',
      value: platformsChecked,
      icon: <Globe className="w-3.5 h-3.5" />,
    },
    {
      label: 'Breach exposure',
      value: breachExposure > 0 ? breachExposure : '—',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      highlight: breachExposure > 0,
    },
    {
      label: 'Reuse signals',
      value: reuseSignals > 0 ? `${reuseSignals}%` : '—',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="space-y-1">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className={cn(
                'flex items-center justify-between py-1.5 px-2 rounded text-sm',
                stat.highlight ? 'bg-destructive/5' : 'bg-muted/30'
              )}
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                {stat.icon}
                {stat.label}
              </span>
              <span className={cn(
                'font-semibold tabular-nums',
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
