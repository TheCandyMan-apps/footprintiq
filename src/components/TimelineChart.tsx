import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineEvent } from "@/lib/timeline";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface TimelineChartProps {
  events: TimelineEvent[];
}

export const TimelineChart = ({ events }: TimelineChartProps) => {
  // Transform events into stacked severity data
  const severityColors = {
    critical: "hsl(var(--destructive))",
    high: "hsl(var(--chart-1))",
    medium: "hsl(var(--chart-3))",
    low: "hsl(var(--chart-4))",
    info: "hsl(var(--muted))",
  };

  // Group by date and severity
  const dateMap = new Map<string, Record<string, number>>();
  
  events.forEach((event) => {
    const date = new Date(event.date).toLocaleDateString();
    if (!dateMap.has(date)) {
      dateMap.set(date, { critical: 0, high: 0, medium: 0, low: 0, info: 0 });
    }
    
    const severityCounts = dateMap.get(date)!;
    event.findings.forEach((finding) => {
      severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
    });
  });

  const chartData = Array.from(dateMap.entries()).map(([date, severities]) => ({
    date,
    ...severities,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Findings over time, stacked by severity
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="critical" stackId="severity" fill={severityColors.critical} name="Critical" />
            <Bar dataKey="high" stackId="severity" fill={severityColors.high} name="High" />
            <Bar dataKey="medium" stackId="severity" fill={severityColors.medium} name="Medium" />
            <Bar dataKey="low" stackId="severity" fill={severityColors.low} name="Low" />
            <Bar dataKey="info" stackId="severity" fill={severityColors.info} name="Info" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(severityColors).map(([severity, color]) => (
            <div key={severity} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-xs capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
