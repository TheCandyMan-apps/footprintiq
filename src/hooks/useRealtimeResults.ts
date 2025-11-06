import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScanResultRow {
  job_id: string;
  line_no: number;
  ndjson: any;
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
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('job_id', jobId)
        .order('line_no', { ascending: true });

      if (error) throw error;
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
      .channel(`scan_results_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_results',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          setResults((prev) => [...prev, payload.new as ScanResultRow]);
        }
      )
      .subscribe();

    return channel;
  };

  return { results, loading };
}
