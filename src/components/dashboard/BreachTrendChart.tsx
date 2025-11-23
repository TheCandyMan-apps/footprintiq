import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface BreachTrendChartProps {
  workspaceId?: string;
}

export function BreachTrendChart({ workspaceId }: BreachTrendChartProps) {
  const [trendData, setTrendData] = useState<Array<{ date: string; breaches: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreachTrends();
  }, [workspaceId]);

  const fetchBreachTrends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get findings from last 7 days with workspace filter
      const sevenDaysAgo = subDays(new Date(), 7);
      
      let findingsQuery = supabase
        .from('findings')
        .select('created_at, kind, severity')
        .gte('created_at', sevenDaysAgo.toISOString());
      
      if (workspaceId) {
        findingsQuery = findingsQuery.eq('workspace_id', workspaceId);
      }
      
      const { data: findings } = await findingsQuery.order('created_at', { ascending: true });

      if (!findings) {
        setLoading(false);
        return;
      }

      // Group by day and count breaches
      const breachKeywords = ['hibp', 'breach', 'leak', 'compromised', 'pwned'];
      const dailyBreaches = new Map<string, number>();

      // Initialize all 7 days
      for (let i = 6; i >= 0; i--) {
        const day = format(subDays(new Date(), i), 'MMM dd');
        dailyBreaches.set(day, 0);
      }

      findings.forEach(finding => {
        const isBreach = breachKeywords.some(k => 
          (finding.kind || '').toLowerCase().includes(k)
        ) || finding.severity === 'critical' || finding.severity === 'high';

        if (isBreach) {
          const day = format(new Date(finding.created_at), 'MMM dd');
          dailyBreaches.set(day, (dailyBreaches.get(day) || 0) + 1);
        }
      });

      const chartData = Array.from(dailyBreaches.entries()).map(([date, breaches]) => ({
        date,
        breaches,
      }));

      setTrendData(chartData);
    } catch (error) {
      console.error('Error fetching breach trends:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-destructive" />
          Breach Trend (7d)
        </CardTitle>
        <CardDescription>Daily breach detection over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="breaches" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
