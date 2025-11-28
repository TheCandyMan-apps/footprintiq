import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdminNav } from '@/components/admin/AdminNav';
import { 
  Activity, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { flags } from '@/lib/featureFlags';

export default function OpsConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [providerHealth, setProviderHealth] = useState<any[]>([]);
  const [creditBurn, setCreditBurn] = useState<any[]>([]);
  const [scanFailures, setScanFailures] = useState<any[]>([]);

  useEffect(() => {
    if (!flags.adminOpsV2) {
      navigate('/admin/dashboard');
      return;
    }
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    await fetchOpsData();
  };

  const fetchOpsData = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: events } = await supabase
        .from('scan_events')
        .select('provider, status, duration_ms, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('stage', 'completed');

      if (events) {
        const providerStats = events.reduce((acc: any, event) => {
          if (!acc[event.provider]) {
            acc[event.provider] = {
              provider: event.provider,
              total: 0,
              success: 0,
              failed: 0,
              totalDuration: 0,
              avgDuration: 0,
              successRate: 0
            };
          }

          acc[event.provider].total++;
          if (event.status === 'success') {
            acc[event.provider].success++;
          } else {
            acc[event.provider].failed++;
          }
          acc[event.provider].totalDuration += event.duration_ms || 0;

          return acc;
        }, {});

        const healthData = Object.values(providerStats).map((stat: any) => ({
          ...stat,
          avgDuration: Math.round(stat.totalDuration / stat.total),
          successRate: Math.round((stat.success / stat.total) * 100)
        })).sort((a: any, b: any) => b.total - a.total);

        setProviderHealth(healthData);
      }

      const { data: ledger } = await supabase
        .from('credits_ledger')
        .select('workspace_id, delta, reason, created_at')
        .lt('delta', 0)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (ledger) {
        const workspaceBurn = ledger.reduce((acc: any, entry) => {
          if (!acc[entry.workspace_id]) {
            acc[entry.workspace_id] = {
              workspace_id: entry.workspace_id,
              totalSpent: 0,
              scanCount: 0
            };
          }

          acc[entry.workspace_id].totalSpent += Math.abs(entry.delta);
          if (entry.reason === 'scan') {
            acc[entry.workspace_id].scanCount++;
          }

          return acc;
        }, {});

        const workspaceIds = Object.keys(workspaceBurn);
        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id, name')
          .in('id', workspaceIds);

        const burnData = Object.values(workspaceBurn).map((burn: any) => ({
          ...burn,
          name: workspaces?.find(w => w.id === burn.workspace_id)?.name || 'Unknown'
        })).sort((a: any, b: any) => b.totalSpent - a.totalSpent).slice(0, 10);

        setCreditBurn(burnData);
      }

      const { data: failures } = await supabase
        .from('scan_events')
        .select('provider, error_message, created_at')
        .eq('status', 'failed')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (failures) {
        const failureReasons = failures.reduce((acc: any, failure) => {
          const reason = failure.error_message || 'Unknown error';
          if (!acc[reason]) {
            acc[reason] = {
              reason,
              count: 0,
              providers: new Set()
            };
          }

          acc[reason].count++;
          acc[reason].providers.add(failure.provider);

          return acc;
        }, {});

        const failureData = Object.values(failureReasons).map((f: any) => ({
          reason: f.reason,
          count: f.count,
          providers: Array.from(f.providers).join(', ')
        })).sort((a: any, b: any) => b.count - a.count).slice(0, 10);

        setScanFailures(failureData);
      }

    } catch (error) {
      console.error('Error fetching ops data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ops console data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    toast({ title: 'Refreshing...', description: 'Fetching latest data' });
    fetchOpsData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <AdminNav />
            </aside>
            <div className="flex-1 animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <AdminNav />
          </aside>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Ops Console v2</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time operational intelligence (Last 7 days)
                </p>
              </div>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Tabs defaultValue="providers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="providers">
                  <Activity className="h-4 w-4 mr-2" />
                  Provider Health
                </TabsTrigger>
                <TabsTrigger value="credits">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Credit Burn
                </TabsTrigger>
                <TabsTrigger value="failures">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Failure Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="providers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Reliability</CardTitle>
                    <CardDescription>
                      Success rates, average duration, and call volumes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {providerHealth.map((provider, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold">{provider.provider}</div>
                            <div className="text-sm text-muted-foreground">
                              {provider.total} calls • {provider.avgDuration}ms avg
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={provider.successRate >= 95 ? 'default' : provider.successRate >= 80 ? 'secondary' : 'destructive'}>
                              {provider.successRate}% success
                            </Badge>
                            {provider.successRate >= 95 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : provider.successRate >= 80 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Credit Consumers</CardTitle>
                    <CardDescription>
                      Workspaces with highest credit burn rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {creditBurn.map((workspace, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold">{workspace.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {workspace.scanCount} scans
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-lg">
                            {workspace.totalSpent} credits
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="failures" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scan Failure Reasons</CardTitle>
                    <CardDescription>
                      Most common failure reasons and affected providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scanFailures.map((failure, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-sm">{failure.reason}</div>
                            <Badge variant="destructive">{failure.count}x</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Providers: {failure.providers}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Provider Kill Switches
                </CardTitle>
                <CardDescription>
                  To disable a provider, set DISABLED_PROVIDERS env variable in Supabase dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    Current implementation uses environment variables for kill switches.
                    To disable a provider, update the <code>DISABLED_PROVIDERS</code> environment
                    variable in your Supabase project settings (comma-separated list).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Example: <code>DISABLED_PROVIDERS=gosearch,holehe,predicta</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
