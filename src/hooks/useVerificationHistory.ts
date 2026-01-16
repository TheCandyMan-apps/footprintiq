import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VerificationHistoryItem {
  id: string;
  finding_id: string | null;
  scan_id: string;
  verification_hash: string;
  confidence_score: number;
  hashed_content: string | null;
  source_age: string | null;
  ssl_status: string | null;
  platform_consistency: string | null;
  verified_at: string;
  created_at: string;
  raw_response: Record<string, unknown> | null;
}

export interface UseVerificationHistoryReturn {
  history: VerificationHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVerificationHistory(scanId?: string, limit: number = 50): UseVerificationHistoryReturn {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('evidence_ledger')
        .select('*')
        .order('verified_at', { ascending: false })
        .limit(limit);

      if (scanId) {
        query = query.eq('scan_id', scanId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setHistory((data as VerificationHistoryItem[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch verification history';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [scanId, limit]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
