import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { resolvePriceId, tierToFrontendPlan } from '../_shared/stripePlans.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BILLING-CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'free',
          subscription_tier: 'free',
          status: 'inactive'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
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
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'free',
          subscription_tier: 'free',
          status: 'inactive'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Use canonical mapping
    const resolution = resolvePriceId(priceId);
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    logStep('Active subscription found', { 
      subscriptionId: subscription.id, 
      priceId,
      tier: resolution.tier,
      plan: resolution.plan,
      endDate: subscriptionEnd 
    });

    // Return both tier (DB value) and plan (frontend value) for compatibility
    return new Response(
      JSON.stringify({
        subscribed: true,
        tier: resolution.tier,                    // DB tier: premium, enterprise
        subscription_tier: resolution.tier,       // Alias for backwards compat
        plan: resolution.plan,                    // Workspace plan: pro, business
        frontend_plan: tierToFrontendPlan(resolution.tier), // For UI display
        status: subscription.status,
        current_period_end: subscriptionEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
