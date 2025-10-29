import { supabase } from '@/integrations/supabase/client';

export async function queryPredictaSearch(
  query: string,
  queryType: 'email' | 'phone' | 'username' | 'name'
): Promise<{ success: boolean; provider: string; data?: any; error?: string; cached?: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('predicta-search', {
      body: { query, queryType },
    });

    if (error) {
      console.error('Predicta Search error:', error);
      return {
        success: false,
        provider: 'predictasearch',
        error: error.message,
      };
    }

    return {
      success: true,
      provider: 'predictasearch',
      data: data.data,
      cached: false,
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
