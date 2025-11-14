import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSocialMediaFindings() {
  const queryClient = useQueryClient();

  const { data: findings, isLoading } = useQuery({
    queryKey: ['social-media-findings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('social_media_findings')
        .select('*')
        .order('discovered_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const scanPlatform = useMutation({
    mutationFn: async (platform: string) => {
      const { data, error } = await supabase.functions.invoke('social-media-scan', {
        body: { platform },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-media-findings'] });
      toast.success(`Scan complete! Found ${data.findings_count} findings`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Scan failed');
    },
  });

  const deleteFindings = useMutation({
    mutationFn: async (platform: string) => {
      const { error } = await (supabase as any)
        .from('social_media_findings')
        .delete()
        .eq('platform', platform);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-findings'] });
      toast.success('Findings cleared');
    },
  });

  return {
    findings,
    isLoading,
    scanPlatform: scanPlatform.mutate,
    isScanning: scanPlatform.isPending,
    deleteFindings: deleteFindings.mutate,
  };
}
