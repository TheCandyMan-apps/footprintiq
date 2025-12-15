import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpIcon } from "@/components/ui/help-icon";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ConfidenceDistributionChartProps {
  scanId: string;
}

const CONFIDENCE_RANGES = [
  { label: "High", min: 80, max: 100, color: "hsl(142, 76%, 36%)" },
  { label: "Medium", min: 50, max: 79, color: "hsl(38, 92%, 50%)" },
  { label: "Low", min: 0, max: 49, color: "hsl(0, 84%, 60%)" },
];

export function ConfidenceDistributionChart({ scanId }: ConfidenceDistributionChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["confidence-distribution", scanId],
    queryFn: async () => {
      const { data: findings, error } = await supabase
        .from("findings")
        .select("confidence, kind")
        .eq("scan_id", scanId);

      if (error) throw error;

      // Filter out provider errors
      const validFindings = (findings || []).filter(
        (f) => !["provider_error", "provider_timeout", "tier_restriction"].includes(f.kind || "")
      );

      // Count by confidence range
      const distribution = CONFIDENCE_RANGES.map((range) => ({
        ...range,
        count: validFindings.filter((f) => {
          const confidence = f.confidence ?? 50;
          return confidence >= range.min && confidence <= range.max;
        }).length,
      }));

      // Calculate average confidence
      const totalConfidence = validFindings.reduce((sum, f) => sum + (f.confidence ?? 50), 0);
      const avgConfidence = validFindings.length > 0 ? Math.round(totalConfidence / validFindings.length) : 0;

      return {
        distribution,
        avgConfidence,
        total: validFindings.length,
      };
    },
    enabled: !!scanId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.distribution || [];
  const avgConfidence = data?.avgConfidence || 0;
  const total = data?.total || 0;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Confidence Distribution</CardTitle>
            <HelpIcon helpKey="confidence_distribution" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No findings to analyze
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (avg: number) => {
    if (avg >= 80) return "bg-success text-success-foreground";
    if (avg >= 50) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Confidence Distribution</CardTitle>
            <HelpIcon helpKey="confidence_distribution" />
          </div>
          <Badge className={getConfidenceColor(avgConfidence)}>
            Avg: {avgConfidence}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Distribution of confidence scores across {total} findings
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [value, "Findings"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with counts */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          {chartData.map((range) => (
            <div key={range.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: range.color }}
              />
              <span className="text-muted-foreground">
                {range.label}: <span className="font-medium text-foreground">{range.count}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
