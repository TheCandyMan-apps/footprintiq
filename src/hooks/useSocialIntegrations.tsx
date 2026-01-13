import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SocialIntegration {
  id: string;
  platform: string;
  platform_username?: string;
  last_scan_at?: string;
  metadata?: Record<string, any>;
}

export function useSocialIntegrations() {
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['social-integrations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('social_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SocialIntegration[];
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const { error } = await (supabase as any)
        .from('social_integrations')
        .delete()
        .eq('platform', platform.toLowerCase());

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-integrations'] });
    },
  });

  const isConnected = (platform: string) => {
    return integrations.some(
      (integration) => (integration.platform || '').toLowerCase() === platform.toLowerCase()
    );
  };

  const getIntegration = (platform: string) => {
    return integrations.find(
      (integration) => (integration.platform || '').toLowerCase() === platform.toLowerCase()
    );
  };

  return {
    integrations,
    isLoading,
    isConnected,
    getIntegration,
    disconnect: disconnectMutation.mutate,
  };
}
