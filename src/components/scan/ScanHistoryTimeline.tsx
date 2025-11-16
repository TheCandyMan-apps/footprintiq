import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, CheckCircle2, XCircle, Clock, AlertCircle, MinusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProviderEvent {
  id: string;
  provider: string;
  event: 'start' | 'success' | 'failed' | 'retry' | 'skipped';
  message: string | null;
  result_count: number;
  error: any;
  created_at: string;
}

interface ScanHistoryTimelineProps {
  scanId: string;
}

export function ScanHistoryTimeline({ scanId }: ScanHistoryTimelineProps) {
  const [events, setEvents] = useState<ProviderEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) return;

    loadEvents();
    subscribeToEvents();
  }, [scanId]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_provider_events')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as ProviderEvent[]);
    } catch (error) {
      console.error('Failed to load scan events:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel(`scan_events_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_provider_events',
          filter: `scan_id=eq.${scanId}`,
        },
        (payload) => {
          setEvents((prev) => [...prev, payload.new as ProviderEvent]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const exportToCSV = () => {
    const csv = [
      ['Provider', 'Event', 'Message', 'Results', 'Time'],
      ...events.map(e => [
        e.provider,
        e.event,
        e.message || '',
        e.result_count.toString(),
        new Date(e.created_at).toISOString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${scanId}-timeline.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'retry': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'skipped': return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'retry': return 'secondary';
      case 'skipped': return 'outline';
      default: return 'secondary';
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.provider]) acc[event.provider] = [];
    acc[event.provider].push(event);
    return acc;
  }, {} as Record<string, ProviderEvent[]>);

  const calculateDuration = (providerEvents: ProviderEvent[]) => {
    const startEvent = providerEvents.find(e => e.event === 'start');
    const endEvent = providerEvents.find(e => e.event === 'success' || e.event === 'failed');
    if (!startEvent || !endEvent) return null;
    
    const duration = new Date(endEvent.created_at).getTime() - new Date(startEvent.created_at).getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scan History Timeline</CardTitle>
            <CardDescription>
              Provider execution timeline for this scan
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {Object.entries(groupedEvents).map(([provider, providerEvents]) => {
              const duration = calculateDuration(providerEvents);
              const finalStatus = providerEvents[providerEvents.length - 1];
              
              return (
                <div key={provider} className="border-l-2 border-border pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{provider}</span>
                    <Badge variant={getEventColor(finalStatus.event)}>
                      {finalStatus.event}
                    </Badge>
                    {duration && (
                      <Badge variant="outline">
                        {duration}
                      </Badge>
                    )}
                    {finalStatus.result_count > 0 && (
                      <Badge variant="secondary">
                        {finalStatus.result_count} results
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {providerEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-2 text-sm">
                        {getEventIcon(event.event)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.event}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {event.message && (
                            <p className="text-muted-foreground">{event.message}</p>
                          )}
                          {event.error && (
                            <p className="text-xs text-destructive">
                              Error: {JSON.stringify(event.error)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {events.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No events recorded yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
