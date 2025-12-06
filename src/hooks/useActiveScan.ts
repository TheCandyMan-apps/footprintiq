import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActiveScan {
  scanId: string;
  type: 'advanced' | 'username' | 'recon-ng';
  target: string;
  startedAt: string;
}

interface ScanProgress {
  status: string;
  completedProviders: number;
  totalProviders: number;
  totalFindings: number;
  message: string;
  currentProviders?: string[];
}

const ACTIVE_SCAN_KEY = 'footprintiq_active_scan';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const POLLING_INTERVAL = 3000; // 3 seconds fallback polling

export function useActiveScan() {
  const [activeScan, setActiveScan] = useState<ActiveScan | null>(() => {
    const stored = localStorage.getItem(ACTIVE_SCAN_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(Date.now());

  // Persist active scan to localStorage
  useEffect(() => {
    if (activeScan) {
      localStorage.setItem(ACTIVE_SCAN_KEY, JSON.stringify(activeScan));
    } else {
      localStorage.removeItem(ACTIVE_SCAN_KEY);
    }
  }, [activeScan]);

  // Fetch progress from database - check scans table AND scan_events for reliable status
  const fetchProgress = async () => {
    if (!activeScan?.scanId) return null;

    try {
      // 1. Check scans table directly for completion (most reliable)
      const { data: scanData } = await supabase
        .from('scans')
        .select('status, completed_at')
        .eq('id', activeScan.scanId)
        .maybeSingle();
      
      const isComplete = scanData && ['completed', 'completed_empty', 'completed_partial', 'failed', 'timeout'].includes(scanData.status);
      
      // 2. Get provider statuses from scan_events
      const { data: events } = await supabase
        .from('scan_events')
        .select('provider, stage')
        .eq('scan_id', activeScan.scanId);
      
      const completedProviders = events?.filter((e: any) => 
        ['complete', 'completed', 'failed', 'timeout'].includes(e.stage)
      ).length || 0;
      
      const totalProviders = events ? new Set(events.map((e: any) => e.provider)).size : 0;
      
      // 3. Get findings count
      const { count: findingsCount } = await supabase
        .from('findings')
        .select('*', { count: 'exact', head: true })
        .eq('scan_id', activeScan.scanId);
      
      // 4. Also get scan_progress for message
      const { data } = await supabase
        .from('scan_progress')
        .select('*')
        .eq('scan_id', activeScan.scanId)
        .maybeSingle();
      
      // Use scans table status if available, fallback to scan_progress
      const finalStatus = isComplete ? scanData.status : (data?.status || 'running');
      
      const progressData = {
        status: finalStatus,
        completedProviders: completedProviders || data?.completed_providers || 0,
        totalProviders: totalProviders || data?.total_providers || 0,
        currentProviders: data?.current_providers || [],
        totalFindings: findingsCount || data?.findings_count || 0,
        message: data?.message || ''
      };
      
      setProgress(progressData);
      lastUpdateRef.current = Date.now();
      return progressData;
    } catch (error) {
      console.error('[useActiveScan] Error fetching progress:', error);
      return null;
    }
  };

  // Start polling fallback
  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    
    console.log('[useActiveScan] Starting polling fallback');
    pollingIntervalRef.current = setInterval(async () => {
      const progressData = await fetchProgress();
      
      // Check for terminal states
      if (progressData && ['completed', 'completed_empty', 'completed_partial', 'failed', 'timeout', 'error'].includes(progressData.status)) {
        console.log('[useActiveScan] Scan completed via polling:', progressData.status);
        stopPolling();
        setTimeout(() => {
          clearActiveScan();
        }, 5000);
      }
    }, 2000); // Poll every 2 seconds for faster updates
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
      console.log('[useActiveScan] Stopped polling');
    }
  };

  // Setup realtime subscription with monitoring
  const setupRealtimeSubscription = () => {
    if (!activeScan?.scanId) return;

    console.log(`[useActiveScan] Setting up realtime for scan: ${activeScan.scanId}`);
    
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to database changes
    const dbChannel = supabase
      .channel(`scan_progress_db_${activeScan.scanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_progress',
          filter: `scan_id=eq.${activeScan.scanId}`
        },
        (payload) => {
          console.log('[useActiveScan] DB update:', payload);
          const progressData = payload.new as any;
          
          setProgress({
            status: progressData.status,
            completedProviders: progressData.completed_providers || 0,
            totalProviders: progressData.total_providers || 0,
            currentProviders: progressData.current_providers || [],
            totalFindings: progressData.findings_count || 0,
            message: progressData.message || ''
          });

          lastUpdateRef.current = Date.now();
          setConnectionStatus('connected');
          stopPolling();

          if (progressData.status === 'completed' || progressData.status === 'error' || progressData.status === 'completed_partial') {
            setTimeout(() => clearActiveScan(), 5000);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useActiveScan] DB channel status:`, status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
          startPolling();
        }
      });

    // Subscribe to broadcast channel for immediate updates
    const broadcastChannel = supabase
      .channel(`scan_progress:${activeScan.scanId}`)
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        console.log('[useActiveScan] Broadcast provider_update:', payload.payload);
        lastUpdateRef.current = Date.now();
        setConnectionStatus('connected');
        stopPolling();
        
        // Refresh progress from DB to get full state
        fetchProgress();
      })
      .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
        console.log('[useActiveScan] Broadcast scan_complete:', payload.payload);
        setProgress(prev => prev ? {
          ...prev,
          status: payload.payload.status || 'completed',
          totalFindings: payload.payload.findingsCount || prev.totalFindings,
        } : null);
        
        setTimeout(() => clearActiveScan(), 5000);
      })
      .subscribe((status) => {
        console.log(`[useActiveScan] Broadcast channel status:`, status);
      });

    channelRef.current = dbChannel;

    // Start polling immediately as backup (faster initial updates)
    startPolling();

    // Heartbeat monitoring - switch to polling if no updates
    heartbeatIntervalRef.current = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
      
      if (timeSinceLastUpdate > 20000 && !pollingIntervalRef.current) {
        console.warn('[useActiveScan] No updates for 20s, ensuring polling is active');
        startPolling();
      }
    }, HEARTBEAT_INTERVAL);

    // Store broadcast channel for cleanup
    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  };

  // Subscribe to progress updates via database
  useEffect(() => {
    if (!activeScan?.scanId) {
      setConnectionStatus('disconnected');
      stopPolling();
      return;
    }

    // Fetch initial progress
    fetchProgress();
    
    // Setup realtime subscription
    setupRealtimeSubscription();

    return () => {
      console.log(`[useActiveScan] Cleaning up`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      stopPolling();
    };
  }, [activeScan?.scanId]);

  const startTracking = (scan: ActiveScan) => {
    setActiveScan(scan);
    setProgress(null);
    setIsMinimized(false);
    lastUpdateRef.current = Date.now();
  };

  const clearActiveScan = () => {
    setActiveScan(null);
    setProgress(null);
    stopPolling();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return {
    activeScan,
    progress,
    isMinimized,
    connectionStatus,
    startTracking,
    clearActiveScan,
    toggleMinimize,
  };
}
