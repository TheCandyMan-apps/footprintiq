import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutSession {
  id: string;
  stripe_session_id: string;
  user_id: string;
  workspace_id: string;
  plan: string;
  status: string;
  amount_total: number | null;
  currency: string | null;
  created_at: string;
  completed_at: string | null;
  expired_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AbandonedCheckoutMetrics {
  totalInitiated: number;
  totalCompleted: number;
  totalAbandoned: number;
  totalExpired: number;
  totalPending: number;
  abandonmentRate: number;
  completionRate: number;
  byPlan: {
    plan: string;
    initiated: number;
    completed: number;
    abandoned: number;
    completionRate: number;
  }[];
  recentAbandoned: CheckoutSession[];
}

export function useAbandonedCheckouts(dateRange: { start: Date; end: Date } | null = null) {
  return useQuery({
    queryKey: ['abandoned-checkouts', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<AbandonedCheckoutMetrics> => {
      const startDate = dateRange?.start || new Date('2020-01-01');
      const endDate = dateRange?.end || new Date();

      const { data: sessions, error } = await supabase
        .from('checkout_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch checkout sessions:', error.message);
      }

      const allSessions = (sessions || []) as CheckoutSession[];

      // Mark sessions older than 24h that are still "pending" as abandoned
      const now = new Date();
      const effectiveSessions = allSessions.map(s => {
        if (s.status === 'pending') {
          const age = now.getTime() - new Date(s.created_at).getTime();
          const hoursOld = age / (1000 * 60 * 60);
          if (hoursOld > 24) {
            return { ...s, status: 'abandoned' };
          }
        }
        return s;
      });

      const totalInitiated = effectiveSessions.length;
      const totalCompleted = effectiveSessions.filter(s => s.status === 'completed').length;
      const totalExpired = effectiveSessions.filter(s => s.status === 'expired').length;
      const totalPending = effectiveSessions.filter(s => s.status === 'pending').length;
      const totalAbandoned = effectiveSessions.filter(s => s.status === 'abandoned' || s.status === 'expired').length;

      const abandonmentRate = totalInitiated > 0 ? (totalAbandoned / totalInitiated) * 100 : 0;
      const completionRate = totalInitiated > 0 ? (totalCompleted / totalInitiated) * 100 : 0;

      // Group by plan
      const plans = [...new Set(effectiveSessions.map(s => s.plan))];
      const byPlan = plans.map(plan => {
        const planSessions = effectiveSessions.filter(s => s.plan === plan);
        const initiated = planSessions.length;
        const completed = planSessions.filter(s => s.status === 'completed').length;
        const abandoned = planSessions.filter(s => s.status === 'abandoned' || s.status === 'expired').length;
        return {
          plan,
          initiated,
          completed,
          abandoned,
          completionRate: initiated > 0 ? (completed / initiated) * 100 : 0,
        };
      });

      // Get recent abandoned/expired sessions (limit 10)
      const recentAbandoned = effectiveSessions
        .filter(s => s.status === 'abandoned' || s.status === 'expired' || s.status === 'pending')
        .slice(0, 10);

      return {
        totalInitiated,
        totalCompleted,
        totalAbandoned,
        totalExpired,
        totalPending,
        abandonmentRate,
        completionRate,
        byPlan,
        recentAbandoned,
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });
}
