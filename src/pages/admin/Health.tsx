import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { PROVIDER_META, getProvidersByCategory } from "@/providers/registry.meta";
import { Activity, AlertTriangle, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  quota: number;
  breaker: boolean;
  lastCheck: string;
}

interface SecretHealth {
  key: string;
  expiresInDays: number | null;
  status: 'valid' | 'expiring' | 'expired';
}

export default function Health() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [secrets, setSecrets] = useState<SecretHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      // Fetch provider health from edge function
      const { data: healthData } = await supabase.functions.invoke('health', {
        body: { check: 'providers' }
      });

      if (healthData) {
        // Map provider metadata to health status
        const providerHealth: ProviderHealth[] = PROVIDER_META.map(meta => ({
          provider: meta.id,
          status: healthData.breakersOpen?.[meta.id]?.open ? 'down' : 'healthy',
          latency: Math.random() * 500, // TODO: Get actual latency from metrics
          quota: Math.floor(Math.random() * 100),
          breaker: healthData.breakersOpen?.[meta.id]?.open || false,
          lastCheck: new Date().toISOString(),
        }));
        setProviders(providerHealth);

        // Mock secret health - in production, fetch from secure endpoint
        const secretHealth: SecretHealth[] = [
          { key: 'HIBP_API_KEY', expiresInDays: null, status: 'valid' },
          { key: 'VIRUSTOTAL_API_KEY', expiresInDays: 45, status: 'valid' },
          { key: 'CENSYS_API_KEY', expiresInDays: 15, status: 'expiring' },
        ];
        setSecrets(secretHealth);
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'valid':
        return 'default';
      case 'degraded':
      case 'expiring':
        return 'secondary';
      case 'down':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'valid':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
      case 'expiring':
        return <AlertTriangle className="h-4 w-4" />;
      case 'down':
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const healthyCount = providers.filter(p => p.status === 'healthy').length;
  const degradedCount = providers.filter(p => p.status === 'degraded').length;
  const downCount = providers.filter(p => p.status === 'down').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBreadcrumb currentPage="System Health" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Provider status, latency, and secret expiry monitoring</p>
        </div>
        <Badge variant={downCount > 0 ? 'destructive' : 'default'} className="text-sm">
          <Activity className="h-4 w-4 mr-2" />
          {healthyCount}/{providers.length} Operational
        </Badge>
      </div>

      {/* Overall Status Alert */}
      {downCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {downCount} provider{downCount > 1 ? 's are' : ' is'} currently down or experiencing circuit breaker protection.
          </AlertDescription>
        </Alert>
      )}

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold">{healthyCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Degraded</p>
              <p className="text-2xl font-bold">{degradedCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Down</p>
              <p className="text-2xl font-bold">{downCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Latency</p>
              <p className="text-2xl font-bold">
                {Math.round(providers.reduce((sum, p) => sum + p.latency, 0) / providers.length)}ms
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Provider Health Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Provider Status
          </h2>
          <div className="space-y-2">
            {getProvidersByCategory('breach').length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mt-4">Breach Detection</h3>
                {getProvidersByCategory('breach').map(meta => {
                  const health = providers.find(p => p.provider === meta.id);
                  return health && (
                    <div key={meta.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(health.status)}
                        <div>
                          <p className="font-medium">{meta.title}</p>
                          <p className="text-sm text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Latency</p>
                          <p className="font-medium">{Math.round(health.latency)}ms</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Quota</p>
                          <p className="font-medium">{health.quota}%</p>
                        </div>
                        <Badge variant={getStatusColor(health.status)}>
                          {health.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {getProvidersByCategory('asset').length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mt-4">Asset Discovery</h3>
                {getProvidersByCategory('asset').map(meta => {
                  const health = providers.find(p => p.provider === meta.id);
                  return health && (
                    <div key={meta.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(health.status)}
                        <div>
                          <p className="font-medium">{meta.title}</p>
                          <p className="text-sm text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Latency</p>
                          <p className="font-medium">{Math.round(health.latency)}ms</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Quota</p>
                          <p className="font-medium">{health.quota}%</p>
                        </div>
                        <Badge variant={getStatusColor(health.status)}>
                          {health.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {getProvidersByCategory('threat').length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mt-4">Threat Intelligence</h3>
                {getProvidersByCategory('threat').map(meta => {
                  const health = providers.find(p => p.provider === meta.id);
                  return health && (
                    <div key={meta.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(health.status)}
                        <div>
                          <p className="font-medium">{meta.title}</p>
                          <p className="text-sm text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Latency</p>
                          <p className="font-medium">{Math.round(health.latency)}ms</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Quota</p>
                          <p className="font-medium">{health.quota}%</p>
                        </div>
                        <Badge variant={getStatusColor(health.status)}>
                          {health.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Secret Expiry Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Key Health
          </h2>
          <div className="space-y-2">
            {secrets.map(secret => (
              <div key={secret.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(secret.status)}
                  <p className="font-medium font-mono text-sm">{secret.key}</p>
                </div>
                <div className="flex items-center gap-4">
                  {secret.expiresInDays !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Expires in {secret.expiresInDays} days
                    </div>
                  )}
                  <Badge variant={getStatusColor(secret.status)}>
                    {secret.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
