/**
 * ExposureResolutionTimeline (Pro only)
 * 
 * Shows chronological history of exposure status changes.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, EyeOff, Circle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ExposureStatusHistoryRecord } from '@/hooks/useExposureStatuses';

interface ExposureResolutionTimelineProps {
  history: ExposureStatusHistoryRecord[];
  className?: string;
}

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  resolved: CheckCircle2,
  in_progress: Clock,
  ignored: EyeOff,
  active: Circle,
};

const STATUS_COLORS: Record<string, string> = {
  resolved: 'text-green-500',
  in_progress: 'text-amber-500',
  ignored: 'text-muted-foreground/60',
  active: 'text-muted-foreground',
};

export function ExposureResolutionTimeline({ history, className }: ExposureResolutionTimelineProps) {
  if (history.length === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Resolution Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            No resolution activity yet. Mark exposures as resolved to track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Resolution Timeline
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {history.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

          {history.slice(0, 20).map((entry, idx) => {
            const Icon = STATUS_ICONS[entry.new_status] || Circle;
            const color = STATUS_COLORS[entry.new_status] || 'text-muted-foreground';

            return (
              <div key={entry.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
                {/* Dot */}
                <div className={cn(
                  'relative z-10 flex items-center justify-center w-6 h-6 rounded-full border bg-background',
                  entry.new_status === 'resolved' ? 'border-green-500/50' : 'border-border'
                )}>
                  <Icon className={cn('h-3 w-3', color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground truncate">
                      {entry.platform_name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0',
                        entry.new_status === 'resolved' && 'bg-green-500/10 border-green-500/30 text-green-500',
                        entry.new_status === 'in_progress' && 'bg-amber-500/10 border-amber-500/30 text-amber-500',
                        entry.new_status === 'ignored' && 'bg-muted/30 text-muted-foreground',
                      )}
                    >
                      {entry.new_status === 'in_progress' ? 'In Progress' : 
                       entry.new_status.charAt(0).toUpperCase() + entry.new_status.slice(1)}
                    </Badge>
                    {entry.score_change != null && entry.score_change > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 bg-green-500/10 border-green-500/30 text-green-500"
                      >
                        +{entry.score_change} pts
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    {entry.old_status && (
                      <> · was {entry.old_status}</>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
