import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { AdminNav } from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ScanStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  avgDurationMs: number | null;
  successRate: number;
}

interface StageFailure {
  stage: string;
  count: number;
}

interface RecentScan {
  scan_id: string;
  state: string;
  last_stage: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_code: string | null;
  latency_ms_total: number | null;
  created_at: string;
}

interface OpsAlert {
  id: string;
  title: string;
  severity: string;
  message: string;
  created_at: string;
  acknowledged_at: string | null;
}

export default function OpsOverview() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [stageFailures, setStageFailures] = useState<StageFailure[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [alerts, setAlerts] = useState<OpsAlert[]>([]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate('/dashboard');
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchStageFailures(), fetchRecentScans(), fetchAlerts()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await (supabase as any)
      .from('scan_health')
      .select('state, latency_ms_total')
      .gte('created_at', since);

    if (error || !data) { setStats(null); return; }

    const total = data.length;
    const completed = data.filter((s: any) => s.state === 'completed').length;
    const failed = data.filter((s: any) => s.state === 'failed').length;
    const running = data.filter((s: any) => s.state === 'running' || s.state === 'pending').length;
    const durations = data.filter((s: any) => s.latency_ms_total != null).map((s: any) => s.latency_ms_total);
    const avgDurationMs = durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length) : null;

    setStats({
      total,
      completed,
      failed,
      running,
      avgDurationMs,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  };

  const fetchStageFailures = async () => {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data } = await (supabase as any)
      .from('scan_events')
      .select('stage')
      .eq('status', 'failed')
      .gte('created_at', since);

    if (!data) { setStageFailures([]); return; }

    const counts: Record<string, number> = {};
    data.forEach((e: any) => { counts[e.stage] = (counts[e.stage] || 0) + 1; });
    setStageFailures(Object.entries(counts).map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count));
  };

  const fetchRecentScans = async () => {
    const { data } = await (supabase as any)
      .from('scan_health')
      .select('scan_id, state, last_stage, started_at, completed_at, error_code, latency_ms_total, created_at')
      .order('created_at', { ascending: false })
      .limit(25);

    setRecentScans(data || []);
  };

  const fetchAlerts = async () => {
    const { data } = await (supabase as any)
      .from('ops_alerts')
      .select('id, severity, type, message, created_at, resolved_at')
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    setAlerts((data || []).map((a: any) => ({ ...a, title: a.type, acknowledged_at: a.resolved_at })));
  };

  const stateColor = (state: string) => {
    switch (state) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'running': return 'secondary';
      default: return 'outline';
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6">
        <div className="hidden lg:block w-64 shrink-0">
          <AdminNav />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ops Dashboard</h1>
              <p className="text-muted-foreground text-sm">Last 60 minutes · scan pipeline health</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* KPI cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard icon={Activity} label="Total Scans" value={stats.total} />
              <KpiCard icon={CheckCircle} label="Success Rate" value={`${stats.successRate}%`} />
              <KpiCard icon={Clock} label="Avg Duration" value={stats.avgDurationMs != null ? `${(stats.avgDurationMs / 1000).toFixed(1)}s` : '—'} />
              <KpiCard icon={XCircle} label="Failed" value={stats.failed} variant="destructive" />
              <KpiCard icon={Activity} label="Running" value={stats.running} variant="secondary" />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Failures by stage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Failures by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                {stageFailures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No failures in the last hour 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {stageFailures.map((sf) => (
                      <div key={sf.stage} className="flex items-center justify-between text-sm">
                        <span className="font-mono">{sf.stage}</span>
                        <Badge variant="destructive">{sf.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Open alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Open Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No open alerts</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {alerts.map((a) => (
                      <div key={a.id} className="border-b border-border pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={a.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                            {a.severity}
                          </Badge>
                          <span className="text-sm font-medium truncate">{a.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent scans table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Scan ID</th>
                      <th className="pb-2 pr-4">State</th>
                      <th className="pb-2 pr-4">Last Stage</th>
                      <th className="pb-2 pr-4">Duration</th>
                      <th className="pb-2 pr-4">Age</th>
                      <th className="pb-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((s) => (
                      <tr key={s.scan_id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 pr-4">
                          <Link
                            to={`/ops/scans/${s.scan_id}`}
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {s.scan_id.slice(0, 8)}…
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={stateColor(s.state)} className="text-xs">{s.state}</Badge>
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{s.last_stage || '—'}</td>
                        <td className="py-2 pr-4 text-xs">
                          {s.latency_ms_total != null ? `${(s.latency_ms_total / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                        </td>
                        <td className="py-2 text-xs text-destructive truncate max-w-[200px]">
                          {s.error_code || '—'}
                        </td>
                      </tr>
                    ))}
                    {recentScans.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No scan health data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  variant?: 'destructive' | 'secondary';
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
