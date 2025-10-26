import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ThreatTrend {
  threat_type: string;
  count: number;
  severity: string;
  growth: number;
}

export function TrendingThreats() {
  const [trends, setTrends] = useState<ThreatTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("global-analytics", {
        body: { type: "trending_threats" },
      });

      if (error) throw error;
      setTrends(data?.trends || []);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Threat Intelligence
          </CardTitle>
          <CardDescription>Loading trending threats...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Threat Intelligence
        </CardTitle>
        <CardDescription>
          Community insights from anonymized cross-user analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trending threats detected in the community
            </p>
          ) : (
            trends.map((trend, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {trend.threat_type.replace(/_/g, " ")}
                    </span>
                    <Badge variant={getSeverityColor(trend.severity) as any}>
                      {trend.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {trend.count} detections
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {trend.growth > 0 ? "+" : ""}
                      {trend.growth}% this week
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
