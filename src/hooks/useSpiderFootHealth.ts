import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpiderFootHealth {
  status: 'ok' | 'not_configured' | 'unreachable';
  configured: boolean;
  url?: string;
  has_api_key?: boolean;
  reachable?: boolean;
  message: string;
  error?: string;
  http_status?: number;
}

export function useSpiderFootHealth() {
  const [health, setHealth] = useState<SpiderFootHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('spiderfoot-health');
      
      if (invokeError) {
        throw invokeError;
      }

      setHealth(data as SpiderFootHealth);
    } catch (err) {
      console.error('[useSpiderFootHealth] Error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setHealth({
        status: 'not_configured',
        configured: false,
        message: 'Failed to check SpiderFoot status'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    health,
    loading,
    error,
    refetch: checkHealth,
    isConfigured: health?.status === 'ok'
  };
}
