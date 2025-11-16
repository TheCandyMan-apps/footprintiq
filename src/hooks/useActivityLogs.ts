import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  organization_id: string | null;
  created_at: string;
  user_email?: string;
}

export function useActivityLogs(limit = 50) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    subscribeToLogs();
  }, [limit]);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Enrich with user emails
      const enrichedLogs = await Promise.all(
        (data || []).map(async (log) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', log.user_id)
              .single();
            
            return {
              ...log,
              user_email: profile?.email || 'Unknown'
            };
          } catch {
            return { ...log, user_email: 'Unknown' };
          }
        })
      );

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLogs = () => {
    const channel = supabase
      .channel('activity_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        async (payload) => {
          // Enrich new log with user email
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', payload.new.user_id)
              .single();
            
            const enrichedLog = {
              ...payload.new as ActivityLog,
              user_email: profile?.email || 'Unknown'
            };
            
            setLogs((prev) => [enrichedLog, ...prev].slice(0, limit));
          } catch {
            setLogs((prev) => [payload.new as ActivityLog, ...prev].slice(0, limit));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const logActivity = async (action: string, entity_type: string, metadata?: any, entity_id?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        entity_type,
        entity_id: entity_id || null,
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logs, loading, logActivity, refetch: loadLogs };
}
