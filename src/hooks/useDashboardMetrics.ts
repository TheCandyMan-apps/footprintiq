import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['dashboard-metrics', days],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { days }
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
