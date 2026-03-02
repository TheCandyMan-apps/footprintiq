import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { AdminNav } from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ScanHealthRow {
  scan_id: string;
  state: string;
  last_stage: string | null;
  last_heartbeat_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_code: string | null;
  error_detail: string | null;
  latency_ms_total: number | null;
  created_at: string;
}

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
  status: string | null;
  message: string | null;
  duration_ms: number | null;
  findings_count: number | null;
  error_message: string | null;
  created_at: string;
}

export default function OpsScanDetail() {
  const { scanId } = useParams<{ scanId: string }>();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<ScanHealthRow | null>(null);
  const [events, setEvents] = useState<ScanEvent[]>([]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate('/dashboard');
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin && scanId) fetchData();
  }, [isAdmin, scanId]);

  const fetchData = async () => {
    if (!scanId) return;
    setLoading(true);
    await Promise.all([fetchHealth(), fetchEvents()]);
    setLoading(false);
  };

  const fetchHealth = async () => {
    const { data } = await (supabase as any)
      .from('scan_health')
      .select('*')
      .eq('scan_id', scanId)
      .maybeSingle();
    setHealth(data);
  };

  const fetchEvents = async () => {
    const { data } = await (supabase as any)
      .from('scan_events')
      .select('id, provider, stage, status, message, duration_ms, findings_count, error_message, created_at')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true });
    setEvents(data || []);
  };

  const stateIcon = (state: string) => {
    switch (state) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'running': return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const stageDotColor = (status: string | null) => {
    if (status === 'failed') return 'bg-destructive';
    if (status === 'running') return 'bg-blue-500';
    return 'bg-green-500';
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/ops"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-mono">{scanId?.slice(0, 8)}…</h1>
              <p className="text-xs text-muted-foreground font-mono">{scanId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Scan Health Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scan Health</CardTitle>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">State</p>
                    <div className="flex items-center gap-2">
                      {stateIcon(health.state)}
                      <Badge variant={health.state === 'failed' ? 'destructive' : 'default'}>{health.state}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Stage</p>
                    <p className="font-mono text-sm">{health.last_stage || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Latency</p>
                    <p className="text-sm font-medium">
                      {health.latency_ms_total != null ? `${(health.latency_ms_total / 1000).toFixed(1)}s` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Heartbeat</p>
                    <p className="text-sm">
                      {health.last_heartbeat_at
                        ? formatDistanceToNow(new Date(health.last_heartbeat_at), { addSuffix: true })
                        : '—'}
                    </p>
                  </div>
                  {health.started_at && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Started</p>
                      <p className="text-xs font-mono">{format(new Date(health.started_at), 'HH:mm:ss.SSS')}</p>
                    </div>
                  )}
                  {health.completed_at && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Completed</p>
                      <p className="text-xs font-mono">{format(new Date(health.completed_at), 'HH:mm:ss.SSS')}</p>
                    </div>
                  )}
                  {health.error_code && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Error</p>
                      <p className="text-sm text-destructive">{health.error_code}: {health.error_detail}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No health record found for this scan'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No events recorded'}
                </p>
              ) : (
                <div className="relative ml-3">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    {events.map((evt, i) => (
                      <div key={evt.id} className="relative pl-6">
                        {/* Dot */}
                        <div
                          className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1 ${stageDotColor(evt.status)}`}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-medium">{evt.provider}</span>
                              <Badge variant="outline" className="text-xs">{evt.stage}</Badge>
                              {evt.status && evt.status !== evt.stage && (
                                <Badge
                                  variant={evt.status === 'failed' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {evt.status}
                                </Badge>
                              )}
                              {evt.findings_count != null && evt.findings_count > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {evt.findings_count} findings
                                </span>
                              )}
                              {evt.duration_ms != null && (
                                <span className="text-xs text-muted-foreground">
                                  {(evt.duration_ms / 1000).toFixed(1)}s
                                </span>
                              )}
                            </div>
                            {evt.message && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{evt.message}</p>
                            )}
                            {evt.error_message && (
                              <p className="text-xs text-destructive mt-0.5 line-clamp-2">{evt.error_message}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {evt.created_at ? format(new Date(evt.created_at), 'HH:mm:ss.SSS') : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
