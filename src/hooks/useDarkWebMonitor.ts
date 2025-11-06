import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DarkWebMonitorSettings {
  enabled: boolean;
  userId: string | null;
}

export const useDarkWebMonitor = () => {
  const { toast } = useToast();
  const [newFindingsCount, setNewFindingsCount] = useState(0);
  const [settings, setSettings] = useState<DarkWebMonitorSettings>({
    enabled: false,
    userId: null,
  });

  useEffect(() => {
    // Check if monitoring is enabled
    const checkSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const enabled = localStorage.getItem(`darkweb_monitor_${session.user.id}`) === 'true';
      setSettings({
        enabled,
        userId: session.user.id,
      });

      if (enabled) {
        fetchNewFindings(session.user.id);
        subscribeToFindings(session.user.id);
      }
    };

    checkSettings();
  }, []);

  const fetchNewFindings = async (userId: string) => {
    try {
      // Check if snoozed
      const snoozed = localStorage.getItem(`darkweb_snooze_${userId}`);
      if (snoozed) {
        const snoozeDate = new Date(snoozed);
        if (snoozeDate > new Date()) {
          setNewFindingsCount(0);
          return;
        }
      }

      const { data, error } = await supabase
        .from('darkweb_findings')
        .select('id')
        .eq('user_id', userId)
        .eq('is_new', true);

      if (error) throw error;
      setNewFindingsCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching new findings:', error);
    }
  };

  const subscribeToFindings = (userId: string) => {
    const channel = supabase
      .channel('darkweb-findings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'darkweb_findings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New dark web finding:', payload);
          
          // Check if snoozed
          const snoozed = localStorage.getItem(`darkweb_snooze_${userId}`);
          if (snoozed) {
            const snoozeDate = new Date(snoozed);
            if (snoozeDate > new Date()) {
              return;
            }
          }

          setNewFindingsCount((prev) => prev + 1);
          
          // Show notification
          toast({
            title: '🚨 New Dark Web Finding',
            description: `A new ${payload.new.severity} severity finding has been detected`,
            variant: 'destructive',
          });

          // Browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Dark Web Alert', {
              body: `New ${payload.new.severity} severity finding detected`,
              icon: '/favicon.ico',
              tag: 'darkweb-alert',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleMonitoring = async (enabled: boolean) => {
    if (!settings.userId) return;

    localStorage.setItem(`darkweb_monitor_${settings.userId}`, enabled.toString());
    setSettings((prev) => ({ ...prev, enabled }));

    if (enabled) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      fetchNewFindings(settings.userId);
      subscribeToFindings(settings.userId);
      
      toast({
        title: 'Dark Web Monitoring Enabled',
        description: "You'll be notified of any new findings",
      });
    } else {
      setNewFindingsCount(0);
      toast({
        title: 'Dark Web Monitoring Disabled',
        description: 'Monitoring has been turned off',
      });
    }
  };

  const clearNewCount = () => {
    setNewFindingsCount(0);
  };

  return {
    enabled: settings.enabled,
    newFindingsCount,
    toggleMonitoring,
    clearNewCount,
    userId: settings.userId,
  };
};
