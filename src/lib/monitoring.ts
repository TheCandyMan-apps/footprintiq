import { supabase } from "@/integrations/supabase/client";

export interface MonitoringAlert {
  id: string;
  user_id: string;
  scan_id: string;
  alert_type: 'new_breach' | 'new_source' | 'risk_increase';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

export const enableMonitoring = async (scanId: string, userId: string) => {
  // In production, this would set up a background job
  // For now, we'll create a monitoring record
  const { data, error } = await supabase
    .from('scan_comparisons')
    .insert({
      user_id: userId,
      first_scan_id: scanId,
      latest_scan_id: scanId,
      sources_removed: 0,
      improvement_percentage: 0
    })
    .select()
    .single();

  return { data, error };
};

export const checkForNewFindings = async (userId: string, previousScanId: string, currentScanId: string) => {
  // Compare two scans and identify new findings
  const { data: previousSources } = await supabase
    .from('data_sources')
    .select('*')
    .eq('scan_id', previousScanId);

  const { data: currentSources } = await supabase
    .from('data_sources')
    .select('*')
    .eq('scan_id', currentScanId);

  if (!previousSources || !currentSources) return { newFindings: [], removedFindings: [] };

  const previousIds = new Set(previousSources.map(s => s.name));
  const currentIds = new Set(currentSources.map(s => s.name));

  const newFindings = currentSources.filter(s => !previousIds.has(s.name));
  const removedFindings = previousSources.filter(s => !currentIds.has(s.name));

  return { newFindings, removedFindings };
};

export const calculateImprovementScore = (previousCount: number, currentCount: number): number => {
  if (previousCount === 0) return 0;
  const improvement = ((previousCount - currentCount) / previousCount) * 100;
  return Math.max(0, Math.min(100, Math.round(improvement)));
};