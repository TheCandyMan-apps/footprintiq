import { WorkerHealthDashboard } from '@/components/monitoring/WorkerHealthDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Database, Cloud } from 'lucide-react';

export default function SystemStatus() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">System Status</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of all FootprintIQ services and infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Services</div>
            <p className="text-xs text-muted-foreground">
              Username, Recon-ng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              Online
              <Badge variant="default" className="text-xs">Healthy</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Supabase PostgreSQL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              Active
              <Badge variant="default" className="text-xs">Ready</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Deno Runtime
            </p>
          </CardContent>
        </Card>
      </div>

      <WorkerHealthDashboard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>Environment and configuration details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Environment</div>
              <div className="text-lg font-semibold">Production</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Region</div>
              <div className="text-lg font-semibold">Global</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">API Version</div>
              <div className="text-lg font-semibold">v1.0.0</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Uptime</div>
              <div className="text-lg font-semibold text-success">99.9%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
