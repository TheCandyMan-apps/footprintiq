import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Ban, 
  ArrowLeft,
  Download,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
  status: string;
  duration_ms: number | null;
  findings_count: number | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface AggregatedStats {
  totalProviders: number;
  successfulProviders: number;
  failedProviders: number;
  skippedProviders: number;
  totalDurationMs: number;
  totalFindings: number;
  avgLatencyMs: number;
  successRate: number;
}

export default function ScanTimeline() {
  const { scanId } = useParams<{ scanId: string }>();
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanType, setScanType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AggregatedStats>({
    totalProviders: 0,
    successfulProviders: 0,
    failedProviders: 0,
    skippedProviders: 0,
    totalDurationMs: 0,
    totalFindings: 0,
    avgLatencyMs: 0,
    successRate: 0,
  });

  useEffect(() => {
    if (!scanId) return;

    const fetchTimeline = async () => {
      const { data: scan } = await supabase
        .from('scans')
        .select('status, scan_type')
        .eq('id', scanId)
        .single();

      if (scan) {
        setScanStatus(scan.status);
        setScanType(scan.scan_type);
      }

      const { data } = await supabase
        .from('scan_events')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true });

      const eventData = (data || []) as ScanEvent[];
      setEvents(eventData);
      calculateStats(eventData);
      setLoading(false);
    };

    fetchTimeline();

    // Realtime subscription
    const channel = supabase
      .channel(`scan_timeline_${scanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scan_events',
        filter: `scan_id=eq.${scanId}`,
      }, (payload) => {
        setEvents((prev) => {
          const updated = [...prev, payload.new as ScanEvent];
          calculateStats(updated);
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  const calculateStats = (eventData: ScanEvent[]) => {
    // Group by provider and get final status
    const providerStats = new Map<string, { status: string; durationMs: number; findings: number }>();
    
    for (const event of eventData) {
      if (event.provider === 'orchestrator') continue;
      
      const existing = providerStats.get(event.provider);
      
      if (event.stage === 'complete' || event.stage === 'failed' || event.stage === 'timeout' || event.stage === 'skipped') {
        providerStats.set(event.provider, {
          status: event.stage === 'complete' ? 'success' : event.stage,
          durationMs: event.duration_ms || existing?.durationMs || 0,
          findings: event.findings_count || 0,
        });
      } else if (!existing) {
        providerStats.set(event.provider, {
          status: 'running',
          durationMs: 0,
          findings: 0,
        });
      }
    }

    const providers = Array.from(providerStats.values());
    const successfulProviders = providers.filter(p => p.status === 'success').length;
    const failedProviders = providers.filter(p => p.status === 'failed' || p.status === 'timeout').length;
    const skippedProviders = providers.filter(p => p.status === 'skipped').length;
    const totalDurationMs = providers.reduce((sum, p) => sum + p.durationMs, 0);
    const totalFindings = providers.reduce((sum, p) => sum + p.findings, 0);
    const completedProviders = providers.filter(p => p.status !== 'running');
    const avgLatencyMs = completedProviders.length > 0 
      ? Math.round(totalDurationMs / completedProviders.length) 
      : 0;
    const successRate = providers.length > 0 
      ? Math.round((successfulProviders / providers.length) * 100) 
      : 0;

    setStats({
      totalProviders: providers.length,
      successfulProviders,
      failedProviders,
      skippedProviders,
      totalDurationMs,
      totalFindings,
      avgLatencyMs,
      successRate,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'skipped':
      case 'not_configured':
      case 'tier_restricted':
      case 'disabled':
        return <Ban className="h-5 w-5 text-muted-foreground" />;
      case 'started':
      case 'running':
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      requested: 'Queued',
      started: 'Started',
      complete: 'Completed',
      failed: 'Failed',
      timeout: 'Timeout',
      disabled: 'Disabled',
      skipped: 'Skipped',
      validation: 'Validation',
      scan_summary: 'Summary',
      retry: 'Retrying',
    };
    return labels[stage] || stage;
  };

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.provider]) acc[event.provider] = [];
    acc[event.provider].push(event);
    return acc;
  }, {} as Record<string, ScanEvent[]>);

  const exportAuditData = () => {
    const data = {
      scanId,
      scanStatus,
      scanType,
      exportedAt: new Date().toISOString(),
      stats,
      events: events.map(e => ({
        provider: e.provider,
        stage: e.stage,
        status: e.status,
        durationMs: e.duration_ms,
        findingsCount: e.findings_count,
        errorMessage: e.error_message,
        timestamp: e.created_at,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-audit-${scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to={`/results/${scanId}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Results
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Scan Execution Timeline</h1>
            <p className="text-muted-foreground">
              Detailed provider execution audit for {scanType} scan
            </p>
            <Badge className="mt-2" variant={scanStatus === 'completed' ? 'default' : 'secondary'}>
              {scanStatus}
            </Badge>
          </div>
          <Button variant="outline" onClick={exportAuditData} className="gap-2">
            <Download className="h-4 w-4" /> Export Audit
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Providers</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProviders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Success</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.successfulProviders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.failedProviders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Time</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.totalDurationMs)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Latency</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.avgLatencyMs)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Findings</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalFindings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm font-bold">{stats.successRate}%</span>
            </div>
            <Progress value={stats.successRate} className="h-3" />
          </CardContent>
        </Card>

        {/* Provider Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Provider Breakdown</h2>
          
          {Object.entries(groupedEvents)
            .filter(([provider]) => provider !== 'orchestrator')
            .sort(([, a], [, b]) => {
              // Sort by latest event timestamp
              const aTime = new Date(a[a.length - 1]?.created_at || 0).getTime();
              const bTime = new Date(b[b.length - 1]?.created_at || 0).getTime();
              return bTime - aTime;
            })
            .map(([provider, providerEvents]) => {
              const lastEvent = providerEvents[providerEvents.length - 1];
              const totalDuration = providerEvents.reduce((sum, e) => sum + (e.duration_ms || 0), 0);
              const findings = lastEvent?.findings_count || 0;
              
              return (
                <Card key={provider}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(lastEvent?.status || 'unknown')}
                        <div>
                          <CardTitle className="text-base">{provider}</CardTitle>
                          <CardDescription>
                            {providerEvents.length} event{providerEvents.length !== 1 ? 's' : ''}
                            {totalDuration > 0 && ` • ${formatDuration(totalDuration)}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {findings > 0 && (
                          <Badge variant="secondary">{findings} findings</Badge>
                        )}
                        <Badge variant={
                          lastEvent?.status === 'success' ? 'default' :
                          lastEvent?.status === 'failed' ? 'destructive' :
                          'secondary'
                        }>
                          {lastEvent?.status || 'unknown'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6">
                      {/* Vertical timeline line */}
                      <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" />
                      
                      <div className="space-y-3">
                        {providerEvents.map((event) => (
                          <div key={event.id} className="flex gap-4 relative">
                            <div className="absolute -left-6 z-10 flex-shrink-0 bg-background">
                              {getStatusIcon(event.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getStageLabel(event.stage)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(event.created_at), 'HH:mm:ss.SSS')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {event.findings_count !== null && event.findings_count > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {event.findings_count} findings
                                    </Badge>
                                  )}
                                  {event.duration_ms !== null && (
                                    <Badge variant="outline" className="text-xs">
                                      {formatDuration(event.duration_ms)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {event.error_message && (
                                <p className="text-sm text-red-500 mt-1 truncate" title={event.error_message}>
                                  {event.error_message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Orchestrator events */}
        {groupedEvents['orchestrator'] && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Orchestrator Events</CardTitle>
              <CardDescription>Scan lifecycle events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedEvents['orchestrator'].map((event) => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <Badge variant="outline">{getStageLabel(event.stage)}</Badge>
                      <span className="text-muted-foreground">
                        {format(new Date(event.created_at), 'HH:mm:ss')}
                      </span>
                    </div>
                    {event.duration_ms && (
                      <span className="text-muted-foreground">{formatDuration(event.duration_ms)}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
