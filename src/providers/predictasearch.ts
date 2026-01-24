import { supabase } from '@/integrations/supabase/client';

export interface PredictaSearchResponse {
  success: boolean;
  provider: string;
  data?: {
    profiles?: any[];
    breaches?: any[];
    leaks?: any[];
  };
  summary?: {
    profiles: number;
    breaches: number;
    leaks: number;
    total: number;
  };
  error?: string;
  cached?: boolean;
}

export async function queryPredictaSearch(
  query: string,
  queryType: 'email' | 'phone' | 'username' | 'name',
  networks?: string[]
): Promise<PredictaSearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('predicta-search', {
      body: { query, queryType, networks: networks || ['all'] },
    });

    if (error) {
      console.error('Predicta Search error:', error);
      return {
        success: false,
        provider: 'predictasearch',
        error: error.message,
      };
    }

    if (!data?.success) {
      return {
        success: false,
        provider: 'predictasearch',
        error: data?.message || data?.error || 'Unknown error',
      };
    }

    return {
      success: true,
      provider: 'predictasearch',
      data: data.data,
      summary: data.summary,
      cached: data.cached || false,
    };
  } catch (error) {
    console.error('Predicta Search exception:', error);
    return {
      success: false,
      provider: 'predictasearch',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function fetchPredictaNetworks(): Promise<{
  success: boolean;
  networks: Array<{
    id: string;
    name: string;
    type: string;
    supportedInputs: string[];
    supportedOutputs: string[];
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('predicta-search', {
      body: { action: 'getNetworks' },
    });

    if (error) {
      console.error('Predicta Networks error:', error);
      return { success: false, networks: [], error: error.message };
    }

    if (!data?.success) {
      return { success: false, networks: [], error: data?.error || 'Failed to fetch networks' };
    }

    return {
      success: true,
      networks: data.data?.networks || [],
    };
  } catch (error) {
    console.error('Predicta Networks exception:', error);
    return {
      success: false,
      networks: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
