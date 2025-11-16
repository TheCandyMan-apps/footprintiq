import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Subscribe to progress updates via database
  useEffect(() => {
    if (!activeScan?.scanId) return;

    console.log(`[useActiveScan] Subscribing to progress for scan: ${activeScan.scanId}`);

    // Fetch initial progress (in case scan already started)
    const fetchInitialProgress = async () => {
      const { data, error } = await supabase
        .from('scan_progress')
        .select('*')
        .eq('scan_id', activeScan.scanId)
        .maybeSingle();
      
      if (data && !error) {
        setProgress({
          status: data.status,
          completedProviders: data.completed_providers || 0,
          totalProviders: data.total_providers || 0,
          currentProviders: data.current_providers || [],
          totalFindings: data.findings_count || 0,
          message: data.message || ''
        });
      }
    };
    
    fetchInitialProgress();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`scan_progress_updates_${activeScan.scanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_progress',
          filter: `scan_id=eq.${activeScan.scanId}`
        },
        (payload) => {
          console.log('[useActiveScan] Progress update:', payload);
          const progressData = payload.new as any;
          
          setProgress({
            status: progressData.status,
            completedProviders: progressData.completed_providers || 0,
            totalProviders: progressData.total_providers || 0,
            currentProviders: progressData.current_providers || [],
            totalFindings: progressData.findings_count || 0,
            message: progressData.message || ''
          });

          // Auto-clear when completed
          if (progressData.status === 'completed' || progressData.status === 'error') {
            setTimeout(() => {
              clearActiveScan();
            }, 5000);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useActiveScan] Channel status:`, status);
      });

    return () => {
      console.log(`[useActiveScan] Unsubscribing`);
      supabase.removeChannel(channel);
    };
  }, [activeScan?.scanId]);

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
