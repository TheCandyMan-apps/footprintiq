import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, RefreshCw, User, Link2 } from 'lucide-react';

interface ExposureBreakdownProps {
  profileCount: number;
  uniquePlatforms: number;
  hasUsernameReuse: boolean;
  onUpgradeClick: () => void;
}

const SIGNALS = [
  {
    icon: RefreshCw,
    label: 'Username Reuse',
    description: 'Same identifier found across multiple platforms',
    severity: 'high' as const,
  },
  {
    icon: User,
    label: 'Profile Metadata',
    description: 'Bios, avatars, and display names reveal linkable data',
    severity: 'medium' as const,
  },
  {
    icon: Link2,
    label: 'Cross-Platform Correlation',
    description: 'Patterns connect profiles to the same individual',
    severity: 'high' as const,
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  low: 'bg-muted text-muted-foreground border-border/30',
};

export function ExposureBreakdown({
  profileCount,
  uniquePlatforms,
  hasUsernameReuse,
  onUpgradeClick,
}: ExposureBreakdownProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Exposure Breakdown</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            How your digital footprint creates investigative risk.
          </p>
        </div>

        <div className="space-y-2">
          {SIGNALS.map((signal, i) => {
            const Icon = signal.icon;
            const active = i === 0 ? hasUsernameReuse : true;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  active ? SEVERITY_COLORS[signal.severity] : 'bg-muted/10 border-border/20 opacity-50'
                }`}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{signal.label}</span>
                    {active && (
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1 py-0 h-3.5 border-current"
                      >
                        {signal.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">{signal.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked detailed analysis */}
        <div className="relative rounded-lg bg-muted/20 border border-border/30 p-3 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[3px] bg-background/40 z-10 flex flex-col items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground/60" />
            <p className="text-[11px] font-medium text-muted-foreground">Detailed analysis — Pro only</p>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5" onClick={onUpgradeClick}>
              Unlock Analysis <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="opacity-30 space-y-2">
            <div className="h-3 bg-muted/50 rounded w-3/4" />
            <div className="h-3 bg-muted/50 rounded w-1/2" />
            <div className="h-3 bg-muted/50 rounded w-2/3" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 px-1">
          <span>{profileCount} profiles across {uniquePlatforms} platforms</span>
          <span className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" />
            Full breakdown in Pro
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
