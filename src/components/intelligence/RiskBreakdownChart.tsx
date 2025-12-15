import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpIcon } from "@/components/ui/help-icon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RiskBreakdownChartProps {
  scanId: string;
}

const SEVERITY_CONFIG = {
  critical: { color: "bg-red-600", label: "Critical", order: 0 },
  high: { color: "bg-orange-500", label: "High", order: 1 },
  medium: { color: "bg-yellow-500", label: "Medium", order: 2 },
  low: { color: "bg-blue-500", label: "Low", order: 3 },
  info: { color: "bg-gray-400", label: "Info", order: 4 },
};

type SeverityLevel = keyof typeof SEVERITY_CONFIG;

export function RiskBreakdownChart({ scanId }: RiskBreakdownChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["risk-breakdown", scanId],
    queryFn: async () => {
      const { data: findings, error } = await supabase
        .from("findings")
        .select("severity, kind")
        .eq("scan_id", scanId);

      if (error) throw error;

      // Filter out provider errors
      const validFindings = (findings || []).filter(
        (f) => !["provider_error", "provider_timeout", "tier_restriction"].includes(f.kind || "")
      );

      // Count by severity
      const severityCounts: Record<SeverityLevel, number> = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      };

      for (const finding of validFindings) {
        const severity = (finding.severity || "info").toLowerCase() as SeverityLevel;
        if (severity in severityCounts) {
          severityCounts[severity]++;
        } else {
          severityCounts.info++;
        }
      }

      return {
        counts: severityCounts,
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
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const counts = data?.counts || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const total = data?.total || 0;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Risk Breakdown</CardTitle>
            <HelpIcon helpKey="risk_breakdown" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16 text-muted-foreground">
            No findings to analyze
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages for the stacked bar
  const segments = Object.entries(SEVERITY_CONFIG)
    .map(([key, config]) => ({
      key: key as SeverityLevel,
      ...config,
      count: counts[key as SeverityLevel],
      percentage: (counts[key as SeverityLevel] / total) * 100,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Risk Breakdown</CardTitle>
          <HelpIcon helpKey="risk_breakdown" />
        </div>
        <p className="text-sm text-muted-foreground">
          Severity distribution across {total} findings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked Horizontal Bar */}
        <div className="relative h-8 rounded-lg overflow-hidden flex">
          {segments.map((segment, index) => (
            <div
              key={segment.key}
              className={cn(
                segment.color,
                "h-full transition-all duration-300 hover:brightness-110",
                "flex items-center justify-center"
              )}
              style={{ width: `${segment.percentage}%` }}
              title={`${segment.label}: ${segment.count} (${segment.percentage.toFixed(1)}%)`}
            >
              {segment.percentage > 10 && (
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {segment.count}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend with counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
            const count = counts[key as SeverityLevel];
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-all",
                  count > 0 ? "bg-muted/50" : "opacity-50"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full", config.color)} />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                  <span className="font-semibold text-sm">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
