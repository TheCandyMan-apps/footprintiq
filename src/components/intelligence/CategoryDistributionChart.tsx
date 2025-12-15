import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpIcon } from "@/components/ui/help-icon";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPlatformCategory, PlatformCategory } from "@/lib/categoryMapping";
import { extractPlatform } from "@/lib/evidenceParser";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryDistributionChartProps {
  scanId: string;
}

const CATEGORY_COLORS: Record<PlatformCategory, string> = {
  Social: "hsl(217, 91%, 60%)",
  Developer: "hsl(142, 76%, 36%)",
  Games: "hsl(263, 70%, 50%)",
  NSFW: "hsl(0, 84%, 60%)",
  Crypto: "hsl(38, 92%, 50%)",
  Marketplaces: "hsl(48, 96%, 53%)",
  Forums: "hsl(188, 95%, 42%)",
  Other: "hsl(240, 5%, 46%)",
};

export function CategoryDistributionChart({ scanId }: CategoryDistributionChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["category-distribution", scanId],
    queryFn: async () => {
      const { data: findings, error } = await supabase
        .from("findings")
        .select("evidence, meta, kind, provider")
        .eq("scan_id", scanId);

      if (error) throw error;

      // Filter out provider errors
      const validFindings = (findings || []).filter(
        (f) => !["provider_error", "provider_timeout", "tier_restriction"].includes(f.kind || "")
      );

      // Count by category
      const categoryCounts: Record<PlatformCategory, number> = {
        Social: 0,
        Developer: 0,
        Games: 0,
        NSFW: 0,
        Crypto: 0,
        Marketplaces: 0,
        Forums: 0,
        Other: 0,
      };

      for (const finding of validFindings) {
        const platform = extractPlatform(finding);
        const category = getPlatformCategory(platform || "");
        categoryCounts[category]++;
      }

      // Convert to chart data, filter out zeros
      return Object.entries(categoryCounts)
        .filter(([_, count]) => count > 0)
        .map(([category, count]) => ({
          name: category,
          value: count,
          color: CATEGORY_COLORS[category as PlatformCategory],
        }));
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

  const chartData = data || [];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <HelpIcon helpKey="category_distribution" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No findings to categorize
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Category Distribution</CardTitle>
          <HelpIcon helpKey="category_distribution" />
        </div>
        <p className="text-sm text-muted-foreground">
          {total} findings across {chartData.length} categories
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, "Findings"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
