import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Server, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticCheck {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
}

interface SystemDiagnostics {
  overall: 'ok' | 'degraded' | 'error';
  timestamp: string;
  checks: DiagnosticCheck[];
  version: string;
}

export function SystemHealth() {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-diagnostics');
      
      if (error) throw error;
      setDiagnostics(data);
    } catch (error: any) {
      toast({
        title: 'Diagnostic Error',
        description: error.message || 'Failed to run system diagnostics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500/10 text-green-500';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'error':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCheckIcon = (name: string) => {
    switch (name) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'maigret_worker':
      case 'sherlock_worker':
        return <Server className="w-5 h-5" />;
      case 'osint_worker':
        return <Server className="w-5 h-5 text-primary" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatCheckName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time service monitoring</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={loading}
            aria-label="Refresh system diagnostics"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !diagnostics ? (
          <div className="text-center py-12 text-muted-foreground">
            Running diagnostics...
          </div>
        ) : diagnostics ? (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.overall)}
                <div>
                  <h4 className="font-medium">Overall Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {new Date(diagnostics.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(diagnostics.overall)} variant="outline">
                {diagnostics.overall.toUpperCase()}
              </Badge>
            </div>

            {/* Individual Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnostics.checks.map(check => (
                <Card key={check.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getCheckIcon(check.name)}
                        <div>
                          <h5 className="font-medium">{formatCheckName(check.name)}</h5>
                          {check.responseTime && (
                            <p className="text-xs text-muted-foreground">
                              {check.responseTime}ms
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(check.status)} variant="outline">
                        {check.status}
                      </Badge>
                    </div>
                    {check.message && (
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No diagnostic data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}