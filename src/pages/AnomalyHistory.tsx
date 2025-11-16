import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, TrendingUp, Calendar, Filter, ArrowLeft, Zap } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface Anomaly {
  id: string;
  anomaly_type: string;
  severity: string;
  description: string;
  detected_at: string;
  scan_id: string;
  metadata: any;
}

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
};

const ANOMALY_TYPE_COLORS = [
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#10b981", // green
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function AnomalyHistory() {
  const navigate = useNavigate();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("7");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchAnomalies();
  }, [dateRange, severityFilter, typeFilter]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      let query = supabase
        .from("anomalies")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("detected_at", startDate.toISOString())
        .lte("detected_at", endDate.toISOString())
        .order("detected_at", { ascending: false });

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("anomaly_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnomalies(data || []);
    } catch (error: any) {
      console.error("Error fetching anomalies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const timelineData = anomalies.reduce((acc, anomaly) => {
    const date = format(new Date(anomaly.detected_at), "MMM dd");
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count++;
      existing[anomaly.severity] = (existing[anomaly.severity] || 0) + 1;
    } else {
      acc.push({
        date,
        count: 1,
        [anomaly.severity]: 1,
      });
    }
    return acc;
  }, [] as any[]);

  const severityData = anomalies.reduce((acc, anomaly) => {
    const existing = acc.find(d => d.severity === anomaly.severity);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        severity: anomaly.severity,
        count: 1,
      });
    }
    return acc;
  }, [] as any[]);

  const typeData = anomalies.reduce((acc, anomaly) => {
    const type = anomaly.anomaly_type.replace(/_/g, " ");
    const existing = acc.find(d => d.type === type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        type,
        count: 1,
      });
    }
    return acc;
  }, [] as any[]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const uniqueTypes = [...new Set(anomalies.map(a => a.anomaly_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">Loading anomaly history...</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Zap className="w-8 h-8 text-primary" />
                Anomaly History
              </h1>
              <p className="text-muted-foreground">
                Track and analyze security anomalies detected over time
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{anomalies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical/High
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {anomalies.filter(a => a.severity === "critical" || a.severity === "high").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Common Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {typeData.length > 0
                  ? typeData.reduce((max, curr) => curr.count > max.count ? curr : max).type
                  : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(anomalies.length / parseInt(dateRange)).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Anomalies Over Time
              </CardTitle>
              <CardDescription>
                Daily anomaly detection trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Anomalies", color: "hsl(var(--primary))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Severity Distribution
              </CardTitle>
              <CardDescription>
                Anomalies grouped by severity level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Count", color: "hsl(var(--primary))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityData}>
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {severityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS] || "hsl(var(--primary))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Anomaly Types
              </CardTitle>
              <CardDescription>
                Distribution of detected anomaly types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Count", color: "hsl(var(--primary))" },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={false}
                    >
                      {typeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ANOMALY_TYPE_COLORS[index % ANOMALY_TYPE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-sm font-medium text-foreground">
                          {value}: {entry.payload.count}
                        </span>
                      )}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Anomalies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Anomalies</CardTitle>
            <CardDescription>
              Latest detected anomalies in chronological order
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No anomalies detected in the selected time range</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.slice(0, 10).map((anomaly) => (
                  <Card key={anomaly.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(anomaly.severity) as any}>
                              {anomaly.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {anomaly.anomaly_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(anomaly.detected_at), "MMM dd, yyyy HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm">{anomaly.description}</p>
                          {anomaly.metadata && Object.keys(anomaly.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-primary cursor-pointer hover:underline">
                                View metadata
                              </summary>
                              <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                                {JSON.stringify(anomaly.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
