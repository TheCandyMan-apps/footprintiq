import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const { workspace_id, count = 1 } = await req.json();
    if (!workspace_id) return bad(400, 'missing_workspace');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get billing info
    const { data: billing } = await supabase
      .from('billing_customers')
      .select('stripe_subscription_id, metered_scans_month')
      .eq('workspace_id', workspace_id)
      .single();

    if (!billing?.stripe_subscription_id) {
      return ok({ acknowledged: true, metered: false });
    }

    // Update local counter
    await supabase
      .from('billing_customers')
      .update({ metered_scans_month: (billing.metered_scans_month || 0) + count })
      .eq('workspace_id', workspace_id);

    // Report to Stripe if there's a metered price
    const meteredPriceId = Deno.env.get('STRIPE_PRICE_METERED_SCAN');
    if (meteredPriceId) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2024-06-20',
      });

      // Find subscription item for metered scans
      const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
      const meteredItem = subscription.items.data.find((item: any) => item.price.id === meteredPriceId);

      if (meteredItem) {
        await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
          quantity: count,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment',
        });
      }
    }

    return ok({ acknowledged: true, metered: true, count });
  } catch (error) {
    console.error('Metering error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
