import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Lightbulb,
  Activity
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

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function CostTracking() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch cost data
  const { data: costs, isLoading: costsLoading } = useQuery({
    queryKey: ["provider-costs"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cost-tracker?action=summary&period=daily", {
        method: "GET"
      });
      if (error) throw error;
      return data.costs;
    }
  });

  // Fetch budgets
  const { data: budgets } = useQuery({
    queryKey: ["provider-budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_budgets" as any)
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    }
  });

  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ["budget-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_alerts" as any)
        .select("*")
        .eq("acknowledged", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  // Fetch recommendations
  const { data: recommendations } = useQuery({
    queryKey: ["cost-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_recommendations" as any)
        .select("*")
        .eq("status", "pending")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Update budget mutation
  const updateBudget = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("provider_budgets" as any)
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-budgets"] });
      toast.success("Budget updated");
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("budget_alerts" as any)
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-alerts"] });
      toast.success("Alert acknowledged");
    }
  });

  // Generate recommendations mutation
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspace_members" as any)
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (workspaceError) throw workspaceError;
      if (!workspace) throw new Error("No workspace found");

      const { error } = await supabase.functions.invoke("cost-tracker", {
        body: { action: "recommend", workspaceId: (workspace as any).workspace_id }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-recommendations"] });
      toast.success("Recommendations generated");
    }
  });

  // Calculate total costs
  const totalMonthlyCost = costs?.reduce((sum: number, cost: any) => 
    cost.period_type === "monthly" ? sum + Number(cost.total_cost_gbp) : sum, 0) || 0;

  const totalDailyCalls = costs?.reduce((sum: number, cost: any) =>
    cost.period_type === "daily" ? sum + cost.total_calls : sum, 0) || 0;

  // Prepare chart data
  const costTrendData = costs?.filter((c: any) => c.period_type === "daily")
    .slice(0, 30)
    .reverse()
    .map((c: any) => ({
      date: new Date(c.period_start).toLocaleDateString(),
      cost: Number(c.total_cost_gbp),
      calls: c.total_calls
    })) || [];

  const providerBreakdown = costs?.filter((c: any) => c.period_type === "monthly")
    .map((c: any) => ({
      name: c.provider_id,
      value: Number(c.total_cost_gbp)
    })) || [];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "default",
      critical: "destructive"
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getAlertIcon = (type: string) => {
    if (type.includes("exceeded")) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (type.includes("critical")) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminBreadcrumb currentPage="Cost Tracking" />
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Cost Tracking & Optimization</h1>
            <p className="text-muted-foreground">Monitor provider costs and optimize spending</p>
          </div>
          <Button onClick={() => generateRecommendations.mutate()}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Recommendations
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalMonthlyCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current billing period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDailyCalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Today's API usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Unacknowledged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Optimization suggestions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trend (Last 30 Days)</CardTitle>
                  <CardDescription>Daily spending over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={costTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" name="Cost (£)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost by Provider</CardTitle>
                  <CardDescription>Monthly spending breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={providerBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: £${entry.value.toFixed(2)}`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {providerBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Budgets</CardTitle>
                <CardDescription>Configure spending limits per provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets?.map((budget: any) => (
                    <div key={budget.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{budget.provider_id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {budget.daily_quota} calls/day • £{budget.monthly_budget_gbp}/month
                          </p>
                        </div>
                        <Badge variant={budget.is_active ? "default" : "secondary"}>
                          {budget.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Daily Quota</Label>
                          <Input
                            type="number"
                            defaultValue={budget.daily_quota}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              updateBudget.mutate({ id: budget.id, updates: { daily_quota: value } });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Monthly Budget (£)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={budget.monthly_budget_gbp}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateBudget.mutate({ id: budget.id, updates: { monthly_budget_gbp: value } });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Alerts</CardTitle>
                <CardDescription>Active warnings and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts?.map((alert: any) => (
                    <div key={alert.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        {getAlertIcon(alert.alert_type)}
                        <div>
                          <h3 className="font-semibold">{alert.provider_id}</h3>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert.mutate(alert.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    </div>
                  ))}
                  {!alerts?.length && (
                    <p className="text-center text-muted-foreground py-8">No active alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Recommendations</CardTitle>
                <CardDescription>AI-powered suggestions to reduce costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations?.map((rec: any) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{rec.title}</h3>
                        </div>
                        {getPriorityBadge(rec.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      {rec.estimated_savings_gbp && (
                        <p className="text-sm text-green-600">
                          Potential savings: £{Number(rec.estimated_savings_gbp).toFixed(2)}/month
                        </p>
                      )}
                    </div>
                  ))}
                  {!recommendations?.length && (
                    <p className="text-center text-muted-foreground py-8">No recommendations available</p>
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
