import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export function useActivityLogs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      console.log('[ActivityLogs] Fetching activity logs...');
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[ActivityLogs] Error fetching logs:', error);
        throw error;
      }
      
      console.log('[ActivityLogs] Fetched', data?.length || 0, 'logs');
      
      // Fetch user emails separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.user_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .in('user_id', userIds);
        
        if (profileError) {
          console.error('[ActivityLogs] Error fetching profiles:', profileError);
        }
        
        const profileMap = new Map(
          profiles?.map(p => [p.user_id, p]) || []
        );
        
        return data.map(log => ({
          ...log,
          profile: profileMap.get(log.user_id),
        }));
      }
      
      return data || [];
    },
    retry: 1,
  });

  if (error) {
    console.error('[ActivityLogs] Query error:', error);
  }

  return {
    logs,
    loading: isLoading,
    error,
  };
}
