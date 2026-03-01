import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Loader2, XCircle, Timer } from 'lucide-react';
import { formatDistanceStrict } from 'date-fns';

interface ScanResultsHeaderProps {
  displayLabel: string;
  targetTypeLabel: string;
  status: 'running' | 'completed' | 'failed';
  startedAt?: string | null;
  completedAt?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  running: { label: 'Running', icon: Loader2, className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function ScanResultsHeader({ displayLabel, targetTypeLabel, status, startedAt, completedAt }: ScanResultsHeaderProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
  const StatusIcon = cfg.icon;

  const duration = startedAt
    ? formatDistanceStrict(
        new Date(completedAt || Date.now()),
        new Date(startedAt)
      )
    : null;

  return (
    <div className="sticky top-0 z-20 rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-[0_1px_3px_0_hsl(var(--foreground)/0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {/* Left column */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Scan Results</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground truncate max-w-[280px]">{displayLabel}</span>
              <span className="text-[11px] text-muted-foreground">({targetTypeLabel})</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant="outline" className={`gap-1 text-[11px] h-5 px-2 font-medium ${cfg.className}`}>
            <StatusIcon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </Badge>
          {startedAt && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Timer className="h-3 w-3" />
              {duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
