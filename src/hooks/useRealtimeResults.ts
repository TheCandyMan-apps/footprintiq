import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScanResultRow {
  id: string;
  scan_id: string;
  provider: string;
  kind: string;
  severity: string;
  site?: string;
  url?: string;
  status?: string;
  evidence: any;
  meta?: any;
  created_at: string;
}

export function useRealtimeResults(jobId: string | null) {
  const [results, setResults] = useState<ScanResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    loadInitialResults();
    const channel = setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [jobId]);

  const loadInitialResults = async () => {
    if (!jobId) return;

    try {
      // Query the findings table (new advanced scan pipeline)
      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('scan_id', jobId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log(`[useRealtimeResults] Loaded ${data?.length || 0} findings for scan ${jobId}`);
      setResults(data || []);
    } catch (error) {
      console.error('Failed to load initial results:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    if (!jobId) return null;

    const channel = supabase
      .channel(`findings_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'findings',
          filter: `scan_id=eq.${jobId}`,
        },
        (payload) => {
          console.log('[useRealtimeResults] New finding received:', payload.new);
          setResults((prev) => [...prev, payload.new as ScanResultRow]);
        }
      )
      .subscribe();

    return channel;
  };

  return { results, loading };
}
