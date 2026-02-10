import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

interface ProviderStats {
  provider: string;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  avgDuration: number;
  lastFailure: string | null;
  errorMessages: string[];
}

export default function ProviderHealth() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('scan_events')
        .select('provider, status, duration_ms, error_message, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!data) {
        setLoading(false);
        return;
      }

      // Group by provider
      const grouped = data.reduce((acc, event) => {
        if (!acc[event.provider]) {
          acc[event.provider] = {
            provider: event.provider,
            totalCalls: 0,
            successCalls: 0,
            failedCalls: 0,
            durations: [],
            lastFailure: null,
            errorMessages: [],
          };
        }

        acc[event.provider].totalCalls++;
        if (event.status === 'success') acc[event.provider].successCalls++;
        if (event.status === 'failed') {
          acc[event.provider].failedCalls++;
          if (event.error_message) acc[event.provider].errorMessages.push(event.error_message);
          if (!acc[event.provider].lastFailure || event.created_at > acc[event.provider].lastFailure) {
            acc[event.provider].lastFailure = event.created_at;
          }
        }
        if (event.duration_ms) acc[event.provider].durations.push(event.duration_ms);

        return acc;
      }, {} as Record<string, any>);

      const statsList = Object.values(grouped).map((p: any) => ({
        provider: p.provider,
        totalCalls: p.totalCalls,
        successCalls: p.successCalls,
        failedCalls: p.failedCalls,
        avgDuration: p.durations.length > 0 ? Math.round(p.durations.reduce((a: number, b: number) => a + b, 0) / p.durations.length) : 0,
        lastFailure: p.lastFailure,
        errorMessages: p.errorMessages.slice(0, 3),
      }));

      setStats(statsList);
      setLoading(false);
    };

    if (isAdmin) fetchStats();
  }, [isAdmin, adminLoading, navigate]);

  const getSuccessRate = (success: number, total: number) => {
    return total > 0 ? Math.round((success / total) * 100) : 0;
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse">Loading provider health...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <AdminBreadcrumb currentPage="Provider Health" />
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Provider Health</h1>
          <p className="text-muted-foreground">Monitor provider performance over the last 7 days</p>
        </div>

        <div className="grid gap-4">
          {stats.map((provider) => {
            const successRate = getSuccessRate(provider.successCalls, provider.totalCalls);

            return (
              <Card key={provider.provider}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{provider.provider}</CardTitle>
                      <CardDescription>{provider.totalCalls} calls</CardDescription>
                    </div>
                    <Badge
                      variant={successRate >= 90 ? 'default' : successRate >= 70 ? 'secondary' : 'destructive'}
                    >
                      {successRate}% success
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Success</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <p className="text-lg font-semibold">{provider.successCalls}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <p className="text-lg font-semibold">{provider.failedCalls}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <p className="text-lg font-semibold">{provider.avgDuration}ms</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Failure</p>
                      <p className="text-sm">
                        {provider.lastFailure
                          ? format(new Date(provider.lastFailure), 'MMM d, HH:mm')
                          : 'None'}
                      </p>
                    </div>
                  </div>

                  {provider.errorMessages.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Recent Errors
                      </p>
                      <ul className="space-y-1">
                        {provider.errorMessages.map((msg, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground truncate">
                            {msg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
