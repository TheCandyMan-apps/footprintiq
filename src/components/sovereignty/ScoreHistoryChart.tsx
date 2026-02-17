import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';

interface ScoreHistoryChartProps {
  requests: SovereigntyRequest[];
  currentScore: number;
}

export function ScoreHistoryChart({ requests, currentScore }: ScoreHistoryChartProps) {
  const data = useMemo(() => {
    if (requests.length === 0) return [];

    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 11),
      end: now,
    });

    return weeks.map(weekStart => {
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      
      // Calculate score as of this week based on requests before this date
      const reqsBefore = requests.filter(r => new Date(r.created_at) <= weekEnd);
      const completed = reqsBefore.filter(r => r.status === 'completed' && r.completed_at && new Date(r.completed_at) <= weekEnd).length;
      const rejected = reqsBefore.filter(r => r.status === 'rejected').length;
      const overdue = reqsBefore.filter(r => {
        if (!r.deadline_at || r.status === 'completed' || r.status === 'rejected') return false;
        return new Date(r.deadline_at) < weekEnd;
      }).length;
      const total = reqsBefore.length;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const score = Math.min(100, Math.max(0,
        50 + (completed * 5) - (overdue * 10) - (rejected * 3) + (successRate > 50 ? 20 : 0)
      ));

      return {
        week: format(weekStart, 'MMM d'),
        score,
        completed,
        total: reqsBefore.length,
      };
    });
  }, [requests]);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Score History (12 weeks)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}/100`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
