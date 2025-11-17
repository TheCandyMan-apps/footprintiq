import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Matches new billing tiers + legacy support
export type SubscriptionTier = 'free' | 'pro' | 'business' | 'analyst' | 'premium' | 'enterprise' | 'family';

interface SubscriptionContextType {
  user: User | null;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  isLoading: boolean;
  isPremium: boolean;
  isProOrHigher: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubscriptionTier('free');
        return;
      }

      // First check the new subscriptions table tied to the user's workspace
      const { data: workspaceMemberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

      if (workspaceMemberships?.workspace_id) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('workspace_id', workspaceMemberships.workspace_id)
          .single();

        if (subscription && subscription.status === 'active') {
          // Map database plan to tier (normalize naming)
          let tier: SubscriptionTier = subscription.plan as SubscriptionTier;
          setSubscriptionTier(tier);
          setSubscriptionEnd(subscription.current_period_end || null);
          return;
        }
      }

      // Fallback to user_roles for legacy/manual grants
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, subscription_tier')
        .eq('user_id', session.user.id)
        .single();

      // Display admin users as enterprise
      if (roleData?.role === 'admin') {
        setSubscriptionTier('enterprise');
        return;
      }

      // Map legacy tiers
      if (roleData?.subscription_tier) {
        const manualTier = roleData.subscription_tier as string;
        if (manualTier === 'analyst' || manualTier === 'family') {
          setSubscriptionTier('pro'); // Map legacy to pro
        } else if (['premium', 'enterprise', 'pro', 'business'].includes(manualTier)) {
          setSubscriptionTier(manualTier as SubscriptionTier);
        } else {
          setSubscriptionTier('free');
        }
        setSubscriptionEnd(null);
      } else {
        setSubscriptionTier('free');
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionTier('free');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      // Only synchronous state updates here per best practices
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer any additional async work to avoid deadlocks
        setTimeout(() => {
          refreshSubscription();
        }, 0);
      } else {
        setSubscriptionTier('free');
      }
    });

    // THEN check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshSubscription();
      } else {
        setSubscriptionTier('free');
      }
      setIsLoading(false);
    });

    // Refresh subscription every 60 seconds
    const interval = setInterval(refreshSubscription, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const isPremium = subscriptionTier !== 'free';
  const isProOrHigher = ['pro', 'business', 'premium', 'enterprise'].includes(subscriptionTier);

  return (
    <SubscriptionContext.Provider value={{ 
      user, 
      subscriptionTier, 
      subscriptionEnd, 
      isLoading, 
      isPremium, 
      isProOrHigher,
      refreshSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    console.warn('useSubscription used outside SubscriptionProvider, returning defaults');
    return {
      user: null,
      subscriptionTier: 'free' as SubscriptionTier,
      subscriptionEnd: null,
      isLoading: false,
      isPremium: false,
      isProOrHigher: false,
      refreshSubscription: async () => {},
    };
  }
  return context;
};
