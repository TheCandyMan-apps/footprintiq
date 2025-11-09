import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Activity,
  Shield,
  Zap,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditResult {
  id: string;
  audit_type: string;
  status: 'success' | 'failure' | 'warning';
  component?: string;
  details: Record<string, any>;
  failure_rate?: number;
  ai_summary?: string;
  ai_priority?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  created_at: string;
  resolved_at?: string;
}

interface AuditStats {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  failureRate: number;
}

export default function SystemAudit() {
  const [isRunning, setIsRunning] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    failureRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditResults();
  }, []);

  const loadAuditResults = async () => {
    try {
      const { data, error } = await supabase
        .from('system_audit_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const results = (data || []) as AuditResult[];
      setAuditResults(results);
      calculateStats(results);
    } catch (error) {
      console.error('Failed to load audit results:', error);
      toast.error('Failed to load audit results');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results: AuditResult[]) => {
    const last24h = results.filter(r => {
      const hoursDiff = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    const passed = last24h.filter(r => r.status === 'success').length;
    const failed = last24h.filter(r => r.status === 'failure').length;
    const warnings = last24h.filter(r => r.status === 'warning').length;
    const total = last24h.length;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;

    setStats({ total, passed, failed, warnings, failureRate });
  };

  const runFullAudit = async () => {
    setIsRunning(true);
    toast.info('Starting comprehensive system audit...');

    try {
      const { data, error } = await supabase.functions.invoke('system-audit/run', {
        body: { auditType: 'full_system' }
      });

      if (error) throw error;

      toast.success('System audit completed');
      
      // Reload results
      await loadAuditResults();

      // Check failure rate and alert if needed
      if (data.failureRate > 2) {
        await sendAdminAlert(data.failureRate);
      }
    } catch (error) {
      console.error('Audit failed:', error);
      toast.error(error instanceof Error ? error.message : 'Audit failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runSpecificAudit = async (type: string) => {
    setIsRunning(true);
    toast.info(`Running ${type} audit...`);

    try {
      const { error } = await supabase.functions.invoke('system-audit/run', {
        body: { auditType: type }
      });

      if (error) throw error;

      toast.success(`${type} audit completed`);
      await loadAuditResults();
    } catch (error) {
      console.error('Audit failed:', error);
      toast.error(error instanceof Error ? error.message : 'Audit failed');
    } finally {
      setIsRunning(false);
    }
  };

  const sendAdminAlert = async (failureRate: number) => {
    try {
      const { error } = await supabase.functions.invoke('system-audit/alert', {
        body: { failureRate }
      });

      if (error) throw error;

      toast.warning(`Admin alert sent (${failureRate.toFixed(1)}% failure rate)`);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failure':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;

    return priority ? (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {priority}
      </Badge>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="System Audit | Admin"
        description="Comprehensive system health monitoring and audit logs"
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">System Audit</h1>
            <p className="text-muted-foreground">
              Comprehensive health checks and monitoring for premium launch confidence
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total Checks (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.passed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Failure Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  stats.failureRate > 2 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {stats.failureRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Threshold Warning */}
          {stats.failureRate > 2 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failure rate is above 2% threshold. Admin alert will be sent to admin@footprintiq.app
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Run Audits</CardTitle>
              <CardDescription>
                Execute comprehensive system health checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                <Button
                  onClick={() => runFullAudit()}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Full System Audit
                </Button>

                <Button
                  onClick={() => runSpecificAudit('rls_check')}
                  disabled={isRunning}
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  RLS Check
                </Button>

                <Button
                  onClick={() => runSpecificAudit('provider_health')}
                  disabled={isRunning}
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Providers
                </Button>

                <Button
                  onClick={() => runSpecificAudit('tier_sync')}
                  disabled={isRunning}
                  variant="outline"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Tier Sync
                </Button>

                <Button
                  onClick={() => runSpecificAudit('scan_flow')}
                  disabled={isRunning}
                  variant="outline"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Scan Flow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Results</CardTitle>
              <CardDescription>
                Last 50 system audit checks with AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : auditResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit results yet. Run your first audit above.
                </div>
              ) : (
                <div className="space-y-4">
                  {auditResults.map((result) => (
                    <div
                      key={result.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {result.audit_type.replace(/_/g, ' ').toUpperCase()}
                              {result.component && (
                                <Badge variant="outline">{result.component}</Badge>
                              )}
                              {getPriorityBadge(result.ai_priority)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(result.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {result.failure_rate !== undefined && (
                          <Badge variant={result.failure_rate > 5 ? 'destructive' : 'secondary'}>
                            {result.failure_rate.toFixed(1)}% failure
                          </Badge>
                        )}
                      </div>

                      {result.ai_summary && (
                        <div className="bg-muted/50 rounded p-3 text-sm">
                          <div className="font-medium mb-1">AI Analysis:</div>
                          <p className="text-muted-foreground">{result.ai_summary}</p>
                        </div>
                      )}

                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Recommendations:</div>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Object.keys(result.details).length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
