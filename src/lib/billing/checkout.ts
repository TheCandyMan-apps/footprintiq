/**
 * Stripe checkout automation helpers
 */

import { supabase } from '@/integrations/supabase/client';
import { PLANS, PlanId } from './tiers';
import { toast } from 'sonner';

export interface CheckoutOptions {
  planId: PlanId;
  workspaceId: string;
}

/**
 * Start Stripe checkout session for a plan upgrade
 */
export async function startCheckout({ planId, workspaceId }: CheckoutOptions): Promise<void> {
  const plan = PLANS[planId];
  
  if (!plan.stripePriceId) {
    toast.error('Invalid plan selected');
    return;
  }

  try {
    toast.loading('Redirecting to Stripe checkout...');
    
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        workspaceId,
        plan: planId,
      },
    });

    if (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      return;
    }

    if (data?.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      toast.error('No checkout URL received');
    }
  } catch (err) {
    console.error('Checkout exception:', err);
    toast.error('Failed to start checkout');
  }
}

/**
 * Refresh subscription status from Stripe
 */
export async function refreshSubscriptionStatus(workspaceId: string): Promise<boolean> {
  try {
    toast.loading('Refreshing subscription status...');
    
    const { data, error } = await supabase.functions.invoke('billing-sync', {
      body: { workspaceId },
    });

    if (error) {
      console.error('Sync error:', error);
      toast.error('Failed to refresh status');
      return false;
    }

    toast.success('Subscription status updated');
    return true;
  } catch (err) {
    console.error('Sync exception:', err);
    toast.error('Failed to refresh status');
    return false;
  }
}
