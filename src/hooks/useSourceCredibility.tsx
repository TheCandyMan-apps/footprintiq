import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SourceCredibility {
  id: string;
  provider_name: string;
  credibility_score: number;
  confidence: number;
  reasoning: string;
  data_quality_score: number;
  verification_method: string;
  verified_at: string;
}

export function useSourceCredibility(scanId: string | undefined) {
  return useQuery({
    queryKey: ['source-credibility', scanId],
    queryFn: async () => {
      if (!scanId) return [];

      const { data, error } = await supabase
        .from('source_credibility')
        .select('*')
        .eq('scan_id', scanId)
        .order('credibility_score', { ascending: false });

      if (error) throw error;
      return data as SourceCredibility[];
    },
    enabled: !!scanId,
  });
}

export async function requestCredibilityAnalysis(
  scanId: string,
  providers: string[],
  resultsData: Record<string, any>
) {
  const { data, error } = await supabase.functions.invoke('ai-credibility-scorer', {
    body: { scanId, providers, resultsData }
  });

  if (error) throw error;
  return data;
}
