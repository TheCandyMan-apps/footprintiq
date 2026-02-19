import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyMRRPoint {
  month: string;
  proCount: number;
  mrr: number; // estimated £/month
}

export interface SubscriptionConversionData {
  totalFree: number;
  totalPro: number;
  totalEnterprise: number;
  conversionRate: number;
  mrrTrend: MonthlyMRRPoint[];
  estimatedMRR: number;
}

// Price assumptions (GBP)
const PRO_MONTHLY_PRICE = 9.99;
const ENTERPRISE_MONTHLY_PRICE = 49.99;

export function useSubscriptionConversion(dateRange: { start: Date; end: Date } | null = null) {
  return useQuery<SubscriptionConversionData>({
    queryKey: ['subscription-conversion', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      // --- Current snapshot from user_roles ---
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('subscription_tier');

      if (rolesError) {
        console.warn('Subscription conversion: user_roles query failed:', rolesError);
      }

      const allRoles = roles || [];
      const totalFree = allRoles.filter(r => !r.subscription_tier || r.subscription_tier === 'free').length;
      const totalPro = allRoles.filter(r => r.subscription_tier === 'pro').length;
      const totalEnterprise = allRoles.filter(r => r.subscription_tier === 'enterprise').length;
      const totalPaid = totalPro + totalEnterprise;
      const totalAll = totalFree + totalPaid;
      const conversionRate = totalAll > 0 ? (totalPaid / totalAll) * 100 : 0;
      const estimatedMRR = (totalPro * PRO_MONTHLY_PRICE) + (totalEnterprise * ENTERPRISE_MONTHLY_PRICE);

      // --- MRR trend from workspaces (created_at as proxy for conversion date) ---
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('subscription_tier, created_at')
        .in('subscription_tier', ['pro', 'enterprise', 'premium']);

      if (workspacesError) {
        console.warn('Subscription conversion: workspaces query failed:', workspacesError);
      }

      // Group by month
      const monthMap: Record<string, { pro: number; enterprise: number }> = {};

      for (const ws of workspaces || []) {
        if (!ws.created_at) continue;
        const d = new Date(ws.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) monthMap[key] = { pro: 0, enterprise: 0 };
        if (ws.subscription_tier === 'enterprise' || ws.subscription_tier === 'premium') {
          monthMap[key].enterprise += 1;
        } else {
          monthMap[key].pro += 1;
        }
      }

      const mrrTrend: MonthlyMRRPoint[] = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, counts]) => ({
          month,
          proCount: counts.pro + counts.enterprise,
          mrr: Math.round((counts.pro * PRO_MONTHLY_PRICE + counts.enterprise * ENTERPRISE_MONTHLY_PRICE) * 100) / 100,
        }));

      return {
        totalFree,
        totalPro,
        totalEnterprise,
        conversionRate,
        mrrTrend,
        estimatedMRR,
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });
}
