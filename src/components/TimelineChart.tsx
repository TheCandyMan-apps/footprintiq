import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineEvent } from "@/lib/timeline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TimelineChartProps {
  events: TimelineEvent[];
}

export const TimelineChart = ({ events }: TimelineChartProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'high': return 'hsl(var(--destructive) / 0.7)';
      case 'medium': return 'hsl(var(--primary))';
      case 'low': return 'hsl(var(--accent))';
      default: return 'hsl(var(--muted))';
    }
  };

  const chartData = events.map(event => ({
    date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: event.count,
    severity: event.severity,
    fill: getSeverityColor(event.severity)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finding Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};