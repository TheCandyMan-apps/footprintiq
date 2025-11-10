import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unreachable' | 'unknown';
  workerUrl?: string;
  statusCode?: number;
  response?: string;
  error?: string;
  errorType?: string;
  tokenConfigured?: boolean;
}

export function MaigretDebugPanel() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('maigret-health-check');
      
      if (error) {
        setHealth({
          status: 'unreachable',
          error: error.message,
        });
        toast.error('Health check failed', {
          description: error.message,
        });
        return;
      }

      setHealth(data);
      
      const statusMessages = {
        healthy: 'Worker is responding normally',
        unhealthy: 'Worker returned an error',
        unreachable: 'Worker is unreachable',
      };
      
      if (data.status === 'healthy') {
        toast.success('Worker Healthy', {
          description: statusMessages.healthy,
        });
      } else {
        toast.warning('Worker Issue Detected', {
          description: statusMessages[data.status as keyof typeof statusMessages] || 'Unknown status',
        });
      }
    } catch (err: any) {
      setHealth({
        status: 'unreachable',
        error: err.message,
      });
      toast.error('Network error', {
        description: err.message,
      });
    } finally {
      setChecking(false);
    }
  };

  const loadRecentResults = async () => {
    setLoadingResults(true);
    const { data, error } = await supabase
      .from('maigret_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      toast.error('Failed to load results', {
        description: error.message,
      });
    } else {
      setRecentResults(data || []);
    }
    setLoadingResults(false);
  };

  useEffect(() => {
    loadRecentResults();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      healthy: { icon: CheckCircle, variant: 'default' as const },
      unhealthy: { icon: AlertTriangle, variant: 'secondary' as const },
      unreachable: { icon: XCircle, variant: 'destructive' as const },
      unknown: { icon: AlertTriangle, variant: 'outline' as const },
    }[status] || { icon: AlertTriangle, variant: 'outline' as const };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-4 w-4 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Worker Health Check</CardTitle>
          <CardDescription>Test the Maigret worker connectivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkHealth} disabled={checking} className="w-full">
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Run Health Check'
            )}
          </Button>

          {health && (
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex items-center justify-between">
                <strong>Status:</strong>
                <StatusBadge status={health.status} />
              </div>
              {health.workerUrl && (
                <div>
                  <strong>Worker URL:</strong> 
                  <span className="ml-2 font-mono text-xs">{health.workerUrl}</span>
                </div>
              )}
              {health.statusCode && (
                <div>
                  <strong>HTTP Status:</strong> {health.statusCode}
                </div>
              )}
              {health.tokenConfigured !== undefined && (
                <div>
                  <strong>Token:</strong> {health.tokenConfigured ? '✓ Configured' : '✗ Missing'}
                </div>
              )}
              {health.error && (
                <div className="text-destructive">
                  <strong>Error:</strong> {health.error}
                </div>
              )}
              {health.response && (
                <div>
                  <strong>Response:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {health.response}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Last 5 scan results</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRecentResults} disabled={loadingResults}>
              {loadingResults ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results yet</p>
          ) : (
            <div className="space-y-2">
              {recentResults.map((result) => (
                <div key={result.id} className="border-b pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{result.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Job: {result.job_id}
                      </div>
                    </div>
                    <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                      {result.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(result.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
