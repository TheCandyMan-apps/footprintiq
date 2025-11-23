import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle, Clock, XCircle, Ban, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  metadata: any;
}

interface ProviderStatus {
  provider: string;
  stage: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  icon: React.ReactNode;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeColor: string;
}

interface ProviderStatusPanelProps {
  scanId: string;
}

const getProviderStatus = (events: ScanEvent[]): ProviderStatus[] => {
  const providerMap = new Map<string, ProviderStatus>();

  // Process events chronologically to get latest status per provider
  events.forEach((event) => {
    if (event.provider === 'system' || event.provider === 'orchestrator') {
      return; // Skip system events
    }

    let icon: React.ReactNode;
    let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    let badgeColor = 'text-muted-foreground';

    // Special handling for async providers (GoSearch)
    const isAsync = event.metadata?.async === true;
    
    // Determine icon and badge based on status and stage
    if (event.status === 'success' || event.stage === 'completed') {
      icon = <CheckCircle className="h-4 w-4 text-green-500" />;
      badgeVariant = 'default';
      badgeColor = 'text-green-700 dark:text-green-300';
    } else if (event.stage === 'requested' && isAsync) {
      // Async provider running
      icon = <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      badgeVariant = 'outline';
      badgeColor = 'text-blue-700 dark:text-blue-300';
    } else if (event.stage === 'timeout' || event.error_message?.includes('timeout')) {
      icon = <Clock className="h-4 w-4 text-amber-500" />;
      badgeVariant = 'outline';
      badgeColor = 'text-amber-700 dark:text-amber-300';
    } else if (event.status === 'disabled' || event.stage === 'disabled') {
      icon = <Ban className="h-4 w-4 text-gray-500" />;
      badgeVariant = 'secondary';
      badgeColor = 'text-gray-600 dark:text-gray-400';
    } else if (event.status === 'failed' || event.stage === 'failed') {
      icon = <XCircle className="h-4 w-4 text-red-500" />;
      badgeVariant = 'destructive';
      badgeColor = 'text-red-700 dark:text-red-300';
    } else if (event.error_message?.includes('plan') || event.error_message?.includes('tier')) {
      icon = <Lock className="h-4 w-4 text-purple-500" />;
      badgeVariant = 'outline';
      badgeColor = 'text-purple-700 dark:text-purple-300';
    } else if (event.error_message?.includes('credit')) {
      icon = <CreditCard className="h-4 w-4 text-orange-500" />;
      badgeVariant = 'outline';
      badgeColor = 'text-orange-700 dark:text-orange-300';
    } else if (event.status === 'running' || event.stage === 'started') {
      icon = <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      badgeVariant = 'outline';
      badgeColor = 'text-blue-700 dark:text-blue-300';
    } else {
      icon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      badgeVariant = 'outline';
      badgeColor = 'text-yellow-700 dark:text-yellow-300';
    }

    providerMap.set(event.provider, {
      provider: event.provider,
      stage: isAsync && event.stage === 'requested' ? 'running (async)' : event.stage,
      status: event.status,
      duration_ms: event.duration_ms,
      error_message: event.error_message,
      icon,
      badgeVariant,
      badgeColor,
    });
  });

  return Array.from(providerMap.values());
};

export function ProviderStatusPanel({ scanId }: ProviderStatusPanelProps) {
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('scan_events')
          .select('*')
          .eq('scan_id', scanId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[ProviderStatusPanel] Error fetching scan events:', error);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error('[ProviderStatusPanel] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [scanId]);

  const providerStatuses = getProviderStatus(events);

  if (loading || providerStatuses.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="border-muted">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span>Provider Status</span>
                <Badge variant="secondary" className="text-xs">
                  {providerStatuses.length} providers
                </Badge>
              </CardTitle>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {providerStatuses.map((status) => (
                <div
                  key={status.provider}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex-shrink-0">{status.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{status.provider}</div>
                    <div className={`text-xs ${status.badgeColor}`}>
                      {status.stage}
                      {status.duration_ms && ` (${(status.duration_ms / 1000).toFixed(1)}s)`}
                    </div>
                    {status.error_message && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {status.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
