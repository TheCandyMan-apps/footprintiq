import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { PlanId, getPlanConfig, getDefaultPlan } from '@/config/billing';

export interface SubscriptionData {
  plan: PlanId;
  status: 'inactive' | 'active' | 'past_due' | 'canceled';
  scanLimit: number;
  scansUsed: number;
  currentPeriodEnd: string | null;
  isActive: boolean;
  canScan: boolean;
  stripeCustomerId: string | null;
}

export function useSubscription() {
  const { currentWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['subscription', currentWorkspace?.id],
    queryFn: async (): Promise<SubscriptionData> => {
      if (!currentWorkspace?.id) {
        // Return default free plan
        const defaultPlan = getDefaultPlan();
        return {
          plan: 'free',
          status: 'inactive',
          scanLimit: defaultPlan.monthlyScanLimit,
          scansUsed: 0,
          currentPeriodEnd: null,
          isActive: false,
          canScan: true,
          stripeCustomerId: null,
        };
      }

      // Query subscription for workspace
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (error || !data) {
        // No subscription found, return free plan defaults
        const defaultPlan = getDefaultPlan();
        return {
          plan: 'free',
          status: 'inactive',
          scanLimit: defaultPlan.monthlyScanLimit,
          scansUsed: 0,
          currentPeriodEnd: null,
          isActive: false,
          canScan: true,
          stripeCustomerId: null,
        };
      }

      // Return subscription data
      return {
        plan: data.plan as PlanId,
        status: data.status as 'inactive' | 'active' | 'past_due' | 'canceled',
        scanLimit: data.scan_limit_monthly,
        scansUsed: data.scans_used_monthly,
        currentPeriodEnd: data.current_period_end,
        isActive: data.status === 'active',
        canScan: data.scans_used_monthly < data.scan_limit_monthly,
        stripeCustomerId: data.stripe_customer_id,
      };
    },
    enabled: !!currentWorkspace?.id,
    staleTime: 30000, // 30 seconds
  });
}

export function usePlanConfig() {
  const { data: subscription } = useSubscription();
  
  if (!subscription) {
    return getDefaultPlan();
  }

  return getPlanConfig(subscription.plan);
}
