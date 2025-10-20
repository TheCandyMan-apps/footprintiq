import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { analyzeTrends, calculateTrendMetrics, TrendDataPoint } from "@/lib/trends";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendChartProps {
  userId: string;
  days?: number;
}

export const TrendChart = ({ userId, days = 30 }: TrendChartProps) => {
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const data = await analyzeTrends(userId, days);
        setTrends(data);
      } catch (error) {
        console.error('Failed to load trends:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, [userId, days]);

  if (loading) {
    return <Card><CardContent className="p-6">Loading trends...</CardContent></Card>;
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No trend data available yet. Run more scans to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = calculateTrendMetrics(trends);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Trends</CardTitle>
        <CardDescription>Last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            {metrics.privacyScoreTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium">Score Trend</div>
              <div className="text-2xl font-bold">
                {metrics.privacyScoreTrend > 0 ? '+' : ''}{metrics.privacyScoreTrend}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Avg Score</div>
            <div className="text-2xl font-bold">{metrics.averageScore}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Exposure Trend</div>
            <div className="text-2xl font-bold">
              {metrics.exposureTrend > 0 ? '+' : ''}{metrics.exposureTrend}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Avg Exposures</div>
            <div className="text-2xl font-bold">{metrics.averageExposures}</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="privacyScore" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Privacy Score"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalSources" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Total Exposures"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
