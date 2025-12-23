import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    logStep('Function started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user?.email) throw new Error('Unauthorized');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep('No customer found');
      return ok({ 
        subscribed: false, 
        tier: 'free',
        status: 'inactive'
      });
    }

    const customerId = customers.data[0].id;
    logStep('Found Stripe customer', { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep('No active subscription');
      return ok({ 
        subscribed: false, 
        tier: 'free',
        status: 'inactive'
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Map price IDs to tiers
    const tierMap: Record<string, string> = {
      'price_1ShdnEA3ptI9drLWLFG8qPyk': 'pro',
      'price_1ShdxJA3ptI9drLWjndMjptw': 'business',
    };

    const tier = tierMap[priceId] || 'free';
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    logStep('Active subscription found', { 
      subscriptionId: subscription.id, 
      tier,
      endDate: subscriptionEnd 
    });

    return ok({
      subscribed: true,
      tier,
      status: subscription.status,
      current_period_end: subscriptionEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return bad(500, errorMessage);
  }
});
