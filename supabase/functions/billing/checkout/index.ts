import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../../_shared/secure.ts';

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

    const { workspace_id, plan, seats = 1 } = await req.json();
    if (!workspace_id || !plan) throw new Error('Missing workspace_id or plan');

    // Verify user is admin of workspace
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'admin') {
      throw new Error('Only workspace admins can manage billing');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    // Get or create Stripe customer
    const { data: billing } = await supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('workspace_id', workspace_id)
      .single();

    let customerId = billing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { workspace_id },
      });
      customerId = customer.id;
    }

    // Get price ID from env
    const priceMap: Record<string, string> = {
      analyst: Deno.env.get('STRIPE_PRICE_ANALYST') || '',
      pro: Deno.env.get('STRIPE_PRICE_PRO') || '',
      enterprise: Deno.env.get('STRIPE_PRICE_ENTERPRISE') || '',
    };

    const priceId = priceMap[plan];
    if (!priceId) throw new Error('Invalid plan');

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/settings/billing?success=true`,
      cancel_url: `${req.headers.get('origin')}/settings/billing?canceled=true`,
      metadata: { workspace_id, plan },
    });

    return ok({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
