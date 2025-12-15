import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Artifact {
  id: string;
  artifact_type: string;
  file_url: string;
  signed_url: string | null;
  file_size_bytes: number | null;
  generated_at: string;
  downloaded_at: string | null;
}

export function useArtifactGeneration(scanId: string | undefined) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch existing artifacts
  useEffect(() => {
    if (!scanId) return;

    const fetchArtifacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('scan_artifacts')
        .select('*')
        .eq('scan_id', scanId)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching artifacts:', error);
      } else {
        setArtifacts(data || []);
      }
      setLoading(false);
    };

    fetchArtifacts();

    // Subscribe to realtime updates for new artifacts
    const channel = supabase
      .channel(`artifacts:${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_artifacts',
          filter: `scan_id=eq.${scanId}`
        },
        (payload) => {
          setArtifacts((prev) => [payload.new as Artifact, ...prev]);
          setIsGenerating(false);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [scanId]);

  const generateArtifacts = async (artifactTypes: string[] = ['csv', 'json', 'html', 'txt', 'pdf']) => {
    if (!scanId) return;

    setIsGenerating(true);
    
    // Set a timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Generation Timeout',
        description: 'Artifact generation took too long. Please try again.',
        variant: 'destructive'
      });
    }, 60000); // 60 second timeout

    try {
      const { data, error } = await supabase.functions.invoke('generate-export-artifacts', {
        body: { scanId, artifacts: artifactTypes }
      });

      clearTimeout(timeout);

      if (error) {
        console.error('Artifact generation error:', error);
        toast({
          title: 'Artifact Generation Failed',
          description: error.message || 'Failed to generate export artifacts',
          variant: 'destructive'
        });
        setIsGenerating(false);
      } else if (data?.artifacts?.length > 0) {
        // If we got artifacts back directly, update state immediately
        setArtifacts(prev => [...data.artifacts.map((a: any) => ({
          id: crypto.randomUUID(),
          artifact_type: a.type,
          file_url: a.fileName,
          signed_url: a.url,
          file_size_bytes: a.size,
          generated_at: new Date().toISOString(),
          downloaded_at: null
        })), ...prev]);
        setIsGenerating(false);
        toast({
          title: 'Artifacts Generated',
          description: `${data.artifacts.length} file(s) ready for download`
        });
      } else {
        toast({
          title: 'Generating Artifacts',
          description: 'Your export files are being generated...'
        });
        // Set a secondary timeout in case realtime doesn't fire
        setTimeout(() => {
          setIsGenerating(false);
        }, 30000);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Error invoking artifact generation:', err);
      toast({
        title: 'Error',
        description: 'Failed to start artifact generation',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  };

  return {
    artifacts,
    isGenerating,
    loading,
    generateArtifacts
  };
}
