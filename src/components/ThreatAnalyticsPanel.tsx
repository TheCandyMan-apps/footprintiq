import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertTriangle, Shield, Activity } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Scan = Database['public']['Tables']['scans']['Row'];

interface SeverityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatTypeStats {
  name: string;
  count: number;
}

interface TrendData {
  date: string;
  threats: number;
  scans: number;
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const ThreatAnalyticsPanel = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityStats, setSeverityStats] = useState<SeverityStats>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [threatTypes, setThreatTypes] = useState<ThreatTypeStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days);

      const { data: scansData, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (scansData) {
        setScans(scansData);
        calculateSeverityStats(scansData);
        calculateThreatTypes(scansData);
        calculateTrends(scansData, days);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSeverityStats = (scans: Scan[]) => {
    const stats: SeverityStats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    scans.forEach(scan => {
      const highRisk = scan.high_risk_count || 0;
      if (highRisk > 10) {
        stats.critical++;
      } else if (highRisk > 5) {
        stats.high++;
      } else if (highRisk > 0) {
        stats.medium++;
      } else {
        stats.low++;
      }
    });

    setSeverityStats(stats);
  };

  const calculateThreatTypes = (scans: Scan[]) => {
    const typeCounts: Record<string, number> = {};

    scans.forEach(scan => {
      const type = scan.scan_type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const types = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setThreatTypes(types);
  };

  const calculateTrends = (scans: Scan[], days: number) => {
    const trends: Record<string, { threats: number; scans: number }> = {};

    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = format(startOfDay(subDays(new Date(), i)), 'MMM dd');
      trends[date] = { threats: 0, scans: 0 };
    }

    // Populate with data
    scans.forEach(scan => {
      const date = format(startOfDay(new Date(scan.created_at)), 'MMM dd');
      if (trends[date]) {
        trends[date].scans++;
        trends[date].threats += scan.high_risk_count || 0;
      }
    });

    const trendArray = Object.entries(trends).map(([date, data]) => ({
      date,
      threats: data.threats,
      scans: data.scans,
    }));

    setTrendData(trendArray);
  };

  const severityChartData = [
    { name: 'Critical', value: severityStats.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: severityStats.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: severityStats.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: severityStats.low, color: SEVERITY_COLORS.low },
  ];

  const totalAlerts = severityStats.critical + severityStats.high + severityStats.medium + severityStats.low;
  const totalThreats = scans.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0);
  const averageThreatsPerScan = scans.length > 0 ? (totalThreats / scans.length).toFixed(1) : '0';

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Threat Analytics
            </CardTitle>
            <CardDescription>
              Security insights and trends from your scans
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={timeRange === '7d' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Badge>
            <Badge
              variant={timeRange === '30d' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </Badge>
            <Badge
              variant={timeRange === '90d' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange('90d')}
            >
              90 Days
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading analytics...
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="severity">Severity</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Scans</p>
                        <p className="text-3xl font-bold">{scans.length}</p>
                      </div>
                      <Shield className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Threats</p>
                        <p className="text-3xl font-bold text-destructive">{totalThreats}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg per Scan</p>
                        <p className="text-3xl font-bold">{averageThreatsPerScan}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-accent opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Critical Alerts</p>
                        <p className="text-3xl font-bold text-destructive">
                          {severityStats.critical}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Threat Types */}
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">Most Common Scan Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={threatTypes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="severity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Severity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={severityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ percent }) =>
                            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                          }
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {severityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom"
                          height={36}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Severity Breakdown */}
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Severity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {severityChartData.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${totalAlerts > 0 ? (item.value / totalAlerts) * 100 : 0}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">Threat Detection Over Time</CardTitle>
                  <CardDescription>
                    Daily scan activity and threat discoveries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="threats"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--destructive))' }}
                        name="Threats Detected"
                      />
                      <Line
                        type="monotone"
                        dataKey="scans"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Scans Run"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
