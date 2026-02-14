import { Lock, BarChart3, GitBranch, ShieldAlert, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LOCKED_TABS = [
  {
    id: 'deep-analytics',
    label: 'Deep Analytics',
    icon: BarChart3,
    description: 'Platform-level risk scoring, engagement metrics, and behavioral pattern analysis.',
  },
  {
    id: 'cross-platform',
    label: 'Cross-Platform Correlation',
    icon: GitBranch,
    description: 'Identity linking across services using username, email, and metadata signals.',
  },
  {
    id: 'breach-timeline',
    label: 'Breach Timeline Mapping',
    icon: ShieldAlert,
    description: 'Chronological breach exposure history with affected data categories.',
  },
  {
    id: 'risk-trend',
    label: 'Risk Trend Over Time',
    icon: TrendingUp,
    description: 'Exposure trajectory tracking and historical risk score changes.',
  },
] as const;

interface LockedTabsPreviewProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export function LockedTabsPreview({ onUpgradeClick, className }: LockedTabsPreviewProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Pro Intelligence Modules</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        These modules are available with a Pro subscription.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LOCKED_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={onUpgradeClick}
              className="group relative text-left p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              {/* Blur overlay */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-[1px] z-[1]" />

              <div className="relative z-[2]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{tab.label}</span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 ml-auto">
                    <Lock className="h-2 w-2 mr-0.5" />
                    Pro
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground/70 line-clamp-2">
                  {tab.description}
                </p>
              </div>

              {/* Hover CTA */}
              <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[3] bg-background/80">
                <span className="text-xs font-medium text-primary flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Upgrade to unlock
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-muted-foreground/60 pt-1">
        Upgrade to unlock full exposure intelligence
      </p>
    </div>
  );
}
