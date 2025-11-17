import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

// Price ID to plan mapping
const PRICE_TO_PLAN_MAP: Record<string, 'pro' | 'business'> = {
  'price_1SIbjiA3ptI9drLWsG0noPeX': 'pro',
  'price_1SN3uIA3ptI9drLWMCDo1mAT': 'business',
};

// Plan to scan limit mapping
const PLAN_SCAN_LIMITS: Record<string, number> = {
  free: 5,
  pro: 100,
  business: 500,
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Missing signature or secret' }), {
      status: 400,
    });
  }

  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`[stripe-webhooks] Event received: ${event.type}`);

    // Initialize Supabase with service role for write access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        // Get workspace ID from metadata
        const workspaceId = subscription.metadata?.workspace_id;

        if (!workspaceId) {
          console.error('[stripe-webhooks] No workspace_id in subscription metadata');
          break;
        }

        // Determine plan from price ID
        const plan = PRICE_TO_PLAN_MAP[priceId] || 'free';
        const scanLimit = PLAN_SCAN_LIMITS[plan];

        console.log(`[stripe-webhooks] Updating subscription for workspace ${workspaceId} to ${plan}`);

        // Upsert subscription record
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            workspace_id: workspaceId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan: plan,
            scan_limit_monthly: scanLimit,
            status: subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'inactive',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            scans_used_monthly: 0, // Reset on new period
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'workspace_id',
          });

        if (upsertError) {
          console.error('[stripe-webhooks] Failed to upsert subscription:', upsertError);
          throw upsertError;
        }

        // Log audit event
        await supabase.from('billing_audit_logs').insert({
          workspace_id: workspaceId,
          event_type: 'subscription_updated',
          metadata: {
            event: event.type,
            plan: plan,
            subscription_id: subscription.id,
            status: subscription.status,
          },
        });

        console.log(`[stripe-webhooks] Successfully updated subscription for workspace ${workspaceId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = subscription.metadata?.workspace_id;

        if (!workspaceId) {
          console.error('[stripe-webhooks] No workspace_id in subscription metadata');
          break;
        }

        console.log(`[stripe-webhooks] Subscription deleted for workspace ${workspaceId}`);

        // Update subscription to free plan
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            scan_limit_monthly: PLAN_SCAN_LIMITS.free,
            status: 'canceled',
            current_period_start: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq('workspace_id', workspaceId);

        if (updateError) {
          console.error('[stripe-webhooks] Failed to update subscription:', updateError);
          throw updateError;
        }

        // Log audit event
        await supabase.from('billing_audit_logs').insert({
          workspace_id: workspaceId,
          event_type: 'subscription_cancelled',
          metadata: {
            event: event.type,
            subscription_id: subscription.id,
          },
        });

        console.log(`[stripe-webhooks] Successfully downgraded workspace ${workspaceId} to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription to find workspace
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const workspaceId = subscription.metadata?.workspace_id;

        if (!workspaceId) {
          console.error('[stripe-webhooks] No workspace_id in subscription metadata');
          break;
        }

        console.log(`[stripe-webhooks] Payment failed for workspace ${workspaceId}`);

        // Update subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('workspace_id', workspaceId);

        if (updateError) {
          console.error('[stripe-webhooks] Failed to update subscription:', updateError);
        }

        // Log audit event
        await supabase.from('billing_audit_logs').insert({
          workspace_id: workspaceId,
          event_type: 'payment_failed',
          metadata: {
            event: event.type,
            invoice_id: invoice.id,
            amount: invoice.amount_due,
          },
        });

        break;
      }

      default:
        console.log(`[stripe-webhooks] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[stripe-webhooks] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
