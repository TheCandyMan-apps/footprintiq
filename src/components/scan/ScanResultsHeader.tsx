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
    <div className="sticky top-0 z-20 border-b border-border/20 bg-background/98 backdrop-blur-md px-5 sm:px-8 py-6 shadow-[0_1px_4px_0_hsl(var(--foreground)/0.03),0_4px_12px_-4px_hsl(var(--foreground)/0.04)]">
      <div className="flex items-center justify-between gap-x-8">
        {/* Left: label hierarchy */}
        <div className="min-w-0 flex flex-col gap-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/45 leading-none">
            Scan Results
          </p>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate max-w-[420px] leading-none">
            {displayLabel}
          </h1>
          <p className="text-[11px] text-muted-foreground/50 leading-none">{targetTypeLabel}</p>
        </div>

        {/* Right: status + meta */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Timestamp cluster */}
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            {startedAt && (
              <span className="text-[10px] text-muted-foreground/40 tabular-nums leading-tight">
                {new Date(startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/35 tabular-nums leading-tight">
                <Timer className="h-2.5 w-2.5" />
                {duration}
              </span>
            )}
          </div>

          {/* Status badge */}
          <Badge variant="outline" className={`gap-1.5 text-[10px] h-6 px-3 font-medium border ${cfg.className}`}>
            <StatusIcon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
