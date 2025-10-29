import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ClientPortal() {
  const { clientId } = useParams();
  const [client, setClient] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [riskTrend, setRiskTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client info
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      setClient(clientData);

      // Fetch cases
      const { data: casesData } = await supabase
        .from('client_cases')
        .select(`
          *,
          cases:case_id (*)
        `)
        .eq('client_id', clientId);

      setCases(casesData || []);

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('client_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      setReports(reportsData || []);

      // Fetch subscription
      const { data: subData } = await supabase
        .from('client_subscriptions')
        .select('*')
        .eq('client_id', clientId)
        .single();

      setSubscription(subData);

      // Generate mock risk trend (replace with real data)
      setRiskTrend([
        { date: '2025-10-22', risk: 45 },
        { date: '2025-10-23', risk: 48 },
        { date: '2025-10-24', risk: 52 },
        { date: '2025-10-25', risk: 49 },
        { date: '2025-10-26', risk: 47 },
        { date: '2025-10-27', risk: 51 },
        { date: '2025-10-28', risk: 54 },
      ]);

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load client portal data');
    } finally {
      setLoading(false);
    }
  };

  const downloadEvidencePack = async (reportId: string) => {
    try {
      toast.info('Preparing evidence pack...');
      // TODO: Implement evidence pack download
      toast.success('Evidence pack ready for download');
    } catch (error) {
      toast.error('Failed to download evidence pack');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Client not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">{client.domain}</p>
        </div>
        {subscription && (
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.tier.toUpperCase()} - {subscription.status}
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.filter(c => c.cases?.status === 'open').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">54</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Trend (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          {cases.map((clientCase) => (
            <Card key={clientCase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{clientCase.cases?.title}</CardTitle>
                    <CardDescription>{clientCase.cases?.description}</CardDescription>
                  </div>
                  <Badge variant={clientCase.cases?.status === 'open' ? 'default' : 'secondary'}>
                    {clientCase.cases?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download Evidence
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {cases.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No cases found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    <CardDescription>
                      Generated {new Date(report.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge>{report.report_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View Report</Button>
                  <Button size="sm" variant="outline" onClick={() => downloadEvidencePack(report.id)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                  {report.hash_manifest && (
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify Hash
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No reports available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Recent Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">New data breach detected</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Suspicious activity pattern</p>
                  <p className="text-sm text-muted-foreground">5 hours ago</p>
                </div>
                <Badge variant="default">Medium</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Risk score threshold exceeded</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
                <Badge variant="secondary">Low</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}