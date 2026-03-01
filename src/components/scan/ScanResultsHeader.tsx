import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface ScanResultsHeaderProps {
  displayLabel: string;
  targetTypeLabel: string;
  status: 'running' | 'completed' | 'failed';
  startedAt?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  running: { label: 'Running', icon: Loader2, className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function ScanResultsHeader({ displayLabel, targetTypeLabel, status, startedAt }: ScanResultsHeaderProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
  const StatusIcon = cfg.icon;

  return (
    <Card disableHover className="border-border/40 bg-card/80">
      <CardContent className="py-3 px-4 sm:px-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Scan Results for:</span>
          <Badge variant="secondary" className="text-sm font-semibold px-2.5 py-0.5 truncate max-w-[260px]">
            {displayLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">({targetTypeLabel})</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <Badge variant="outline" className={`gap-1 text-[11px] h-5 px-2 font-medium ${cfg.className}`}>
            <StatusIcon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </Badge>
          {startedAt && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Started: {new Date(startedAt).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
