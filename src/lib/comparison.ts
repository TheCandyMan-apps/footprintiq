import { supabase } from "@/integrations/supabase/client";

export interface ScanComparison {
  scanId: string;
  previousScanId: string;
  newSources: number;
  removedSources: number;
  unchangedSources: number;
  riskScoreChange: number;
  newFindings: any[];
  removedFindings: any[];
  improvements: string[];
  concerns: string[];
}

export const compareTwoScans = async (
  previousScanId: string,
  currentScanId: string
): Promise<ScanComparison> => {
  // Fetch both scans
  const [prevResult, currResult] = await Promise.all([
    supabase.from('scans').select('*').eq('id', previousScanId).single(),
    supabase.from('scans').select('*').eq('id', currentScanId).single()
  ]);

  if (prevResult.error || currResult.error) {
    throw new Error('Failed to fetch scans for comparison');
  }

  const previousScan = prevResult.data;
  const currentScan = currResult.data;

  // Fetch data sources for both
  const [prevSourcesResult, currSourcesResult] = await Promise.all([
    supabase.from('data_sources').select('*').eq('scan_id', previousScanId),
    supabase.from('data_sources').select('*').eq('scan_id', currentScanId)
  ]);

  const prevSources = prevSourcesResult.data || [];
  const currSources = currSourcesResult.data || [];

  // Compare sources
  const prevSourceNames = new Set(prevSources.map(s => s.name));
  const currSourceNames = new Set(currSources.map(s => s.name));

  const newFindings = currSources.filter(s => !prevSourceNames.has(s.name));
  const removedFindings = prevSources.filter(s => !currSourceNames.has(s.name));
  const unchangedSources = currSources.filter(s => prevSourceNames.has(s.name));

  // Calculate risk score change
  const riskScoreChange = (currentScan.privacy_score || 0) - (previousScan.privacy_score || 0);

  // Generate insights
  const improvements: string[] = [];
  const concerns: string[] = [];

  if (removedFindings.length > 0) {
    improvements.push(`${removedFindings.length} data source(s) removed`);
  }
  if (riskScoreChange > 0) {
    improvements.push(`Privacy score improved by ${riskScoreChange} points`);
  }

  if (newFindings.length > 0) {
    concerns.push(`${newFindings.length} new exposure(s) detected`);
  }
  if (riskScoreChange < 0) {
    concerns.push(`Privacy score decreased by ${Math.abs(riskScoreChange)} points`);
  }

  const highRiskNew = newFindings.filter(f => f.risk_level === 'high');
  if (highRiskNew.length > 0) {
    concerns.push(`${highRiskNew.length} high-risk exposure(s) found`);
  }

  return {
    scanId: currentScanId,
    previousScanId,
    newSources: newFindings.length,
    removedSources: removedFindings.length,
    unchangedSources: unchangedSources.length,
    riskScoreChange,
    newFindings,
    removedFindings,
    improvements,
    concerns
  };
};

export const getRecentComparisons = async (userId: string, limit: number = 5) => {
  const { data, error } = await supabase
    .from('scan_comparisons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};
