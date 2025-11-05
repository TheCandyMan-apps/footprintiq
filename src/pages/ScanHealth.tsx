import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Zap
} from "lucide-react";

export default function ScanHealth() {
  const [healthData, setHealthData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-health');
      if (error) throw error;
      setHealthData(data);
      console.log('Health data:', data);
    } catch (error) {
      console.error('Health check error:', error);
      toast.error('Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  const runTestScan = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-scan');
      if (error) throw error;
      setTestResults(data);
      toast.success('Test scan completed');
      console.log('Test results:', data);
    } catch (error) {
      console.error('Test scan error:', error);
      toast.error('Test scan failed');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const StatusIcon = ({ enabled }: { enabled: boolean }) => 
    enabled ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-destructive" />
    );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="System Health — FootprintIQ"
        description="Check system health and test scan functionality"
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">System Health</h1>
              <p className="text-muted-foreground">
                Monitor provider configuration and test scan functionality
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchHealth} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={runTestScan} disabled={testing} variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                {testing ? 'Testing...' : 'Run Test Scan'}
              </Button>
            </div>
          </div>

          {healthData && (
            <>
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Overall Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {healthData.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Last checked: {new Date(healthData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Core Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Services</CardTitle>
                  <CardDescription>Essential environment configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Supabase URL</span>
                      <StatusIcon enabled={healthData.environment.core.supabaseUrl} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Supabase Anon Key</span>
                      <StatusIcon enabled={healthData.environment.core.supabaseAnonKey} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Service Role Key</span>
                      <StatusIcon enabled={healthData.environment.core.supabaseServiceKey} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cache Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Cache System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Upstash Configured</span>
                      <StatusIcon enabled={healthData.cache.configured} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Cache Healthy</span>
                      <StatusIcon enabled={healthData.cache.healthy} />
                    </div>
                    {!healthData.cache.healthy && (
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <p className="text-sm text-warning flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Cache is not responding. Scans will work but may be slower.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Provider Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Provider Configuration</CardTitle>
                  <CardDescription>
                    {healthData.providers.enabled.length} of {Object.keys(healthData.environment.providers).length} providers configured
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(healthData.environment.providers).map(([name, enabled]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium capitalize">{name}</span>
                        <StatusIcon enabled={enabled as boolean} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Supported Providers & Defaults */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {healthData.providers.supported.map((provider: string) => (
                        <Badge key={provider} variant="outline">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default Providers by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(healthData.providers.defaults).map(([type, providers]) => (
                      <div key={type} className="space-y-1">
                        <div className="font-medium capitalize text-sm">{type}:</div>
                        <div className="flex flex-wrap gap-1">
                          {(providers as string[]).map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Test Scan Results
                </CardTitle>
                <CardDescription>
                  Test completed at {new Date(testResults.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>Test Target:</strong> {testResults.testTarget}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium mb-2">HIBP Results:</p>
                      <p className="text-sm text-muted-foreground">
                        Findings: {testResults.summary.hibpFindings}
                      </p>
                      {testResults.results.hibp?.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {testResults.results.hibp.note}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">DeHashed Results:</p>
                      <p className="text-sm text-muted-foreground">
                        Findings: {testResults.summary.dehashedFindings}
                      </p>
                      {testResults.results.dehashed?.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {testResults.results.dehashed.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
