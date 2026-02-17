import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

interface DeadlineAlertsProps {
  requests: SovereigntyRequest[];
}

export function DeadlineAlerts({ requests }: DeadlineAlertsProps) {
  const urgent = useMemo(() => {
    return requests
      .filter((r) => {
        if (!r.deadline_at || ['completed', 'rejected'].includes(r.status)) return false;
        const daysLeft = differenceInDays(new Date(r.deadline_at), new Date());
        return daysLeft <= 7; // show if <= 7 days or overdue
      })
      .sort((a, b) => new Date(a.deadline_at!).getTime() - new Date(b.deadline_at!).getTime());
  }, [requests]);

  if (urgent.length === 0) return null;

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Deadline Alerts ({urgent.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {urgent.map((req) => {
          const daysLeft = differenceInDays(new Date(req.deadline_at!), new Date());
          const isOverdue = daysLeft < 0;

          return (
            <div
              key={req.id}
              className="flex items-center justify-between gap-2 text-sm rounded-md border p-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{req.target_entity}</span>
              </div>
              <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-xs shrink-0">
                {isOverdue
                  ? `${Math.abs(daysLeft)}d overdue`
                  : `${daysLeft}d left`}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
