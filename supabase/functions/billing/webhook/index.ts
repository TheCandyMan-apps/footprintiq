import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspace_id = session.metadata?.workspace_id;
        const plan = session.metadata?.plan as 'analyst' | 'pro' | 'enterprise';

        if (workspace_id && plan) {
          await supabase.from('billing_customers').upsert({
            workspace_id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan,
            status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('billing_customers')
          .update({
            status: subscription.status === 'active' ? 'active' : 'past_due',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            seats: subscription.items.data[0]?.quantity || 1,
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('billing_customers')
          .update({
            status: 'canceled',
            plan: 'free',
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await supabase
            .from('billing_customers')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', invoice.subscription as string);
        }
        break;
      }
    }

    return ok({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return bad(400, error instanceof Error ? error.message : 'Webhook error');
  }
});
