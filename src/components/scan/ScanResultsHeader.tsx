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
    <div className="sticky top-0 z-20 border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-4">
      <div className="flex items-start justify-between gap-x-6 gap-y-2">
        {/* Left: label hierarchy */}
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Scan Results
          </p>
          <h1 className="text-xl font-bold text-foreground truncate max-w-[360px] leading-tight">
            {displayLabel}
          </h1>
          <p className="text-xs text-muted-foreground">{targetTypeLabel}</p>
        </div>

        {/* Right: status + meta */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
          <Badge variant="outline" className={`gap-1 text-[10px] h-5 px-2 font-medium ${cfg.className}`}>
            <StatusIcon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </Badge>
          <div className="flex items-center gap-3">
            {startedAt && (
              <span className="text-[10px] text-muted-foreground/60">
                {new Date(startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {duration && (
              <span className="text-[10px] text-muted-foreground/60">
                {duration}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
