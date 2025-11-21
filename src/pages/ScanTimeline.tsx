import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Play, Ban } from 'lucide-react';
import { format } from 'date-fns';

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export default function ScanTimeline() {
  const { scanId } = useParams<{ scanId: string }>();
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) return;

    const fetchTimeline = async () => {
      const { data: scan } = await supabase
        .from('scans')
        .select('status')
        .eq('id', scanId)
        .single();

      if (scan) setScanStatus(scan.status);

      const { data } = await supabase
        .from('scan_events')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true });

      setEvents(data || []);
      setLoading(false);
    };

    fetchTimeline();

    // Realtime subscription if scan is running
    const channel = supabase
      .channel(`scan_timeline_${scanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scan_events',
        filter: `scan_id=eq.${scanId}`,
      }, (payload) => {
        setEvents((prev) => [...prev, payload.new as ScanEvent]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'skipped':
        return <Ban className="h-5 w-5 text-muted-foreground" />;
      case 'started':
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      requested: 'Queued',
      started: 'In Progress',
      completed: 'Completed',
      failed: 'Failed',
      timeout: 'Timeout',
      disabled: 'Disabled',
      retry: 'Retrying',
    };
    return labels[stage] || stage;
  };

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.provider]) acc[event.provider] = [];
    acc[event.provider].push(event);
    return acc;
  }, {} as Record<string, ScanEvent[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse">Loading timeline...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scan Timeline</h1>
          <p className="text-muted-foreground">Real-time provider execution timeline</p>
          <Badge className="mt-2">{scanStatus}</Badge>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([provider, providerEvents]) => (
            <Card key={provider}>
              <CardHeader>
                <CardTitle className="text-lg">{provider}</CardTitle>
                <CardDescription>
                  {providerEvents.length} event{providerEvents.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {providerEvents.map((event, idx) => (
                      <div key={event.id} className="flex gap-4 relative">
                        <div className="relative z-10 flex-shrink-0">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {getStageLabel(event.stage)}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(event.created_at), 'HH:mm:ss')}
                              </p>
                            </div>
                            {event.duration_ms && (
                              <Badge variant="secondary" className="text-xs">
                                {event.duration_ms}ms
                              </Badge>
                            )}
                          </div>
                          {event.error_message && (
                            <p className="text-sm text-red-500 mt-2">{event.error_message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
