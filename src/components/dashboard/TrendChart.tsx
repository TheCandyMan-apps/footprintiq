import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Brush } from 'recharts';
import { SeriesPoint } from '@/types/dashboard';
import { format } from 'date-fns';

interface TrendChartProps {
  data: SeriesPoint[];
  showForecast?: boolean;
  loading?: boolean;
}

export function TrendChart({ data, showForecast = false, loading }: TrendChartProps) {
  const chartConfig = {
    low: {
      label: 'Low',
      color: 'hsl(var(--accent))',
    },
    medium: {
      label: 'Medium',
      color: 'hsl(var(--primary))',
    },
    high: {
      label: 'High',
      color: 'hsl(var(--destructive))',
    },
    forecast: {
      label: 'Forecast',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  const processedData = useMemo(() => {
    return data.map((point) => ({
      date: format(new Date(point.ts), 'MMM d'),
      low: point.low,
      medium: point.medium,
      high: point.high,
      forecast: showForecast ? point.forecast : undefined,
    }));
  }, [data, showForecast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Findings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative p-6 rounded-lg backdrop-blur-xl bg-background/40 border border-border/50 shadow-[0_0_40px_hsl(280_70%_60%/0.2)]">
      <CardHeader className="p-0 pb-4">
        <CardTitle>Findings Trend by Severity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={processedData} accessibilityLayer>
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280 70% 50%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(280 70% 50%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(320 70% 50%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(320 70% 50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="low"
              stackId="1"
              stroke="hsl(var(--accent))"
              fill="url(#colorLow)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="medium"
              stackId="1"
              stroke="hsl(280 70% 50%)"
              fill="url(#colorMedium)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="high"
              stackId="1"
              stroke="hsl(320 70% 50%)"
              fill="url(#colorHigh)"
              strokeWidth={2}
            />
            {showForecast && (
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                fill="none"
                strokeWidth={2}
              />
            )}
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="hsl(var(--primary))"
              fill="hsl(var(--muted))"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}
