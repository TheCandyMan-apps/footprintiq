import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PredictaNetwork {
  id: string;
  name: string;
  type: string;
  supportedInputs: string[];
  supportedOutputs: string[];
}

export interface PredictaSearchResult {
  profiles: any[];
  breaches: any[];
  leaks: any[];
  summary: {
    profiles: number;
    breaches: number;
    leaks: number;
    total: number;
  };
}

export function usePredictaSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [networks, setNetworks] = useState<PredictaNetwork[]>([]);
  const [networksLoading, setNetworksLoading] = useState(false);
  const [result, setResult] = useState<PredictaSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworks = useCallback(async () => {
    setNetworksLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('predicta-search', {
        body: { action: 'getNetworks' },
      });

      if (fnError) {
        console.error('Error fetching Predicta networks:', fnError);
        setError(fnError.message);
        return [];
      }

      if (data?.success && data?.data?.networks) {
        setNetworks(data.data.networks);
        return data.data.networks;
      }

      return [];
    } catch (err) {
      console.error('Exception fetching Predicta networks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch networks');
      return [];
    } finally {
      setNetworksLoading(false);
    }
  }, []);

  const search = useCallback(async (
    query: string,
    queryType: 'email' | 'phone' | 'username' | 'name',
    selectedNetworks?: string[]
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('predicta-search', {
        body: { 
          query, 
          queryType,
          networks: selectedNetworks || ['all']
        },
      });

      if (fnError) {
        console.error('Predicta Search error:', fnError);
        setError(fnError.message);
        toast.error('Search failed', { description: fnError.message });
        return null;
      }

      if (!data?.success) {
        const errorMsg = data?.message || data?.error || 'Search failed';
        setError(errorMsg);
        
        if (data?.error === 'quota_exhausted') {
          toast.error('API Quota Exhausted', {
            description: 'Predicta Search credits are depleted. Please try again later.',
          });
        } else if (data?.error === 'rate_limited') {
          toast.error('Rate Limited', {
            description: 'Too many requests. Please wait a few minutes.',
          });
        } else {
          toast.error('Search Failed', { description: errorMsg });
        }
        return null;
      }

      const searchResult: PredictaSearchResult = {
        profiles: data.data?.profiles || [],
        breaches: data.data?.breaches || [],
        leaks: data.data?.leaks || [],
        summary: data.summary || {
          profiles: data.data?.profiles?.length || 0,
          breaches: data.data?.breaches?.length || 0,
          leaks: data.data?.leaks?.length || 0,
          total: (data.data?.profiles?.length || 0) + (data.data?.breaches?.length || 0) + (data.data?.leaks?.length || 0),
        },
      };

      setResult(searchResult);
      
      if (searchResult.summary.total > 0) {
        toast.success('Search Complete', {
          description: `Found ${searchResult.summary.profiles} profiles, ${searchResult.summary.breaches} breaches, ${searchResult.summary.leaks} leaks`,
        });
      } else {
        toast.info('No Results', {
          description: 'No profiles, breaches, or leaks found for this query.',
        });
      }

      return searchResult;
    } catch (err) {
      console.error('Predicta Search exception:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      toast.error('Search Error', { description: errorMsg });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    search,
    fetchNetworks,
    reset,
    isLoading,
    networks,
    networksLoading,
    result,
    error,
  };
}
