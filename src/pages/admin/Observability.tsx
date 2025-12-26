import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { Activity, AlertTriangle, TrendingUp, Zap, Clock, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function Observability() {
  const [metrics, setMetrics] = useState<any>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch provider metrics
        const { data: providerData, error: providerError } = await supabase.functions.invoke('metrics-providers');
        if (!providerError) {
          setMetrics(providerData);
        }

        // Fetch real-time observability metrics
        const { data: realtimeData, error: realtimeError } = await supabase.functions.invoke('observability-metrics');
        if (!realtimeError) {
          setRealtimeMetrics(realtimeData);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every 60s to reduce connection pressure
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Provider Observability</h1>
        <p className="text-muted-foreground">Loading metrics...</p>
      </div>
    );
  }

  const providers = metrics?.providers || {};
  const providerData = Object.entries(providers).map(([id, data]: [string, any]) => ({
    name: id,
    calls: data.daily?.calls || 0,
    errorPct: data.daily?.errorPct || 0,
    p95: data.daily?.p95 || 0,
    cost: data.daily?.cost || 0,
  }));

  const totalCalls = providerData.reduce((sum, p) => sum + p.calls, 0);
  const avgErrorRate = providerData.length > 0
    ? providerData.reduce((sum, p) => sum + p.errorPct, 0) / providerData.length
    : 0;
  const totalCost = providerData.reduce((sum, p) => sum + p.cost, 0);
  const avgP95 = providerData.length > 0
    ? providerData.reduce((sum, p) => sum + p.p95, 0) / providerData.length
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Provider Observability</h1>
        <p className="text-muted-foreground">
          Real-time metrics and health monitoring for all data providers
        </p>
      </div>

      {/* Real-time Metrics Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Live · Updates every 60s
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Real-time Metrics Cards */}
      {realtimeMetrics?.realtime && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls (Last Hour)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeMetrics.realtime.totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                Real-time monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeMetrics.realtime.errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(realtimeMetrics.realtime.errorRate) < 5 ? "Healthy" : "Needs attention"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeMetrics.realtime.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average latency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeMetrics.alerts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      {realtimeMetrics?.realtime && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Calls per Minute</CardTitle>
                  <CardDescription>Last 30 minutes of traffic</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">Real-time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={realtimeMetrics.realtime.apiCallsPerMinute}>
                  <defs>
                    <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#callsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Error Rate Over Time</CardTitle>
                  <CardDescription>Error percentage by minute</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">Real-time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realtimeMetrics.realtime.errorRates}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: '% Error', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts from Supabase Logs */}
      {realtimeMetrics?.alerts && realtimeMetrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Issues detected from Supabase logs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {realtimeMetrics.alerts.map((alert: any) => (
                  <div 
                    key={alert.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-border"
                  >
                    {alert.severity === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    {alert.severity === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    )}
                    {alert.severity === 'info' && (
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">Source: {alert.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {providerData.length} providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgErrorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {avgErrorRate < 5 ? "Healthy" : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg P95 Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgP95)}ms</div>
            <p className="text-xs text-muted-foreground">
              95th percentile response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Daily budget usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calls per Provider</CardTitle>
            <CardDescription>Volume distribution across providers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate by Provider</CardTitle>
            <CardDescription>Error percentage comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errorPct" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>P95 Latency</CardTitle>
            <CardDescription>95th percentile response time (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="p95" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost per Provider</CardTitle>
            <CardDescription>Daily spending (£)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Circuit Breakers */}
      {metrics?.circuits && metrics.circuits.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Open Circuit Breakers</CardTitle>
            <CardDescription>
              Providers currently in cooldown due to repeated failures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {metrics.circuits.map((circuit: string) => (
                <li key={circuit} className="text-destructive font-medium">
                  {circuit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
