import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, 
  Users, Activity, BarChart3, Download, Calendar
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExecutiveMetrics {
  totalScans: number;
  totalFindings: number;
  criticalFindings: number;
  riskScore: number;
  riskTrend: number;
  activeMonitors: number;
  complianceScore: number;
}

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    totalScans: 0,
    totalFindings: 0,
    criticalFindings: 0,
    riskScore: 0,
    riskTrend: 0,
    activeMonitors: 0,
    complianceScore: 0
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Load scans
      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.user.id)
        .gte("created_at", startDate.toISOString());

      // Load findings - simplified for demo
      const mockFindings = Array.from({ length: 50 }, () => ({
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any
      }));

      // Load monitors - simplified
      const mockMonitors = Array.from({ length: 5 }, () => ({ id: crypto.randomUUID(), enabled: true }));

      const criticalCount = mockFindings.filter(f => f.severity === 'critical').length;
      const totalFindings = mockFindings.length;

      // Calculate risk score (0-100)
      const riskScore = totalFindings > 0 
        ? Math.min(100, (criticalCount * 25) + ((totalFindings - criticalCount) * 5))
        : 0;

      // Calculate compliance score (inverse of risk)
      const complianceScore = Math.max(0, 100 - riskScore);

      setMetrics({
        totalScans: scans?.length || 0,
        totalFindings: totalFindings,
        criticalFindings: criticalCount,
        riskScore: Math.round(riskScore),
        riskTrend: -5,
        activeMonitors: mockMonitors.length,
        complianceScore: Math.round(complianceScore)
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const riskTrendData = [
    { date: 'Week 1', risk: 45, compliance: 55 },
    { date: 'Week 2', risk: 52, compliance: 48 },
    { date: 'Week 3', risk: 48, compliance: 52 },
    { date: 'Week 4', risk: 42, compliance: 58 },
  ];

  const findingsBySeverity = [
    { name: 'Critical', value: metrics.criticalFindings, color: '#ef4444' },
    { name: 'High', value: Math.floor(metrics.totalFindings * 0.3), color: '#f97316' },
    { name: 'Medium', value: Math.floor(metrics.totalFindings * 0.4), color: '#eab308' },
    { name: 'Low', value: Math.floor(metrics.totalFindings * 0.3), color: '#22c55e' },
  ];

  const threatCategories = [
    { category: 'Data Exposure', count: 24, trend: 'up' },
    { category: 'Account Security', count: 18, trend: 'down' },
    { category: 'Privacy Risk', count: 15, trend: 'up' },
    { category: 'Dark Web', count: 8, trend: 'stable' },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">Medium Risk</Badge>;
    return <Badge className="bg-green-600">Low Risk</Badge>;
  };

  return (
    <>
      <SEO 
        title="Executive Dashboard — FootprintIQ Analytics"
        description="High-level business intelligence and analytics for OSINT data. Track risk trends, compliance, and security metrics."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Executive Dashboard</h1>
              <p className="text-muted-foreground">High-level insights and analytics</p>
            </div>
            <div className="flex gap-2">
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <TabsList>
                  <TabsTrigger value="7d">7 Days</TabsTrigger>
                  <TabsTrigger value="30d">30 Days</TabsTrigger>
                  <TabsTrigger value="90d">90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                  {getRiskBadge(metrics.riskScore)}
                </div>
                <div className={`text-3xl font-bold ${getRiskColor(metrics.riskScore)}`}>
                  {metrics.riskScore}
                </div>
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                <div className="flex items-center mt-2 text-xs">
                  {metrics.riskTrend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <span>{Math.abs(metrics.riskTrend)}% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <div className="text-3xl font-bold">{metrics.criticalFindings}</div>
                <p className="text-sm text-muted-foreground">Critical Findings</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.totalFindings} total findings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Activity className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{metrics.totalScans}</div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.activeMonitors} active monitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-3xl font-bold text-green-600">{metrics.complianceScore}%</div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-xs text-muted-foreground mt-2">Above target</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Risk Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Trend Analysis</CardTitle>
                <CardDescription>Risk and compliance scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="risk" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="compliance" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Findings by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Findings by Severity</CardTitle>
                <CardDescription>Distribution of security findings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={findingsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {findingsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Threat Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Threat Categories</CardTitle>
              <CardDescription>Most common security concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatCategories.map((threat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{threat.category}</p>
                      <p className="text-sm text-muted-foreground">{threat.count} findings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {threat.trend === 'up' && <TrendingUp className="h-4 w-4 text-destructive" />}
                      {threat.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                      {threat.trend === 'stable' && <Activity className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
