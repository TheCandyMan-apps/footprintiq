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

  // Fetch progress from database
  const fetchProgress = async () => {
    if (!activeScan?.scanId) return null;

    try {
      const { data, error } = await supabase
        .from('scan_progress')
        .select('*')
        .eq('scan_id', activeScan.scanId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const progressData = {
          status: data.status,
          completedProviders: data.completed_providers || 0,
          totalProviders: data.total_providers || 0,
          currentProviders: data.current_providers || [],
          totalFindings: data.findings_count || 0,
          message: data.message || ''
        };
        setProgress(progressData);
        lastUpdateRef.current = Date.now();
        return progressData;
      }
      return null;
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
      
      if (progressData && (progressData.status === 'completed' || progressData.status === 'error')) {
        stopPolling();
        setTimeout(() => {
          clearActiveScan();
        }, 5000);
      }
    }, POLLING_INTERVAL);
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
