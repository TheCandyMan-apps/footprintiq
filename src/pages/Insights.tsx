import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, AlertTriangle, Users, Globe, Target, 
  Activity, Shield, Download 
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#ffc658', '#ff7c7c'];

export default function Insights() {
  const [intelData, setIntelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [aiInsights, setAiInsights] = useState<string>('');

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true);

      // Fetch cached intelligence summary
      const { data, error } = await supabase.functions.invoke('intel-summary');

      if (error) throw error;

      setIntelData(data.data);

      // Generate AI narrative
      generateAIInsights(data.data);

    } catch (error) {
      console.error('Error fetching intelligence data:', error);
      toast.error('Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (data: any) => {
    try {
      const narrative = `Based on the latest intelligence analysis:
      
• Risk Index: ${data.riskIndex}/100 (${data.trends.riskIndexChange} from last week)
• Total Findings: ${data.statistics.totalFindings} (${data.trends.findingsChange})
• Critical Threats: ${data.statistics.criticalThreats}

Key Observations:
- Threat activity has ${data.trends.findingsChange.startsWith('+') ? 'increased' : 'decreased'} over the past 7 days
- ${data.statistics.criticalFindings} critical findings require immediate attention
- Anomaly detection identified ${data.statistics.totalAnomalies} irregular patterns`;

      setAiInsights(narrative);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  const threatsByType = intelData?.statistics.threatsByType 
    ? Object.entries(intelData.statistics.threatsByType).map(([name, value]) => ({ 
        name, 
        value: value as number 
      }))
    : [];

  const findingsByType = intelData?.statistics.findingsByType
    ? Object.entries(intelData.statistics.findingsByType).map(([name, value]) => ({ 
        name, 
        value: value as number 
      }))
    : [];

  const dailyTrend = intelData?.statistics.findingsByDay
    ? Object.entries(intelData.statistics.findingsByDay).map(([date, count]) => ({
        date,
        findings: count as number,
      }))
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intelligence Insights</h1>
          <p className="text-muted-foreground">Commercial intelligence suite & analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="us">North America</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
              <SelectItem value="apac">Asia Pacific</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intelData?.riskIndex || 0}</div>
            <p className="text-xs text-muted-foreground">{intelData?.trends.riskIndexChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {intelData?.statistics.criticalThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {intelData?.statistics.totalFindings || 0}
            </div>
            <p className="text-xs text-muted-foreground">{intelData?.trends.findingsChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {intelData?.statistics.totalAnomalies || 0}
            </div>
            <p className="text-xs text-muted-foreground">{intelData?.trends.anomaliesChange}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-mono">{aiInsights}</pre>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Trend</CardTitle>
              <CardDescription>Daily finding volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="findings" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Threat Distribution</CardTitle>
              <CardDescription>By threat type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={threatsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {threatsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Findings by Type</CardTitle>
              <CardDescription>Distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={findingsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Regional Risk Heatmap</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Regional heatmap visualization will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}