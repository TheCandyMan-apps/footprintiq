import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type SubscriptionTier = 'free' | 'analyst' | 'pro' | 'enterprise';

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

      /**
       * UI-ONLY role check for display purposes.
       * SECURITY: Actual authorization enforced server-side via RLS policies.
       * DO NOT use this for access control decisions.
       * This only affects UI display and subscription tier hints.
       */
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, subscription_tier')
        .eq('user_id', session.user.id)
        .single();

      // Display admin users as enterprise (UI hint only - not a security boundary)
      if (roleData?.role === 'admin') {
        setSubscriptionTier('enterprise');
        return;
      }

      // Check actual Stripe subscription
      const { data } = await supabase.functions.invoke('billing/check-subscription');
      if (data?.subscribed && data?.tier) {
        setSubscriptionTier(data.tier as SubscriptionTier);
        setSubscriptionEnd(data.current_period_end || null);
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
  const isProOrHigher = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

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

export type { SubscriptionTier };
