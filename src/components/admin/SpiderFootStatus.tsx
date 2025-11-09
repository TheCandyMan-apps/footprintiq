import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SpiderFootHealth {
  status: 'ok' | 'not_configured' | 'unreachable';
  configured: boolean;
  url?: string;
  has_api_key?: boolean;
  reachable?: boolean;
  message: string;
  error?: string;
  http_status?: number;
}

export function SpiderFootStatus() {
  const [health, setHealth] = useState<SpiderFootHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('spiderfoot-health');
      
      if (error) {
        console.error('[SpiderFootStatus] Error checking health:', error);
        toast.error('Failed to check SpiderFoot status');
        setHealth({
          status: 'not_configured',
          configured: false,
          message: 'Failed to check status'
        });
        return;
      }

      setHealth(data as SpiderFootHealth);
      
      if (data.status === 'ok') {
        toast.success('SpiderFoot is configured and reachable');
      } else if (data.status === 'not_configured') {
        toast.warning('SpiderFoot is not configured');
      } else {
        toast.error('SpiderFoot is configured but unreachable');
      }
    } catch (err) {
      console.error('[SpiderFootStatus] Exception:', err);
      setHealth({
        status: 'not_configured',
        configured: false,
        message: 'Error checking SpiderFoot status'
      });
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = () => {
    if (!health) return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    
    switch (health.status) {
      case 'ok':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'not_configured':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'unreachable':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (!health) {
      return <Badge variant="outline">Checking...</Badge>;
    }

    switch (health.status) {
      case 'ok':
        return <Badge variant="default" className="bg-green-500">🟢 Ready</Badge>;
      case 'not_configured':
        return <Badge variant="destructive">🔴 Not Configured</Badge>;
      case 'unreachable':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">🟡 Unreachable</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">SpiderFoot OSINT</h3>
              <p className="text-sm text-muted-foreground">
                200+ module reconnaissance engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={checking || loading}
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading && (
          <Alert>
            <AlertDescription>
              Checking SpiderFoot configuration...
            </AlertDescription>
          </Alert>
        )}

        {health && !loading && (
          <>
            <Alert className={
              health.status === 'ok' 
                ? 'border-green-500 bg-green-500/5' 
                : health.status === 'not_configured'
                ? 'border-red-500 bg-red-500/5'
                : 'border-yellow-500 bg-yellow-500/5'
            }>
              <div className="flex items-start gap-2">
                {getStatusIcon()}
                <AlertDescription className="flex-1">
                  <div className="space-y-2">
                    <p className="font-medium">{health.message}</p>
                    
                    {health.configured && (
                      <div className="text-xs space-y-1 text-muted-foreground">
                        {health.url && (
                          <p>URL: <code className="bg-muted px-1 rounded">{health.url}</code></p>
                        )}
                        <p>API Key: {health.has_api_key ? '✓ Configured' : '✗ Not set'}</p>
                        {health.reachable !== undefined && (
                          <p>Reachable: {health.reachable ? '✓ Yes' : '✗ No'}</p>
                        )}
                        {health.http_status && (
                          <p>HTTP Status: {health.http_status}</p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>

            {health.status !== 'ok' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/docs/spiderfoot-setup', '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Setup Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = 'mailto:admin@footprintiq.app?subject=SpiderFoot Configuration Help'}
                  className="flex-1"
                >
                  Contact Support
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
