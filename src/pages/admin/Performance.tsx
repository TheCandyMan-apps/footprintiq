import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Zap,
  Database,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  Trash2
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

export default function Performance() {
  const [timeRange, setTimeRange] = useState("24h");
  const queryClient = useQueryClient();

  // Fetch cache statistics
  const { data: cacheStats, isLoading: cacheLoading } = useQuery({
    queryKey: ["cache-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cache-manager?action=stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch cache stats');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Fetch job queue statistics
  const { data: jobStats, isLoading: jobsLoading } = useQuery({
    queryKey: ["job-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-processor?action=stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch job stats');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Fetch query performance
  const { data: queryPerf } = useQuery({
    queryKey: ["query-performance", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("query_performance" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Fetch rate limit stats
  const { data: rateLimits } = useQuery({
    queryKey: ["rate-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limits" as any)
        .select("*")
        .order("total_requests", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Clear cache mutation
  const clearCache = useMutation({
    mutationFn: async (type?: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { error } = await supabase.functions.invoke("cache-manager", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: "clear", type }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
      toast.success("Cache cleared");
    }
  });

  // Cleanup cache mutation
  const cleanupCache = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { error } = await supabase.functions.invoke("cache-manager", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: "cleanup" }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
      toast.success("Expired entries cleaned");
    }
  });

  // Calculate metrics
  const avgQueryTime = queryPerf?.reduce((sum: number, q: any) => sum + q.execution_time_ms, 0) / (queryPerf?.length || 1);
  const slowQueries = queryPerf?.filter((q: any) => q.execution_time_ms > 1000).length || 0;
  const cacheHitRate = cacheStats?.total_hits > 0 
    ? (cacheStats.total_hits / (cacheStats.total_hits + cacheStats.total_entries)) * 100 
    : 0;

  // Prepare chart data
  const queryTimeData = queryPerf?.slice(0, 50).reverse().map((q: any, idx: number) => ({
    index: idx,
    time: q.execution_time_ms,
    type: q.query_type
  })) || [];

  const cacheTypeData = Object.entries(cacheStats?.by_type || {}).map(([type, stats]: [string, any]) => ({
    type,
    entries: stats.count,
    hits: stats.total_hits
  }));

  const jobTypeData = Object.entries(jobStats?.by_type || {}).map(([type, count]) => ({
    type,
    count
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminBreadcrumb currentPage="Performance & Scale" />
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Performance & Scale</h1>
            <p className="text-muted-foreground">System optimization and monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => cleanupCache.mutate(undefined)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Cleanup Cache
            </Button>
            <Button variant="destructive" onClick={() => clearCache.mutate(undefined)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cache
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgQueryTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                {slowQueries} queries &gt; 1s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cacheHitRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {cacheStats?.total_entries || 0} entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Queue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobStats?.by_status?.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                {jobStats?.by_status?.processing || 0} processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimits?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active limiters</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queries">Query Performance</TabsTrigger>
            <TabsTrigger value="cache">Cache Layer</TabsTrigger>
            <TabsTrigger value="jobs">Background Jobs</TabsTrigger>
            <TabsTrigger value="limits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="space-y-4">
            {!queryPerf?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Query Performance Data Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Query performance tracking is not yet active. Performance metrics will appear here once database queries are monitored.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Query Execution Times</CardTitle>
                    <CardDescription>Recent query performance (last 50 queries)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={queryTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="time" stroke="hsl(var(--primary))" name="Time (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Slow Queries</CardTitle>
                    <CardDescription>Queries taking &gt; 1 second</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {queryPerf?.filter((q: any) => q.execution_time_ms > 1000).slice(0, 10).map((query: any) => (
                        <div key={query.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{query.query_type}</h3>
                              <p className="text-sm text-muted-foreground">{query.table_name}</p>
                            </div>
                            <Badge variant="destructive">{query.execution_time_ms}ms</Badge>
                          </div>
                          {!query.used_index && (
                            <p className="text-xs text-orange-600">⚠️ No index used</p>
                          )}
                        </div>
                      ))}
                      {queryPerf?.filter((q: any) => q.execution_time_ms > 1000).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No slow queries detected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            {!cacheStats?.total_entries && cacheTypeData.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cache Entries Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    The cache layer is ready but empty. Cache entries will appear here as the system stores frequently accessed data.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Entries by Type</CardTitle>
                    <CardDescription>Distribution of cached data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cacheTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entries" fill="hsl(var(--primary))" name="Entries" />
                        <Bar dataKey="hits" fill="hsl(var(--secondary))" name="Hits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cache Management</CardTitle>
                    <CardDescription>Clear cache by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(cacheStats?.by_type || {}).map(([type, stats]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center border-b pb-4">
                          <div>
                            <h3 className="font-semibold capitalize">{type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stats.count} entries • {stats.total_hits} hits
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => clearCache.mutate(type)}
                          >
                            Clear
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            {!jobStats?.total && jobTypeData.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Background Jobs Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    The job queue is empty. Background jobs will appear here when async tasks are enqueued (e.g., large scan processing, report generation).
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Background Jobs</CardTitle>
                  <CardDescription>Job queue status and distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {Object.entries(jobStats?.by_status || {}).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <div className="text-2xl font-bold">{count as number}</div>
                        <p className="text-sm text-muted-foreground capitalize">{status}</p>
                      </div>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Status</CardTitle>
                <CardDescription>Active rate limiters and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rateLimits?.map((limit: any) => (
                    <div key={limit.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{limit.endpoint}</h3>
                          <p className="text-sm text-muted-foreground">
                            {limit.identifier_type}: {limit.identifier}
                          </p>
                        </div>
                        <Badge variant={limit.current_count >= limit.limit_per_window ? "destructive" : "default"}>
                          {limit.current_count} / {limit.limit_per_window}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Total: {limit.total_requests}</span>
                        <span>Blocked: {limit.total_blocked}</span>
                        <span>Window: {limit.window_seconds}s</span>
                      </div>
                    </div>
                  ))}
                  {!rateLimits?.length && (
                    <p className="text-center text-muted-foreground py-8">No active rate limits</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
