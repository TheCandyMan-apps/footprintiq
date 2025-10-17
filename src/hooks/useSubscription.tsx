import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type SubscriptionTier = 'free' | 'premium' | 'family';

interface SubscriptionContextType {
  user: User | null;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubscriptionTier('free');
        return;
      }

      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.subscribed && data?.product_id) {
        // Map product_id to tier if needed, default to premium for any active subscription
        setSubscriptionTier('premium');
      } else {
        setSubscriptionTier('free');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionTier('free');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshSubscription();
      }
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshSubscription();
      } else {
        setSubscriptionTier('free');
      }
    });

    // Refresh subscription every 60 seconds
    const interval = setInterval(refreshSubscription, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'family';

  return (
    <SubscriptionContext.Provider value={{ user, subscriptionTier, isLoading, isPremium, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    // Return default values instead of throwing to prevent app crash
    console.warn('useSubscription used outside SubscriptionProvider, returning defaults');
    return {
      user: null,
      subscriptionTier: 'free' as SubscriptionTier,
      isLoading: false,
      isPremium: false,
      refreshSubscription: async () => {},
    };
  }
  return context;
};
