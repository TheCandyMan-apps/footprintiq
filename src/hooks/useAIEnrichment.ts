import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';

interface QuickAnalysisData {
  summary: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  immediate_action: string;
}

interface EnrichmentData {
  context: string;
  links: Array<{ title: string; url: string; description?: string }>;
  remediation_steps: string[];
  attack_vectors: string[];
}

export function useAIEnrichment(findingId: string) {
  const { workspace } = useWorkspace();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<QuickAnalysisData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentOpen, setEnrichmentOpen] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);

  const handleQuickAnalysis = async () => {
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisOpen(true);
    setAnalysisData(null);

    try {
      const { data, error } = await supabase.functions.invoke('quick-analysis', {
        body: {
          findingId,
          workspaceId: workspace.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 2 credits, have ${data.balance}`);
        } else if (data.error === 'rate_limit_exceeded') {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Analysis failed: ${data.error}`);
        }
        setAnalysisOpen(false);
        return;
      }

      setAnalysisData(data.analysis);
      toast.success('Quick analysis complete! (2 credits used)');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze finding');
      setAnalysisOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeepEnrichment = async () => {
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsEnriching(true);
    setEnrichmentOpen(true);
    setEnrichmentData(null);

    try {
      const { data, error } = await supabase.functions.invoke('enrich-finding', {
        body: {
          findingId,
          workspaceId: workspace.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 5 credits, have ${data.balance}`);
        } else if (data.error === 'rate_limit_exceeded') {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Enrichment failed: ${data.error}`);
        }
        setEnrichmentOpen(false);
        return;
      }

      setEnrichmentData(data.enrichment);
      toast.success('Deep enrichment complete! (5 credits used)');
    } catch (error: any) {
      console.error('Enrichment error:', error);
      toast.error('Failed to enrich finding');
      setEnrichmentOpen(false);
    } finally {
      setIsEnriching(false);
    }
  };

  return {
    isAnalyzing,
    analysisOpen,
    setAnalysisOpen,
    analysisData,
    handleQuickAnalysis,
    isEnriching,
    enrichmentOpen,
    setEnrichmentOpen,
    enrichmentData,
    handleDeepEnrichment,
  };
}
