import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { DataVerificationPanel } from '@/components/admin/DataVerificationPanel';
import { 
  Activity, Database, Users, TrendingUp, AlertCircle, 
  Clock, Shield, Download, RefreshCw 
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  totalScans: number;
  activeUsers: number;
  scanBreakdown: Record<string, number>;
  providerSuccessRates: Array<{ provider: string; findingsCount: number; scansWithFindings: number }>;
  avgCompletionTimeMs: number;
  topErrors: Array<{ code: string; count: number }>;
  riskDistribution: Record<string, number>;
  dateRange: { start: string; end: string; days: number };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function IntelligenceDashboard() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin, days]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { days: parseInt(days) }
      });

      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted/50 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted/50 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const scanTypeData = metrics?.scanBreakdown 
    ? Object.entries(metrics.scanBreakdown).map(([type, count]) => ({
        name: type,
        value: count
      }))
    : [];

  const riskData = metrics?.riskDistribution
    ? Object.entries(metrics.riskDistribution)
        .map(([severity, count]) => ({
          name: severity,
          value: count,
          color: severity === 'critical' ? 'hsl(var(--destructive))' :
                 severity === 'high' ? 'hsl(20, 90%, 50%)' :
                 severity === 'medium' ? 'hsl(45, 90%, 50%)' :
                 'hsl(200, 80%, 50%)'
        }))
        .filter(item => item.value > 0)
    : [];
  
  // If only one category has data, add a tiny placeholder for proper pie rendering
  const riskChartData = riskData.length === 1 && riskData[0].value > 0
    ? [...riskData, { name: 'No Other Risks', value: 0.1, color: 'hsl(var(--muted))' }]
    : riskData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              Intelligence Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Real-time platform analytics and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Select time period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadMetrics}
              variant="outline"
              size="icon"
              disabled={loading}
              aria-label="Refresh metrics"
              className="transition-transform hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="transition-all hover:shadow-lg hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  <Database className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" aria-label={`${metrics.totalScans} total scans`}>
                    {metrics.totalScans.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last {days} days</p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" aria-label={`${metrics.activeUsers} active users`}>
                    {metrics.activeUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Unique users scanning</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics.avgCompletionTimeMs / 1000 / 60).toFixed(1)}m
                  </div>
                  <p className="text-xs text-muted-foreground">Average scan time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Errors</CardTitle>
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.topErrors.length}</div>
                  <p className="text-xs text-muted-foreground">Unique error types</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scan Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Scan Type Distribution</CardTitle>
                  <CardDescription>Breakdown by scan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={scanTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {scanTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Findings by severity level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => name !== 'No Other Risks' ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                        innerRadius={25}
                        outerRadius={80}
                        paddingAngle={4}
                        stroke="white"
                        strokeWidth={2}
                        dataKey="value"
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Provider Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>Success rates by OSINT provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.providerSuccessRates.map((provider) => (
                    <div key={provider.provider} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{provider.provider}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {provider.findingsCount.toLocaleString()} findings
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {provider.scansWithFindings} scans
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Error Codes</CardTitle>
                <CardDescription>Most frequent system errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topErrors.slice(0, 10).map((error) => (
                    <div key={error.code} className="flex items-center justify-between">
                      <code className="text-sm">{error.code}</code>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No metrics available</p>
            </CardContent>
          </Card>
        )}

        {/* Data Verification Panel - Always visible for admin */}
        {!loading && (
          <div className="mt-6">
            <DataVerificationPanel />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
