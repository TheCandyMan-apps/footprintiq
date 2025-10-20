import { supabase } from "@/integrations/supabase/client";

export interface TrendDataPoint {
  date: string;
  privacyScore: number;
  totalSources: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export const analyzeTrends = async (userId: string, days: number = 30): Promise<TrendDataPoint[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (scans || []).map(scan => ({
    date: new Date(scan.created_at).toLocaleDateString(),
    privacyScore: scan.privacy_score || 0,
    totalSources: scan.total_sources_found || 0,
    highRiskCount: scan.high_risk_count || 0,
    mediumRiskCount: scan.medium_risk_count || 0,
    lowRiskCount: scan.low_risk_count || 0
  }));
};

export const calculateTrendMetrics = (trends: TrendDataPoint[]) => {
  if (trends.length < 2) {
    return {
      privacyScoreTrend: 0,
      exposureTrend: 0,
      averageScore: 0,
      averageExposures: 0
    };
  }

  const first = trends[0];
  const last = trends[trends.length - 1];

  const privacyScoreTrend = last.privacyScore - first.privacyScore;
  const exposureTrend = last.totalSources - first.totalSources;

  const averageScore = trends.reduce((sum, t) => sum + t.privacyScore, 0) / trends.length;
  const averageExposures = trends.reduce((sum, t) => sum + t.totalSources, 0) / trends.length;

  return {
    privacyScoreTrend,
    exposureTrend,
    averageScore: Math.round(averageScore),
    averageExposures: Math.round(averageExposures)
  };
};
