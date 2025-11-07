import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../../../_shared/secure.ts';

/**
 * Creates a Stripe PaymentIntent for subscription payments
 * Used with Stripe Elements for secure card input
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.email) throw new Error('Unauthorized');

    const { priceId, planName } = await req.json();

    if (!priceId) throw new Error('Price ID required');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Get price details
    const price = await stripe.prices.retrieve(priceId);
    
    if (!price.unit_amount) {
      throw new Error('Invalid price');
    }

    // Create a PaymentIntent for subscription setup
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency || 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      metadata: {
        price_id: priceId,
        plan_name: planName || 'subscription',
        user_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Created PaymentIntent ${paymentIntent.id} for user ${user.email}`);

    return ok({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
