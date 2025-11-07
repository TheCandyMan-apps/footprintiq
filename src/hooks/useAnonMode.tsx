import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnonMode() {
  const [anonModeEnabled, setAnonModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnonModeStatus();
  }, []);

  const fetchAnonModeStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('anon_mode_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAnonModeEnabled(data?.anon_mode_enabled || false);
    } catch (error) {
      console.error('Error fetching anon mode status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnonMode = async (enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ anon_mode_enabled: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setAnonModeEnabled(enabled);
      toast({
        title: enabled ? "Anonymous Mode Enabled" : "Anonymous Mode Disabled",
        description: enabled 
          ? "Your scans will now be routed through proxies"
          : "Your scans will use direct connections",
      });
    } catch (error) {
      console.error('Error toggling anon mode:', error);
      toast({
        title: "Error",
        description: "Failed to update anonymous mode setting",
        variant: "destructive",
      });
    }
  };

  return {
    anonModeEnabled,
    toggleAnonMode,
    isLoading,
  };
}
