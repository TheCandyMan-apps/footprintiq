import { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { format } from 'date-fns';

const LazyResponsiveContainer = lazy(() =>
  import('recharts').then(m => ({ default: m.ResponsiveContainer }))
);
const LazyAreaChart = lazy(() =>
  import('recharts').then(m => ({ default: m.AreaChart }))
);
const LazyArea = lazy(() =>
  import('recharts').then(m => ({ default: m.Area }))
);
const LazyXAxis = lazy(() =>
  import('recharts').then(m => ({ default: m.XAxis }))
);
const LazyYAxis = lazy(() =>
  import('recharts').then(m => ({ default: m.YAxis }))
);
const LazyTooltip = lazy(() =>
  import('recharts').then(m => ({ default: m.Tooltip }))
);
const LazyCartesianGrid = lazy(() =>
  import('recharts').then(m => ({ default: m.CartesianGrid }))
);

interface SovereigntyTimelineProps {
  requests: SovereigntyRequest[];
}

export function SovereigntyTimeline({ requests }: SovereigntyTimelineProps) {
  const chartData = useMemo(() => {
    if (requests.length === 0) return [];

    // Group by date: cumulative submitted vs completed
    const dateMap = new Map<string, { submitted: number; completed: number }>();

    const sorted = [...requests].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let cumSubmitted = 0;
    let cumCompleted = 0;

    sorted.forEach((req) => {
      const date = format(new Date(req.created_at), 'MMM d');
      cumSubmitted++;
      if (req.status === 'completed') cumCompleted++;
      dateMap.set(date, { submitted: cumSubmitted, completed: cumCompleted });
    });

    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
      active: counts.submitted - counts.completed,
    }));
  }, [requests]);

  if (chartData.length < 2) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Erasure Request Timeline</CardTitle>
        <p className="text-xs text-muted-foreground">Cumulative requests vs removals over time</p>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="w-full h-[200px]" />}>
          <LazyResponsiveContainer width="100%" height={200}>
            <LazyAreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success, 142 76% 36%))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success, 142 76% 36%))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <LazyCartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <LazyXAxis
                dataKey="date"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <LazyYAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                allowDecimals={false}
              />
              <LazyTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
              />
              <LazyArea
                type="monotone"
                dataKey="submitted"
                stroke="hsl(var(--primary))"
                fill="url(#colorSubmitted)"
                strokeWidth={2}
                name="Total Requests"
              />
              <LazyArea
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--success, 142 76% 36%))"
                fill="url(#colorCompleted)"
                strokeWidth={2}
                name="Removals Completed"
              />
            </LazyAreaChart>
          </LazyResponsiveContainer>
        </Suspense>
      </CardContent>
    </Card>
  );
}
