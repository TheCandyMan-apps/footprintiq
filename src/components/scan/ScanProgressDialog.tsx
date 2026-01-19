import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
import { useScanNarrative } from '@/hooks/useScanNarrative';
import { ScanNarrativeFeed } from './results-tabs/summary/ScanNarrativeFeed';

interface ProviderStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'failed' | 'skipped' | 'retrying' | 'warning';
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

// Scan lifecycle phases
type ScanPhase = 'running' | 'finalising' | 'completed' | 'failed';

// Helper functions for terminal status detection
const isTerminalStatus = (s?: string) =>
  s === 'completed' || s === 'completed_empty' || s === 'completed_partial' || s === 'failed' || s === 'timeout';

const isFailedStatus = (s?: string) => s === 'failed' || s === 'timeout';

export function ScanProgressDialog({ open, onOpenChange, scanId, onComplete, initialProviders }: ScanProgressDialogProps) {
  const navigate = useNavigate();
  const initialProvidersKey = useMemo(() => initialProviders?.join(',') || '', [initialProviders]);

  // Track last scanId to prevent progress resets when reopening same scan
  const lastScanIdRef = useRef<string | null>(null);
  
  // Use refs for polling to avoid re-render loops and stale closures
  const isPollingRef = useRef(false);
  const statusRef = useRef<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  
  // Stable refs for callbacks to prevent stale closures in polling intervals
  const scanIdRef = useRef<string | null>(null);
  const updateProviderRef = useRef<typeof updateProvider | null>(null);
  const addDebugEventRef = useRef<typeof addDebugEvent | null>(null);

  // Scan phase state and ref
  const [phase, setPhase] = useState<ScanPhase>('running');
  const phaseRef = useRef<ScanPhase>('running');
  
  // Cached scan_type and results_route for deterministic routing
  const [scanType, setScanType] = useState<string | null>(null);
  const [resultsRoute, setResultsRoute] = useState<string>('results');
  const [searchedValue, setSearchedValue] = useState<string>('');

  // State
  const [progress, setProgress] = useState(0);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [isCancelling, setIsCancelling] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Connection health
  const [connectionMode, setConnectionMode] = useState<'live' | 'fallback'>('live');
  const [lastEventAt, setLastEventAt] = useState(Date.now());
  const lastEventAtRef = useRef(Date.now()); // Ref to avoid stale closures in intervals
  const [hasShownFallbackToast, setHasShownFallbackToast] = useState(false);
  
  // Debug
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Keep lastEventAtRef in sync with state (for use in intervals)
  useEffect(() => {
    lastEventAtRef.current = lastEventAt;
  }, [lastEventAt]);

  // Keep scanIdRef in sync
  useEffect(() => {
    scanIdRef.current = scanId;
  }, [scanId]);

  // Add debug event
  const addDebugEvent = useCallback((source: DebugEvent['source'], message: string, provider?: string) => {
    setDebugEvents(prev => [...prev.slice(-19), { timestamp: Date.now(), source, provider, message }]);
  }, []);

  // Keep addDebugEventRef in sync
  useEffect(() => {
    addDebugEventRef.current = addDebugEvent;
  }, [addDebugEvent]);

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

  // Unified provider update - case-insensitive matching
  const updateProvider = useCallback((
    name: string,
    newStatus: ProviderStatus['status'],
    message?: string,
    resultCount?: number
  ) => {
    const now = Date.now();
    const nameLower = name.toLowerCase();

    setProviders(prev => {
      const existing = prev.find(p => p.name.toLowerCase() === nameLower);
      if (existing) {
        // Never decrease result count (prevents later realtime events with 0 from overwriting actual counts)
        const nextResultCount =
          resultCount !== undefined
            ? Math.max(resultCount, existing.resultCount ?? 0)
            : existing.resultCount;

        return prev.map(p =>
          p.name.toLowerCase() === nameLower
            ? {
                ...p,
                status: newStatus,
                message: message || p.message,
                resultCount: nextResultCount,
                lastUpdated: now,
              }
            : p
        );
      }
      return [...prev, { name, status: newStatus, message: message || '', resultCount, lastUpdated: now }];
    });

    setLastEventAt(now);
  }, []);

  // Keep updateProviderRef in sync
  useEffect(() => {
    updateProviderRef.current = updateProvider;
  }, [updateProvider]);


  // Helper function to get display message based on provider status
  const getProviderDisplayMessage = useCallback((provider: ProviderStatus): string => {
    switch (provider.status) {
      case 'success':
        // If we have results > 0, show the count
        if (provider.resultCount !== undefined && provider.resultCount > 0) {
          return `Complete - ${provider.resultCount} results`;
        }
        // During running/finalising phase, show "syncing" if count is 0
        // (actual count may arrive later via findings table sync)
        if (phase === 'running' || phase === 'finalising') {
          return 'Complete - syncing results...';
        }
        // After completion, if still 0, show it
        return provider.resultCount !== undefined 
          ? `Complete - ${provider.resultCount} results` 
          : 'Complete';
      case 'loading':
        return 'Scanning...';
      case 'retrying':
        return 'Retrying...';
      case 'failed':
        return provider.message || 'Failed';
      case 'warning':
        return provider.message || 'Timeout';
      case 'skipped':
        return 'Skipped';
      case 'pending':
      default:
        return 'Waiting to start...';
    }
  }, [phase]);

  // Cache scan_type, results_route, and searchedValue on dialog open for deterministic routing
  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;

    (async () => {
      console.log('[ScanProgress] Fetching results_route:', { scanId });

      const { data, error } = await supabase
        .from('scans')
        .select('scan_type, results_route, username, email, phone')
        .eq('id', scanId)
        .maybeSingle();

      console.log('[ScanProgress] results_route fetch result:', {
        scanId,
        data,
        error: error ? { message: error.message, code: (error as any).code } : null,
      });

      if (!cancelled) {
        setScanType(data?.scan_type ?? null);
        // Use results_route if set, otherwise default to 'results' (safest)
        const route = (data as any)?.results_route ?? 'results';
        console.log('[ScanProgress] Setting resultsRoute:', { scanId, route });
        setResultsRoute(route);
        // Set searchedValue for narrative context
        setSearchedValue(data?.username || data?.email || data?.phone || '');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scanId]);

  const stats = useMemo(() => {
    const total = providers.length;
    
    // Freeze stats when phase is completed
    if (phase === 'completed') {
      return {
        total,
        completed: total,
        active: [] as ProviderStatus[],
        findingsCount: totalResults ?? 0,
        progressPct: 100,
      };
    }

    // Freeze stats when phase is failed (show actual completed count)
    if (phase === 'failed') {
      const completedCount = providers.filter(p => 
        ['success', 'failed', 'skipped', 'warning'].includes(p.status)
      ).length;
      return {
        total,
        completed: completedCount,
        active: [] as ProviderStatus[],
        findingsCount: totalResults ?? 0,
        progressPct: 100,
      };
    }

    // Only count providers that have actually received events (not just pre-populated pending ones)
    const activeProviders = providers.filter(p => p.status !== 'pending' || p.lastUpdated);
    const effectiveTotal = activeProviders.length > 0 ? activeProviders.length : total;

    const TERMINAL = new Set<ProviderStatus['status']>([
      'success',
      'failed',
      'skipped',
      'warning',
    ]);

    // Only count providers that have reached a terminal state AND actually received updates
    const completed = providers.filter(p => TERMINAL.has(p.status) && p.lastUpdated).length;
    const active = providers.filter(p => p.status === 'loading' || p.status === 'retrying');
    const findingsCount = providers.reduce((sum, p) => sum + (p.resultCount || 0), 0);

    // Include partial credit for active providers for smoother progress
    const effectiveCompleted = completed + (active.length * 0.5);
    const progressPct = effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : 0;
    return { total: effectiveTotal, completed, active, findingsCount, progressPct };
  }, [providers, phase, totalResults]);

  // Update progress based on stats (monotonic - never decrease)
  useEffect(() => {
    if (status !== 'running' || stats.total === 0) return;

    const next = Math.max(5, Math.min(stats.progressPct, 95));

    setProgress(prev => {
      // ✅ never go backwards
      if (next < prev) return prev;
      return next;
    });
  }, [stats, status]);

  // Set progress to 100% on completion
  useEffect(() => {
    if (['completed', 'failed', 'timeout', 'completed_partial'].includes(status)) {
      setProgress(100);
    }
  }, [status]);

  // Calculate realistic ETA based on providers
  const eta = useMemo(() => {
    // rough, conservative defaults (ms)
    const PROVIDER_ETA: Record<string, number> = {
      hibp: 8000,
      dehashed: 12000,
      intelx: 15000,
      pipl: 12000,
      hunter: 10000,

      maigret: 60000,
      sherlock: 45000,

      'apify-social': 90000,
      'apify-osint': 120000,
      'apify-darkweb': 150000,

      gosearch: 180000, // async, but still show expectation
    };

    const totalMs = providers.reduce((sum, p) => {
      const key = p.name.toLowerCase();
      return sum + (PROVIDER_ETA[key] ?? 20000);
    }, 0);

    // display as range (min..max)
    const minMs = Math.max(60000, totalMs * 0.6);
    const maxMs = Math.max(120000, totalMs * 1.2);

    const fmt = (ms: number) => {
      const m = Math.ceil(ms / 60000);
      return `${m} min`;
    };

    return { min: fmt(minMs), max: fmt(maxMs) };
  }, [providers]);

  // ✅ EXTRACTED: Map stage to status - reusable in both polling and completion detector
  const mapStageToStatus = useCallback((stage: string): ProviderStatus['status'] => {
    const normalizedStage = (stage || '').toLowerCase().trim();
    if (normalizedStage === 'complete' || normalizedStage === 'completed' || normalizedStage === 'success') {
      return 'success';
    } else if (normalizedStage === 'start' || normalizedStage === 'started' || normalizedStage === 'running' || normalizedStage === 'in_progress') {
      return 'loading';
    } else if (normalizedStage === 'failed' || normalizedStage === 'error') {
      return 'failed';
    } else if (normalizedStage === 'timeout') {
      return 'warning';
    } else if (normalizedStage === 'skipped') {
      return 'skipped';
    }
    return 'pending';
  }, []);

  // Dynamic dialog title based on phase
  const dialogTitle = useMemo(() => {
    switch (phase) {
      case 'completed': return 'Scan Complete';
      case 'failed': return 'Scan Failed';
      case 'finalising': return 'Finalising Results';
      default: return 'Scan in Progress';
    }
  }, [phase]);

  // Progress bar label based on phase
  const progressLabel = useMemo(() => {
    switch (phase) {
      case 'completed': return 'Complete!';
      case 'failed': return 'Failed';
      case 'finalising': return 'Finalising...';
      default: return 'Scanning...';
    }
  }, [phase]);

  // Deterministic View Results handler using cached resultsRoute and scanType
  const handleViewResults = useCallback(() => {
    if (!scanId) return;

    console.log('[ScanProgress] handleViewResults:', {
      scanId,
      resultsRoute,
      scanType,
      phase: phaseRef.current,
    });

    onOpenChange(false);

    // Route based on scan type for the best results experience:
    // - Username scans → new tabbed results UI at /scan/usernames/:scanId
    // - Maigret route → basic maigret results page
    // - Everything else → full legacy results page
    if (scanType === 'username') {
      console.log('[ScanProgress] Navigating:', { to: 'username-results', path: `/scan/usernames/${scanId}` });
      navigate(`/scan/usernames/${scanId}`);
    } else if (resultsRoute === 'maigret') {
      console.log('[ScanProgress] Navigating:', { to: 'maigret', path: `/maigret/results/${scanId}` });
      navigate(`/maigret/results/${scanId}`);
    } else {
      console.log('[ScanProgress] Navigating:', { to: 'results', path: `/results/${scanId}` });
      navigate(`/results/${scanId}`);
    }
  }, [scanId, resultsRoute, scanType, navigate, onOpenChange]);

  // Independent completion detector - runs every 2s regardless of other state
  // This is the most reliable way to detect scan completion
  useEffect(() => {
    if (!scanId || !open) return;
    
    console.log('[CompletionDetector] Starting for scan:', scanId);
    
    const checkCompletion = async () => {
      // Skip if already completed or finalising
      if (phaseRef.current !== 'running') {
        console.log('[CompletionDetector] Skipping - phase is:', phaseRef.current);
        return;
      }
      
      try {
        const { data: scanData } = await supabase
          .from('scans')
          .select('status, completed_at')
          .eq('id', scanId)
          .maybeSingle();
        
        if (!scanData) return;
        
        const scanStatus = scanData.status;
        
        if (isTerminalStatus(scanStatus)) {
          console.log('[CompletionDetector] Scan completed with status:', scanStatus);
          addDebugEvent('polling', `Scan completed: ${scanStatus}`);
          
          // ✅ PHASE 1: Enter finalising phase immediately
          const isFailed = isFailedStatus(scanStatus);
          setPhase('finalising');
          
          // Stop polling immediately
          isPollingRef.current = false;
          
          // ✅ FINAL SYNC: Fetch all provider events and update statuses BEFORE marking complete
          const { data: finalEvents } = await supabase
            .from('scan_events')
            .select('*')
            .eq('scan_id', scanId)
            .order('created_at', { ascending: true });
          
          // Get findings count first
          const { count } = await supabase
            .from('findings')
            .select('*', { count: 'exact', head: true })
            .eq('scan_id', scanId);
          
          const findingsCount = count || 0;
          
          // Build final provider list from events
          const providerFinalStatuses = new Map<string, { stage: string; message?: string; resultCount?: number }>();
          
          if (finalEvents && finalEvents.length > 0) {
            console.log('[CompletionDetector] Final sync: processing', finalEvents.length, 'events');
            
            finalEvents.forEach((event: any) => {
              if (event.provider) {
                const providerName = event.provider.toLowerCase();
                // Skip 'all' summary event - it's not a real provider
                if (providerName === 'all') return;
                providerFinalStatuses.set(providerName, {
                  stage: event.stage,
                  message: event.message,
                  resultCount: event.results_count || event.findings_count
                });
              }
            });
            
            console.log('[CompletionDetector] Final provider statuses:', Array.from(providerFinalStatuses.entries()));
          }
          
          // ✅ PHASE 2: Force-finalise any providers still loading/retrying
          flushSync(() => {
            setProviders(prev => {
              const now = Date.now();
              const providersWithEvents = new Set(providerFinalStatuses.keys());
              
              // Update providers that received events with their final status
              // AND force-finalise any still in loading/retrying state
              const updatedProviders: ProviderStatus[] = prev.map(p => {
                const finalData = providerFinalStatuses.get(p.name.toLowerCase());
                if (finalData) {
                  return {
                    ...p,
                    status: mapStageToStatus(finalData.stage),
                    message: finalData.message || p.message,
                    resultCount: finalData.resultCount !== undefined ? finalData.resultCount : p.resultCount,
                    lastUpdated: now
                  };
                }
                // Force-finalise providers still in loading/retrying state
                if (p.status === 'loading' || p.status === 'retrying') {
                  return {
                    ...p,
                    status: (isFailed ? 'failed' : 'success') as ProviderStatus['status'],
                    message: isFailed ? 'Failed' : 'Completed',
                    lastUpdated: now
                  };
                }
                return p;
              });
              
              // Filter out pending providers that never received events
              const filtered = updatedProviders.filter(p => 
                providersWithEvents.has(p.name.toLowerCase()) || p.status !== 'pending'
              );
              
              console.log('[CompletionDetector] Force-finalised providers:', filtered.map(p => `${p.name}:${p.status}`));
              return filtered;
            });
            
            setTotalResults(findingsCount);
            setProgress(100);
          });
          
          // ✅ PHASE 3: Set final status after brief finalising delay
          setTimeout(() => {
            flushSync(() => {
              if (isFailed) {
                setStatus('failed');
                setPhase('failed');
              } else {
                setStatus('completed');
                setPhase('completed');
              }
            });
            
            // Trigger effects
            if (findingsCount > 0 && !isFailed) {
              playSuccessSound();
              triggerConfetti();
              toast.success(`Scan completed - ${findingsCount} results found`);
            } else if (isFailed) {
              toast.error('Scan failed');
            } else {
              toast.info('Scan completed with no results');
            }
            
            setTimeout(() => onComplete?.(), 2000);
          }, 400);
        }
      } catch (error) {
        console.error('[CompletionDetector] Error:', error);
      }
    };
    
    // Check immediately
    checkCompletion();
    
    // Then poll every 2 seconds
    const interval = setInterval(checkCompletion, 2000);
    
    return () => clearInterval(interval);
  }, [scanId, open, addDebugEvent, onComplete, mapStageToStatus]);

  // Provider status polling - polls scan_events for provider updates
  // Aggressive 1-second polling + real-time subscription for immediate updates
  // Uses refs to prevent stale closures in polling intervals
  useEffect(() => {
    if (!scanId || !open) return;
    
    // Store scanId in ref for stable access in callbacks
    const currentScanId = scanId;
    console.log('[ScanProgress] Starting provider status polling for scan:', currentScanId);
    
    // ✅ Using component-level mapStageToStatus function
    
    const processEvents = (events: any[], source: string) => {
      if (!events || events.length === 0) {
        console.log(`[ScanProgress] ${source}: No events found`);
        return;
      }
      
      console.log(`[ScanProgress] ${source}: Processing ${events.length} events`);
      
      // Get the latest status for each provider (most recent event wins)
      const providerStatuses = new Map<string, { stage: string; message?: string; resultCount?: number }>();
      
      // Process in chronological order so latest status wins
      const sortedEvents = [...events].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      sortedEvents.forEach((event: any) => {
        if (event.provider) {
          // Normalize provider name to lowercase
          const providerName = event.provider.toLowerCase();
          // Skip 'all' summary event - it's not a real provider
          if (providerName === 'all') {
            console.log(`[ScanProgress] ${source}: Skipping 'all' summary event`);
            return;
          }
          console.log(`[ScanProgress] ${source}: Event - provider=${providerName}, stage=${event.stage}`);
          
          // Prefer event with higher findings count (avoid 0 results overwriting actual count)
          const existing = providerStatuses.get(providerName);
          // Check multiple sources for findings count
          const newFindingsCount = event.findings_count || event.results_count || event.metadata?.result_count || 0;
          const existingCount = existing?.resultCount || 0;
          
          // Update if: no existing, or stage changed, or new has higher findings count
          if (!existing || existing.stage !== event.stage || newFindingsCount > existingCount) {
            providerStatuses.set(providerName, {
              stage: event.stage,
              message: event.message,
              resultCount: Math.max(newFindingsCount, existingCount)
            });
          }
        }
      });
      
      console.log(`[ScanProgress] ${source}: Found ${providerStatuses.size} unique providers:`, Array.from(providerStatuses.keys()));
      
      providerStatuses.forEach((eventData, providerName) => {
        const providerStatus = mapStageToStatus(eventData.stage);
        console.log(`[ScanProgress] ${source}: Updating provider ${providerName} -> ${providerStatus}`);
        // Use refs to get latest callback versions
        updateProviderRef.current?.(providerName, providerStatus, eventData.message, eventData.resultCount);
      });
      
      addDebugEventRef.current?.('polling', `${source}: ${events.length} events, ${providerStatuses.size} providers`);
    };
    
    // Fetch events from database - uses currentScanId from closure (stable)
    const fetchEvents = async () => {
      // Guard: don't poll if not in running phase
      if (phaseRef.current !== 'running') {
        console.log('[ScanProgress] Poll skipped - phase is:', phaseRef.current);
        return;
      }
      
      try {
        console.log('[ScanProgress] Polling scan_events for:', currentScanId);
        const { data: events, error } = await supabase
          .from('scan_events')
          .select('*')
          .eq('scan_id', currentScanId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('[ScanProgress] Poll error:', error);
          return;
        }
        
        if (events) {
          processEvents(events, 'POLL');
        }
      } catch (error) {
        console.error('[ScanProgress] Poll exception:', error);
      }
    };
    
    // Fetch immediately
    fetchEvents();
    
    // Subscribe to real-time scan_events inserts for immediate updates
    const eventsChannel = supabase
      .channel(`scan_events_realtime_${currentScanId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'scan_events'
      }, (payload) => {
        const event = payload.new as any;
        
        // Filter by scan_id (in case filter doesn't work)
        if (event.scan_id !== currentScanId) return;
        
        console.log('[ScanProgress] REALTIME EVENT:', {
          scanId: event.scan_id,
          provider: event.provider,
          stage: event.stage,
          timestamp: new Date().toISOString()
        });
        
        if (event.provider) {
          const providerName = event.provider.toLowerCase();
          const providerStatus = mapStageToStatus(event.stage);
          
          addDebugEventRef.current?.('database', `Realtime: ${providerName} -> ${event.stage}`, providerName);
          updateProviderRef.current?.(providerName, providerStatus, event.message, event.results_count || event.findings_count);
          setLastEventAt(Date.now());
          setConnectionMode('live');
        }
      })
      .subscribe((status) => {
        console.log('[ScanProgress] scan_events subscription status:', status);
      });
    
    // Aggressive 1-second polling as primary mechanism
    const interval = setInterval(fetchEvents, 1000);
    
    return () => {
      console.log('[ScanProgress] Cleaning up provider polling');
      clearInterval(interval);
      supabase.removeChannel(eventsChannel);
    };
  }, [scanId, open]); // Reduced dependencies - callbacks accessed via refs

  // Main effect: Setup realtime + health monitoring
  useEffect(() => {
    if (!scanId || !open) return;

    // Check if this is a NEW scan vs reopening the same scan
    const isNewScan = scanId !== lastScanIdRef.current;
    lastScanIdRef.current = scanId;

    console.log('[ScanProgress] Initializing for scanId:', scanId, isNewScan ? '(NEW)' : '(SAME)');
    
    // Only reset state for a NEW scan - don't clear providers if reopening same scan
    if (isNewScan) {
      setProgress(5);
      setStatus('running');
      setPhase('running'); // Reset phase for new scan
      setTotalResults(0);
      setConnectionMode('live');
      setLastEventAt(Date.now());
      isPollingRef.current = false;
      setDebugEvents([]);
      setScanType(null); // Reset cached scanType for new scan
      
      // Pre-populate providers from initialProviders if provided
      if (initialProviders && initialProviders.length > 0) {
        const prePopulatedProviders: ProviderStatus[] = initialProviders.map(name => ({
          name: name.toLowerCase(),
          status: 'pending',
          message: 'Waiting to start...',
          lastUpdated: Date.now()
        }));
        setProviders(prePopulatedProviders);
        addDebugEvent('database', `Pre-populated ${initialProviders.length} providers: ${initialProviders.join(', ')}`);
      } else {
        setProviders([]);
        addDebugEvent('database', 'No initialProviders - will populate dynamically from scan_events');
      }
    }

    // Fetch initial progress and check if already completed
    const fetchInitialProgress = async () => {
      const { data } = await supabase.from('scan_progress').select('*').eq('scan_id', scanId).maybeSingle();
      if (data) {
        addDebugEvent('database', `Initial: ${data.completed_providers}/${data.total_providers}, status=${data.status}`);
        
        // Check if scan already completed - use finalising phase
        if (data.status === 'completed' || data.status === 'completed_partial') {
          console.log('[ScanProgress] Scan already completed, triggering finalising phase');
          setPhase('finalising');
          isPollingRef.current = false;
          
          // Force-finalise any providers
          setProviders(prev => prev.map(p => 
            (p.status === 'loading' || p.status === 'retrying' || p.status === 'pending')
              ? { ...p, status: 'success', message: 'Completed', lastUpdated: Date.now() }
              : p
          ));
          
          setProgress(100);
          setTotalResults(data.findings_count || 0);
          
          // After brief delay, set final phase
          setTimeout(() => {
            setStatus('completed');
            setPhase('completed');
            if (data.findings_count > 0) {
              playSuccessSound();
              triggerConfetti();
              toast.success(`Scan completed - ${data.findings_count} results found`);
            } else {
              toast.info('Scan completed with no results');
            }
            setTimeout(() => onComplete?.(), 2000);
          }, 400);
          return; // Don't setup realtime if already complete
        } else if (data.status === 'failed') {
          console.log('[ScanProgress] Scan already failed, triggering finalising phase');
          setPhase('finalising');
          isPollingRef.current = false;
          
          // Force-finalise providers as failed
          setProviders(prev => prev.map(p => 
            (p.status === 'loading' || p.status === 'retrying' || p.status === 'pending')
              ? { ...p, status: 'failed', message: 'Failed', lastUpdated: Date.now() }
              : p
          ));
          
          setProgress(100);
          
          setTimeout(() => {
            setStatus('failed');
            setPhase('failed');
          }, 400);
          return;
        }
      }
    };
    fetchInitialProgress();

    // Subscribe to scan_progress table
    const progressChannel = supabase
      .channel(`scan_progress_${scanId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_progress', filter: `scan_id=eq.${scanId}` }, (payload) => {
        // Guard: don't process if already in terminal phase
        if (phaseRef.current !== 'running') {
          console.log('[ScanProgress] scan_progress update ignored - phase:', phaseRef.current);
          return;
        }
        
        const data = payload.new as any;
        addDebugEvent('database', `DB update: ${data.completed_providers}/${data.total_providers}`);
        
        if (data.current_providers && Array.isArray(data.current_providers)) {
          data.current_providers.forEach((providerName: string) => {
            updateProvider(providerName, 'loading', data.message || 'Processing...');
          });
        }

        // Don't directly set completed/failed - let CompletionDetector handle it
        // Just update lastEventAt so polling can detect the change
        setLastEventAt(Date.now());
        setConnectionMode('live');
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
      })
      .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
        // Guard: don't process if already in terminal phase
        if (phaseRef.current !== 'running') {
          console.log('[ScanProgress] scan_complete broadcast ignored - phase:', phaseRef.current);
          return;
        }
        
        addDebugEvent('broadcast', 'Scan completed');
        
        // Enter finalising phase
        setPhase('finalising');
        isPollingRef.current = false;
        
        // Force-finalise providers
        setProviders(prev => prev.map(p => 
          (p.status === 'loading' || p.status === 'retrying' || p.status === 'pending')
            ? { ...p, status: 'success', message: 'Completed', lastUpdated: Date.now() }
            : p
        ));
        
        setProgress(100);
        setTotalResults(payload.payload.findingsCount || 0);
        
        setTimeout(() => {
          setStatus('completed');
          setPhase('completed');
          
          if (payload.payload.findingsCount > 0) {
            playSuccessSound();
            triggerConfetti();
            toast.success(`Scan completed - ${payload.payload.findingsCount} results found`);
          } else {
            toast.info('Scan completed with no results');
          }
          
          setTimeout(() => onComplete?.(), 2000);
        }, 400);
      })
      .on('broadcast', { event: 'scan_failed' }, (payload: any) => {
        // Guard: don't process if already in terminal phase
        if (phaseRef.current !== 'running') {
          console.log('[ScanProgress] scan_failed broadcast ignored - phase:', phaseRef.current);
          return;
        }
        
        addDebugEvent('broadcast', payload.payload.error || 'Scan failed');
        
        // Enter finalising phase
        setPhase('finalising');
        isPollingRef.current = false;
        
        // Force-finalise providers as failed
        setProviders(prev => prev.map(p => 
          (p.status === 'loading' || p.status === 'retrying' || p.status === 'pending')
            ? { ...p, status: 'failed', message: 'Failed', lastUpdated: Date.now() }
            : p
        ));
        
        setProgress(100);
        
        setTimeout(() => {
          setStatus('failed');
          setPhase('failed');
          toast.error(payload.payload.error || 'Scan failed');
        }, 400);
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
        const finding = payload.new as any;
        addDebugEvent('database', `New finding from ${finding.provider}`, finding.provider);
        setTotalResults(prev => prev + 1);
        
        if (finding.provider) {
          // Check if this is a provider_error finding - mark provider with warning status
          if (finding.kind === 'provider_error') {
            updateProvider(finding.provider, 'warning', finding.reason || 'Provider error', 0);
          } else {
            // Normal finding - increment result count
            setProviders(prev => prev.map(p =>
              p.name === finding.provider ? { ...p, resultCount: (p.resultCount || 0) + 1 } : p
            ));
          }
        }
      })
      .subscribe();

    // Mark polling as started via ref (no state update to avoid re-renders)
    isPollingRef.current = true;
    console.log('[ScanProgress] Polling enabled via ref');

    // Health monitor - updates connection mode based on realtime activity
    // Use refs to avoid stale closures and prevent effect re-runs
    const healthInterval = setInterval(() => {
      if (phaseRef.current !== 'running') return;
      
      // Access lastEventAt from ref to avoid stale closure
      const timeSinceLastEvent = Date.now() - lastEventAtRef.current;
      
      if (timeSinceLastEvent > 10000) {
        console.log('[ScanProgress] No realtime events for 10s, switching to fallback mode');
        setConnectionMode('fallback');
      }
    }, 3000);

    // Cleanup
    return () => {
      console.log('[ScanProgress] Cleaning up');
      isPollingRef.current = false;
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(findingsChannel);
      clearInterval(healthInterval);
    };
    // ✅ CRITICAL: Remove lastEventAt and connectionMode from deps to prevent provider list reset
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
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground/50" />;
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

  // Narrative feed for user-friendly progress updates
  const narrative = useScanNarrative(scanId || '', searchedValue, scanType || 'username');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  {stats.completed} of {stats.total} providers completed
                  <Badge variant={connectionMode === 'live' ? 'default' : 'secondary'} className="ml-2">
                    {connectionMode === 'live' ? (
                      <><Wifi className="h-3 w-3 mr-1" /> Live</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" /> Fallback</>
                    )}
                  </Badge>
                </div>
                {status === 'running' && providers.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Estimated time: <span className="font-medium text-foreground">{eta.min} – {eta.max}</span>.
                    Deep tools (GoSearch / Apify) may take 1–5 minutes depending on rate limits.
                  </p>
                )}
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
              <span>{progressLabel}</span>
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

          {/* Narrative Progress Feed */}
          {searchedValue && narrative.items.length > 0 && (
            <ScanNarrativeFeed
              items={narrative.items}
              summary=""
              isLoading={narrative.isLoading}
              isComplete={phase === 'completed'}
            />
          )}

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {providers.map(provider => (
                <div key={provider.name} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {renderProviderIcon(provider)}
                    <div>
                      <div className="font-medium text-sm capitalize">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">{getProviderDisplayMessage(provider)}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {provider.resultCount !== undefined && provider.resultCount > 0 && (
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
          {(phase === 'completed' || phase === 'finalising') && scanId && (
            <Button 
              onClick={handleViewResults}
              className="flex-1"
              disabled={phase === 'finalising'}
            >
              <Eye className="h-4 w-4 mr-2" />
              {phase === 'finalising' ? 'Preparing...' : 'View Results'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
