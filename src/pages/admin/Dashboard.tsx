import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Database,
  Zap,
  DollarSign,
  Settings,
  BarChart3,
  Clock,
  Shield,
  ClipboardCheck
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { CreditUsageBreakdown } from "@/components/admin/CreditUsageBreakdown";
import { ScanMonitoringWidget } from "@/components/admin/ScanMonitoringWidget";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("24h");

  // Fetch real provider health metrics from scan_provider_events
  const { data: providerHealth } = useQuery({
    queryKey: ["provider-health-metrics", timeRange],
    queryFn: async () => {
      const hoursBack = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("scan_provider_events")
        .select("provider, event")
        .gte("created_at", since);
      
      if (error) throw error;
      
      // Aggregate by provider
      const providerStats: Record<string, { successes: number; failures: number }> = {};
      (data || []).forEach((evt: any) => {
        if (!providerStats[evt.provider]) {
          providerStats[evt.provider] = { successes: 0, failures: 0 };
        }
        if (evt.event === "success") {
          providerStats[evt.provider].successes++;
        } else if (evt.event === "error" || evt.event === "timeout") {
          providerStats[evt.provider].failures++;
        }
      });
      
      return providerStats;
    },
    refetchInterval: 30000
  });

  // Fetch SLO definitions with recent measurements
  const { data: slos } = useQuery({
    queryKey: ["slo-summary"],
    queryFn: async () => {
      const { data: definitions, error: defError } = await supabase
        .from("slo_definitions")
        .select("*")
        .eq("is_active", true);
      
      if (defError) throw defError;
      
      // Get recent measurements for each SLO
      const { data: measurements, error: measError } = await supabase
        .from("slo_measurements")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(100);
      
      if (measError) throw measError;
      
      // Attach latest measurement to each SLO
      return (definitions || []).map((slo: any) => {
        const latestMeasurement = (measurements || []).find((m: any) => m.slo_id === slo.id);
        return {
          ...slo,
          latestMeasurement,
          target: slo.target_value,
          enabled: slo.is_active,
        };
      });
    }
  });

  // Fetch incidents
  const { data: incidents } = useQuery({
    queryKey: ["active-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .in("status", ["investigating", "identified", "monitoring"])
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  // Fetch circuit breaker status
  const { data: circuits } = useQuery({
    queryKey: ["circuit-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circuit_breaker_states")
        .select("*")
        .order("failure_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  // Fetch cost summary - use credits_ledger directly for reliability
  const { data: costs } = useQuery({
    queryKey: ["cost-summary-credits", timeRange],
    queryFn: async () => {
      const hoursBack = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("credits_ledger")
        .select("delta")
        .lt("delta", 0)
        .gte("created_at", since);
      
      if (error) throw error;
      
      const totalSpent = (data || []).reduce((sum: number, item: any) => sum + Math.abs(item.delta), 0);
      return { totalSpent };
    }
  });

  // Fetch budget alerts
  const { data: alerts } = useQuery({
    queryKey: ["budget-alerts-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_alerts")
        .select("*")
        .eq("acknowledged", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  // Calculate metrics
  const totalProviders = Object.keys(providerHealth || {}).length;
  const openCircuits = circuits?.filter((c: any) => c.state === 'open').length || 0;
  const activeSLOs = slos?.filter((slo: any) => slo.enabled).length || 0;
  const sloViolations = slos?.reduce((sum: number, slo: any) => {
    const measurement = slo.latestMeasurement;
    if (!measurement) return sum;
    return sum + (measurement.is_violation ? 1 : 0);
  }, 0) || 0;

  const totalCreditSpent = costs?.totalSpent || 0;

  // Prepare chart data from real provider events
  const providerHealthData = Object.entries(providerHealth || {})
    .map(([name, stats]: [string, any]) => ({
      name,
      successes: stats.successes,
      failures: stats.failures,
    }))
    .filter(p => p.successes > 0 || p.failures > 0)
    .sort((a, b) => (b.successes + b.failures) - (a.successes + a.failures))
    .slice(0, 10);

  // SLO compliance data from definitions with target values
  const sloComplianceData = slos?.map((slo: any) => {
    const measurement = slo.latestMeasurement;
    return {
      name: slo.name?.replace(/^(API |Scan |Provider )/, '') || 'Unknown',
      current: measurement?.measured_value || 0,
      target: slo.target || 0,
      compliant: measurement ? !measurement.is_violation : true
    };
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      operational: "default",
      investigating: "destructive",
      identified: "destructive",
      monitoring: "secondary",
      resolved: "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getCircuitBadge = (state: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      closed: "default",
      open: "destructive",
      half_open: "secondary"
    };
    return <Badge variant={variants[state]}>{state}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border min-h-[calc(100vh-4rem)]">
          <AdminNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 px-4 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">System-wide monitoring and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTimeRange("24h")}>24h</Button>
              <Button variant="outline" onClick={() => setTimeRange("7d")}>7d</Button>
              <Button variant="outline" onClick={() => setTimeRange("30d")}>30d</Button>
            </div>
          </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProviders}</div>
              <p className="text-xs text-muted-foreground">
                {openCircuits} circuits open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLO Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSLOs > 0 ? Math.round(((activeSLOs - sloViolations) / activeSLOs) * 100) : 100}%
              </div>
              <p className="text-xs text-muted-foreground">
                {sloViolations} violations active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCreditSpent} credits</div>
              <p className="text-xs text-muted-foreground">
                {alerts?.length || 0} budget alerts
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Health</CardTitle>
                  <CardDescription>Circuit breaker status by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={providerHealthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="successes" fill="hsl(var(--primary))" name="Successes" />
                      <Bar dataKey="failures" fill="hsl(var(--destructive))" name="Failures" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SLO Compliance</CardTitle>
                  <CardDescription>Current vs target performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sloComplianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" />
                      <Bar dataKey="target" fill="hsl(var(--secondary))" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Credit Usage Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CreditUsageBreakdown />
              <ScanMonitoringWidget />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Navigate to detailed admin pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/errors")}>
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Error Logs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/system-health")}>
                    <Activity className="h-5 w-5" />
                    <span className="text-sm">System Health</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/providers")}>
                    <Database className="h-5 w-5" />
                    <span className="text-sm">Providers</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/observability")}>
                    <Activity className="h-5 w-5" />
                    <span className="text-sm">Observability</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/circuit-breakers")}>
                    <Zap className="h-5 w-5" />
                    <span className="text-sm">Circuits</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/cost-tracking")}>
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Costs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/users")}>
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/admin/workspace-audit")}>
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">Workspaces</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 border-primary/50" onClick={() => navigate("/admin/system-audit")}>
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span className="text-sm">System Audit</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Status</CardTitle>
                <CardDescription>Circuit breaker and health information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {circuits?.map((circuit: any) => (
                    <div key={circuit.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <h3 className="font-semibold">{circuit.provider_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {circuit.success_count} successes / {circuit.failure_count} failures
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getCircuitBadge(circuit.state)}
                        <span className="text-sm text-muted-foreground">
                          {circuit.total_trips} trips
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
                <CardDescription>Ongoing system issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents?.map((incident: any) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{incident.incident_number}</h3>
                          <p className="text-sm text-muted-foreground">{incident.title}</p>
                        </div>
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm mb-2">{incident.description}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Severity: {incident.severity}</span>
                        <span>•</span>
                        <span>{new Date(incident.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {!incidents?.length && (
                    <p className="text-center text-muted-foreground py-8">No active incidents</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Alerts</CardTitle>
                <CardDescription>Unacknowledged cost warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts?.map((alert: any) => (
                    <div key={alert.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1" />
                        <div>
                          <h3 className="font-semibold">{alert.provider_id}</h3>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">{alert.alert_type}</Badge>
                    </div>
                  ))}
                  {!alerts?.length && (
                    <p className="text-center text-muted-foreground py-8">No active alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
