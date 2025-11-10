import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useWorkspace } from './useWorkspace';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';

export const useLowCreditToast = () => {
  const { workspace } = useWorkspace();
  const { isPremium } = useSubscription();
  const lastToastRef = useRef<number>(0);
  const TOAST_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!workspace?.id || isPremium) return;

    const checkCredits = async () => {
      try {
        const { data, error } = await supabase.rpc('get_credits_balance', {
          _workspace_id: workspace.id
        });

        if (error) throw error;

        const credits = data || 0;
        const now = Date.now();

        // Show toast if credits are low and cooldown has passed
        if (credits < 50 && now - lastToastRef.current > TOAST_COOLDOWN) {
          lastToastRef.current = now;
          
          if (credits === 0) {
            toast.error('Out of Credits!', {
              description: 'Unlock premium for more – try Pro! $15/mo for unlimited scans',
              duration: 10000,
              action: {
                label: 'Upgrade Now',
                onClick: async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('billing-checkout', {
                      body: { priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8' }
                    });
                    if (error) throw error;
                    if (data?.url) window.open(data.url, '_blank');
                  } catch (error) {
                    console.error('Upgrade error:', error);
                    toast.error('Could not open checkout');
                  }
                }
              }
            });
          } else {
            toast.warning('Low Credits', {
              description: `Only ${credits} credits left. Unlock premium for more – try Pro!`,
              duration: 8000,
              action: {
                label: 'Upgrade',
                onClick: async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('billing-checkout', {
                      body: { priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8' }
                    });
                    if (error) throw error;
                    if (data?.url) window.open(data.url, '_blank');
                  } catch (error) {
                    console.error('Upgrade error:', error);
                    toast.error('Could not open checkout');
                  }
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking credits:', error);
      }
    };

    checkCredits();
    
    // Check credits every 2 minutes
    const interval = setInterval(checkCredits, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [workspace?.id, isPremium]);
};
