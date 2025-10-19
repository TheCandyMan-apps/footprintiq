export interface GlobalMetrics {
  totalScans: number;
  totalExposures: number;
  averageRiskScore: number;
  topCategories: { name: string; count: number }[];
  regionData: { country: string; exposures: number; scans: number }[];
  industryData: { industry: string; avgRisk: number; count: number }[];
}

export interface TrendDataPoint {
  date: string;
  scans: number;
  exposures: number;
  avgRisk: number;
}

export const calculateGlobalRiskIndex = (data: GlobalMetrics): number => {
  if (!data.totalScans) return 0;
  return Math.round(data.averageRiskScore);
};

export const getTopExposureTypes = (categories: { name: string; count: number }[]): { name: string; count: number }[] => {
  return categories
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const formatRegionData = (regionData: { country: string; exposures: number; scans: number }[]) => {
  return regionData.map(region => ({
    ...region,
    exposureRate: region.scans > 0 ? (region.exposures / region.scans).toFixed(2) : "0.00"
  }));
};
