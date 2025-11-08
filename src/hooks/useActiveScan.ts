import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveScan {
  scanId: string;
  type: 'advanced' | 'username';
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

export function useActiveScan() {
  const [activeScan, setActiveScan] = useState<ActiveScan | null>(() => {
    const stored = localStorage.getItem(ACTIVE_SCAN_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Persist active scan to localStorage
  useEffect(() => {
    if (activeScan) {
      localStorage.setItem(ACTIVE_SCAN_KEY, JSON.stringify(activeScan));
    } else {
      localStorage.removeItem(ACTIVE_SCAN_KEY);
    }
  }, [activeScan]);

  // Subscribe to progress updates
  useEffect(() => {
    if (!activeScan?.scanId) return;

    const channelName = activeScan.type === 'username' 
      ? `scan_job:${activeScan.scanId}`
      : `scan_progress:${activeScan.scanId}`;

    console.log(`[useActiveScan] Subscribing to ${channelName}`);

    const channel = supabase.channel(channelName);
    
    channel
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        console.log('[useActiveScan] Progress update:', payload);
        setProgress(payload);

        // Auto-clear when completed
        if (payload.status === 'completed' || payload.status === 'error') {
          setTimeout(() => {
            clearActiveScan();
          }, 5000);
        }
      })
      .subscribe((status) => {
        console.log(`[useActiveScan] Channel ${channelName} status:`, status);
      });

    return () => {
      console.log(`[useActiveScan] Unsubscribing from ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [activeScan?.scanId, activeScan?.type]);

  const startTracking = (scan: ActiveScan) => {
    setActiveScan(scan);
    setProgress(null);
    setIsMinimized(false);
  };

  const clearActiveScan = () => {
    setActiveScan(null);
    setProgress(null);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return {
    activeScan,
    progress,
    isMinimized,
    startTracking,
    clearActiveScan,
    toggleMinimize,
  };
}
