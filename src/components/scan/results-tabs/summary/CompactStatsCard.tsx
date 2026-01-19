import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, Globe, Shield, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RESULTS_SPACING, RESULTS_TYPOGRAPHY, RESULTS_BORDERS, RESULTS_BACKGROUNDS } from '../styles';

interface StatRow {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
  tooltip?: string;
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
  // Determine platform display value
  const getPlatformDisplay = (): { value: string | number; tooltip?: string } => {
    if (platformsChecked > 0) {
      return { value: platformsChecked };
    }
    // If accounts exist but platforms count is 0, show "Multiple" with tooltip
    if (accountsFound > 0) {
      return { 
        value: 'Multiple', 
        tooltip: 'Platform names may be unknown for some sources' 
      };
    }
    // No accounts found, show dash
    return { 
      value: '—', 
      tooltip: 'No platforms checked yet' 
    };
  };

  const platformDisplay = getPlatformDisplay();

  const stats: StatRow[] = [
    {
      label: 'Accounts',
      value: accountsFound,
      icon: <BarChart3 className="w-3 h-3" />,
      tooltip: 'Total accounts discovered across all platforms',
    },
    {
      label: 'Platforms',
      value: platformDisplay.value,
      icon: <Globe className="w-3 h-3" />,
      tooltip: platformDisplay.tooltip || 'Unique platforms checked during scan',
    },
    {
      label: 'Breaches',
      value: breachExposure > 0 ? breachExposure : '—',
      icon: <AlertTriangle className="w-3 h-3" />,
      highlight: breachExposure > 0,
      tooltip: breachExposure > 0 
        ? `Found in ${breachExposure} known data breach${breachExposure > 1 ? 'es' : ''}`
        : 'No breach exposures detected',
    },
    {
      label: 'Reuse',
      value: reuseSignals > 0 ? `${reuseSignals}%` : '—',
      icon: <RefreshCw className="w-3 h-3" />,
      tooltip: reuseSignals > 0 
        ? 'Estimated username reuse across platforms'
        : 'Reuse signal unavailable',
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
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
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      'flex items-center justify-between py-1 px-2 rounded text-xs cursor-help',
                      stat.highlight ? 'bg-destructive/5' : RESULTS_BACKGROUNDS.muted
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {stat.icon}
                      {stat.label}
                      {stat.tooltip && (
                        <HelpCircle className="w-2.5 h-2.5 opacity-50" />
                      )}
                    </span>
                    <span className={cn(
                      'font-medium tabular-nums',
                      stat.highlight && 'text-destructive',
                      stat.value === '—' && 'text-muted-foreground/60',
                      stat.value === 'Multiple' && 'text-muted-foreground italic'
                    )}>
                      {stat.value}
                    </span>
                  </div>
                </TooltipTrigger>
                {stat.tooltip && (
                  <TooltipContent side="left" className="max-w-[200px] text-xs">
                    <p>{stat.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
