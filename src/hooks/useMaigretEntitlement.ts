import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type MaigretPlan = 'standard' | 'premium';

export interface MaigretEntitlement {
  plan: MaigretPlan;
  timeout: number;
  dailyJobs: number;
  allowArtifacts: boolean;
  defaultAllSites: boolean;
}

const PLAN_CONFIG: Record<MaigretPlan, Omit<MaigretEntitlement, 'plan'>> = {
  standard: {
    timeout: 600, // 10 minutes
    dailyJobs: 30,
    allowArtifacts: false,
    defaultAllSites: false,
  },
  premium: {
    timeout: 1800, // 30 minutes
    dailyJobs: 200,
    allowArtifacts: true,
    defaultAllSites: true,
  },
};

export function useMaigretEntitlement() {
  const [entitlement, setEntitlement] = useState<MaigretEntitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEntitlement();
  }, []);

  const loadEntitlement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Try to get existing entitlement
      const { data: existing } = await supabase
        .from('user_entitlements')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      let plan: MaigretPlan = (existing?.plan as MaigretPlan) || 'standard';

      // If no entitlement exists, create one
      if (!existing) {
        await supabase.from('user_entitlements').insert({
          user_id: user.id,
          plan: 'standard',
        });
      }

      const config = PLAN_CONFIG[plan];
      setEntitlement({ plan, ...config });
    } catch (error) {
      console.error('Failed to load entitlement:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
      // Default to standard on error
      setEntitlement({ plan: 'standard', ...PLAN_CONFIG.standard });
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_entitlements')
        .upsert({
          user_id: user.id,
          plan: 'premium',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Upgraded to Premium',
        description: 'You now have access to premium features',
      });

      await loadEntitlement();
      return true;
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: 'Upgrade Failed',
        description: 'Failed to upgrade to premium',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    entitlement,
    loading,
    isPremium: entitlement?.plan === 'premium',
    upgradeToPremium,
    refresh: loadEntitlement,
  };
}
