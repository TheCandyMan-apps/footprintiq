import { useEffect, useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle, AlertCircle, X, Eye, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { detectScanPipeline } from '@/utils/scanPipeline';

interface ProviderStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'failed' | 'skipped' | 'retrying';
  message?: string;
  resultCount?: number;
  lastUpdated?: number;
}

interface DebugEvent {
  timestamp: number;
  source: 'broadcast' | 'database' | 'polling';
  provider?: string;
  message: string;
}

interface ScanProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanId: string | null;
  onComplete?: () => void;
  initialProviders?: string[];
}

export function ScanProgressDialog({ open, onOpenChange, scanId, onComplete, initialProviders }: ScanProgressDialogProps) {
  const initialProvidersKey = useMemo(() => initialProviders?.join(',') || '', [initialProviders]);

  // State
  const [progress, setProgress] = useState(0);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [isCancelling, setIsCancelling] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Connection health
  const [connectionMode, setConnectionMode] = useState<'live' | 'fallback'>('live');
  const [lastEventAt, setLastEventAt] = useState(Date.now());
  const [isPolling, setIsPolling] = useState(false);
  
  // Debug
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Add debug event
  const addDebugEvent = useCallback((source: DebugEvent['source'], message: string, provider?: string) => {
    setDebugEvents(prev => [...prev.slice(-19), { timestamp: Date.now(), source, provider, message }]);
  }, []);

  // Success effects
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 523.25;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play success sound:', error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Unified provider update
  const updateProvider = useCallback((
    name: string,
    newStatus: ProviderStatus['status'],
    message?: string,
    resultCount?: number
  ) => {
    const now = Date.now();
    setProviders(prev => {
      const existing = prev.find(p => p.name === name);
      if (existing) {
        return prev.map(p =>
          p.name === name
            ? { ...p, status: newStatus, message: message || p.message, resultCount: resultCount !== undefined ? resultCount : p.resultCount, lastUpdated: now }
            : p
        );
      }
      return [...prev, { name, status: newStatus, message: message || '', resultCount, lastUpdated: now }];
    });
    setLastEventAt(now);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = providers.length;
    const completed = providers.filter(p => p.status === 'success' || p.status === 'failed' || p.status === 'skipped').length;
    const active = providers.filter(p => p.status === 'loading' || p.status === 'retrying');
    const findingsCount = providers.reduce((sum, p) => sum + (p.resultCount || 0), 0);
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, findingsCount, progressPct };
  }, [providers]);

  // Update progress based on stats
  useEffect(() => {
    if (status === 'running' && stats.total > 0) {
      setProgress(Math.max(5, Math.min(stats.progressPct, 95)));
    }
  }, [stats, status]);

  // Fallback polling
  useEffect(() => {
    if (!scanId || !open || !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase.from('scan_progress').select('*').eq('scan_id', scanId).maybeSingle();
        if (data) {
          addDebugEvent('polling', `Progress: ${data.completed_providers}/${data.total_providers}`);
          
          if (data.current_providers && Array.isArray(data.current_providers)) {
            data.current_providers.forEach((providerName: string) => {
              updateProvider(providerName, 'loading', 'Processing...');
            });
          }

          if (data.status === 'completed') {
            setStatus('completed');
            setProgress(100);
            setTotalResults(data.findings_count || 0);
            setIsPolling(false);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [scanId, open, isPolling, updateProvider, addDebugEvent]);

  // Main effect: Setup realtime + health monitoring
  useEffect(() => {
    if (!scanId || !open) return;

    console.log('[ScanProgress] Initializing for scanId:', scanId);
    
    // Reset state
    setProgress(5);
    setStatus('running');
    setTotalResults(0);
    setConnectionMode('live');
    setLastEventAt(Date.now());
    setIsPolling(false);
    setDebugEvents([]);

    // Initialize providers immediately
    if (initialProviders && initialProviders.length > 0) {
      setProviders(initialProviders.map(name => ({
        name,
        status: 'pending',
        message: 'Queued...',
        lastUpdated: Date.now()
      })));
      addDebugEvent('database', `Initialized ${initialProviders.length} providers`);
    } else {
      setProviders([]);
    }

    // Fetch initial progress
    const fetchInitialProgress = async () => {
      const { data } = await supabase.from('scan_progress').select('*').eq('scan_id', scanId).maybeSingle();
      if (data) {
        addDebugEvent('database', `Initial: ${data.completed_providers}/${data.total_providers}`);
        if (data.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          setTotalResults(data.findings_count || 0);
        } else if (data.status === 'failed') {
          setStatus('failed');
        }
      }
    };
    fetchInitialProgress();

    // Subscribe to scan_progress table
    const progressChannel = supabase
      .channel(`scan_progress_${scanId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_progress', filter: `scan_id=eq.${scanId}` }, (payload) => {
        const data = payload.new as any;
        addDebugEvent('database', `DB update: ${data.completed_providers}/${data.total_providers}`);
        
        if (data.current_providers && Array.isArray(data.current_providers)) {
          data.current_providers.forEach((providerName: string) => {
            updateProvider(providerName, 'loading', data.message || 'Processing...');
          });
        }

        if (data.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          setTotalResults(data.findings_count || 0);
        } else if (data.status === 'failed') {
          setStatus('failed');
        }

        setLastEventAt(Date.now());
        setConnectionMode('live');
        if (isPolling) setIsPolling(false);
      })
      .subscribe();

    // Subscribe to broadcast channel
    const broadcastChannel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        const { provider, status: providerStatus, message, resultCount } = payload.payload;
        addDebugEvent('broadcast', message || `${provider}: ${providerStatus}`, provider);
        
        if (provider) {
          updateProvider(provider, providerStatus, message, resultCount);
        }

        setLastEventAt(Date.now());
        setConnectionMode('live');
        if (isPolling) setIsPolling(false);
      })
      .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
        addDebugEvent('broadcast', 'Scan completed');
        setStatus('completed');
        setProgress(100);
        setTotalResults(payload.payload.findingsCount || 0);
        
        if (payload.payload.findingsCount > 0) {
          playSuccessSound();
          triggerConfetti();
          toast.success(`Scan completed - ${payload.payload.findingsCount} results found`);
        } else {
          toast.info('Scan completed with no results');
        }
        
        setTimeout(() => onComplete?.(), 3000);
      })
      .on('broadcast', { event: 'scan_failed' }, (payload: any) => {
        addDebugEvent('broadcast', payload.payload.error || 'Scan failed');
        setStatus('failed');
        toast.error(payload.payload.error || 'Scan failed');
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        addDebugEvent('broadcast', 'Scan cancelled');
        setStatus('cancelled');
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe();

    // Subscribe to findings
    const findingsChannel = supabase
      .channel(`findings_${scanId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'findings', filter: `scan_id=eq.${scanId}` }, (payload) => {
        addDebugEvent('database', `New finding from ${payload.new.provider}`, payload.new.provider);
        setTotalResults(prev => prev + 1);
        
        if (payload.new.provider) {
          setProviders(prev => prev.map(p =>
            p.name === payload.new.provider ? { ...p, resultCount: (p.resultCount || 0) + 1 } : p
          ));
        }
      })
      .subscribe();

    // Health monitor
    const healthInterval = setInterval(() => {
      const timeSinceLastEvent = Date.now() - lastEventAt;
      if (status !== 'running') return;
      
      if (timeSinceLastEvent > 12000 && !isPolling) {
        console.log('[ScanProgress] No realtime events, switching to polling');
        setConnectionMode('fallback');
        setIsPolling(true);
        toast.info('Connection interrupted - using fallback updates', { duration: 3000 });
      }
    }, 3000);

    // Cleanup
    return () => {
      console.log('[ScanProgress] Cleaning up');
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(findingsChannel);
      clearInterval(healthInterval);
    };
  }, [scanId, open, initialProvidersKey, onComplete, updateProvider, addDebugEvent]);

  // Handle cancel
  const handleCancel = async () => {
    if (!scanId) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-scan', { body: { scanId } });
      if (error) throw error;
      toast.success('Scan cancelled');
      setStatus('cancelled');
      setTimeout(() => onOpenChange(false), 1000);
    } catch (error) {
      console.error('[Cancel] Error:', error);
      toast.error('Failed to cancel scan');
    } finally {
      setIsCancelling(false);
    }
  };

  // Render provider icon
  const renderProviderIcon = (provider: ProviderStatus) => {
    switch (provider.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${time}.${ms}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Scan in Progress</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {stats.completed} of {stats.total} providers completed
                <Badge variant={connectionMode === 'live' ? 'default' : 'secondary'} className="ml-2">
                  {connectionMode === 'live' ? (
                    <><Wifi className="h-3 w-3 mr-1" /> Live</>
                  ) : (
                    <><WifiOff className="h-3 w-3 mr-1" /> Fallback</>
                  )}
                </Badge>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{status === 'completed' ? 'Complete!' : status === 'failed' ? 'Failed' : 'Scanning...'}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.findingsCount}</div>
              <div className="text-xs text-muted-foreground">Findings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.active.length}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {providers.map(provider => (
                <div key={provider.name} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {renderProviderIcon(provider)}
                    <div>
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">{provider.message || 'Waiting...'}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {provider.resultCount !== undefined && (
                      <Badge variant="secondary">{provider.resultCount} results</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Collapsible open={showDebug} onOpenChange={setShowDebug}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {showDebug ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                Debug Details ({debugEvents.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="h-48 mt-2 rounded-lg border p-2 bg-muted/50">
                <div className="space-y-1 font-mono text-xs">
                  {debugEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground">{formatTimestamp(event.timestamp)}</span>
                      <Badge variant="outline" className="text-xs">{event.source}</Badge>
                      {event.provider && <span className="text-primary">{event.provider}</span>}
                      <span>{event.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {status === 'running' && (
            <Button onClick={handleCancel} disabled={isCancelling} variant="destructive" className="flex-1">
              {isCancelling ? 'Cancelling...' : 'Cancel Scan'}
            </Button>
          )}
          {status === 'completed' && scanId && (
            <Button onClick={() => { onOpenChange(false); window.location.href = `/results/${scanId}`; }} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
