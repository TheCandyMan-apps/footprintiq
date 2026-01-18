import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, CheckCircle, Eye, FileWarning, 
  Globe, Link2, RefreshCw, Shield, Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Signal {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  description: string;
}

interface TopSignalsListProps {
  signals: Signal[];
  maxItems?: number;
}

const severityConfig = {
  high: { 
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle 
  },
  medium: { 
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: FileWarning 
  },
  low: { 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Eye 
  },
  info: { 
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: Shield 
  },
};

export function TopSignalsList({ signals, maxItems = 5 }: TopSignalsListProps) {
  const displaySignals = signals.slice(0, maxItems);

  if (displaySignals.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No significant signals detected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Top Signals
      </h4>
      <ul className="space-y-1.5">
        {displaySignals.map((signal) => {
          const config = severityConfig[signal.severity];
          const Icon = config.icon;
          return (
            <li 
              key={signal.id} 
              className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/30"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-foreground/90">{signal.label}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-[10px] px-1.5 py-0 h-4 font-normal capitalize',
                  config.color
                )}
              >
                {signal.severity}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Helper to generate signals from scan data
export function generateSignals(
  found: number,
  claimed: number,
  breachCount: number,
  platforms: number,
  reuseScore: number
): Signal[] {
  const signals: Signal[] = [];

  if (breachCount > 3) {
    signals.push({
      id: 'high-breach',
      label: `${breachCount} data breaches detected`,
      severity: 'high',
      description: 'Multiple data exposures found'
    });
  } else if (breachCount > 0) {
    signals.push({
      id: 'breach',
      label: `${breachCount} breach${breachCount !== 1 ? 'es' : ''} detected`,
      severity: 'medium',
      description: 'Data exposure found'
    });
  }

  if (reuseScore > 70) {
    signals.push({
      id: 'reuse-high',
      label: 'High username reuse pattern',
      severity: 'medium',
      description: 'Username used consistently across platforms'
    });
  } else if (reuseScore > 40) {
    signals.push({
      id: 'reuse-mod',
      label: 'Moderate username reuse',
      severity: 'low',
      description: 'Username appears on multiple platforms'
    });
  }

  if (found > 10) {
    signals.push({
      id: 'wide-presence',
      label: `Active on ${found} platforms`,
      severity: 'info',
      description: 'Significant online presence'
    });
  } else if (found > 0) {
    signals.push({
      id: 'presence',
      label: `${found} active profile${found !== 1 ? 's' : ''} confirmed`,
      severity: 'info',
      description: 'Active accounts found'
    });
  }

  if (claimed > 5) {
    signals.push({
      id: 'claimed',
      label: `${claimed} reserved usernames`,
      severity: 'low',
      description: 'Usernames claimed but inactive'
    });
  }

  if (platforms > 20) {
    signals.push({
      id: 'platforms',
      label: `Presence across ${platforms} services`,
      severity: 'info',
      description: 'Wide platform coverage'
    });
  }

  if (breachCount === 0 && found < 5) {
    signals.push({
      id: 'low-exposure',
      label: 'Minimal digital footprint',
      severity: 'info',
      description: 'Limited online presence'
    });
  }

  return signals.slice(0, 5);
}
