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
        const userId = session.metadata?.user_id;
        const workspaceId = session.metadata?.workspace_id;
        const credits = session.metadata?.credits;
        
        // Handle credits purchase (one-time payment)
        if (userId && workspaceId && credits && !session.subscription) {
          const creditAmount = parseInt(credits);
          console.log(`Adding ${creditAmount} credits to workspace ${workspaceId}`);
          
          // Add credits to the workspace
          const { error: ledgerError } = await supabase
            .from('credits_ledger')
            .insert({
              workspace_id: workspaceId,
              delta: creditAmount,
              description: `Purchased ${creditAmount} credits via Stripe`,
              created_by: userId,
            });
          
          if (ledgerError) {
            console.error('Error adding credits:', ledgerError);
          } else {
            console.log(`Successfully added ${creditAmount} credits to workspace ${workspaceId}`);
          }
        }
        // Handle subscription purchase
        else if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0].price.id;
          
          // Map price IDs to tiers
          const tierMap: Record<string, 'free' | 'analyst' | 'pro' | 'enterprise'> = {
            'price_1SPXbHPNdM5SAyj7lPBHvjIi': 'analyst',
            'price_1SPXcEPNdM5SAyj7AbannmpP': 'pro',
          };
          
          const tier = tierMap[priceId] || 'free';
          const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
          
          // Update user subscription tier
          await supabase.rpc('update_user_subscription', {
            _user_id: userId,
            _new_tier: tier,
            _expires_at: expiresAt,
          });
          
          console.log(`Updated user ${userId} to ${tier} tier`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if ('email' in customer && customer.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', customer.email)
            .single();
          
          if (profile) {
            const priceId = subscription.items.data[0].price.id;
            const tierMap: Record<string, 'free' | 'analyst' | 'pro' | 'enterprise'> = {
              'price_1SPXbHPNdM5SAyj7lPBHvjIi': 'analyst',
              'price_1SPXcEPNdM5SAyj7AbannmpP': 'pro',
            };
            
            const tier = subscription.status === 'active' ? (tierMap[priceId] || 'free') : 'free';
            const expiresAt = subscription.status === 'active' 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null;
            
            await supabase.rpc('update_user_subscription', {
              _user_id: profile.user_id,
              _new_tier: tier,
              _expires_at: expiresAt,
            });
            
            console.log(`Updated subscription for user ${profile.user_id} to ${tier}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if ('email' in customer && customer.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', customer.email)
            .single();
          
          if (profile) {
            await supabase.rpc('update_user_subscription', {
              _user_id: profile.user_id,
              _new_tier: 'free',
              _expires_at: null,
            });
            
            console.log(`Downgraded user ${profile.user_id} to free tier`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice ${invoice.id} paid successfully`);
        break;
      }
    }

    return ok({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return bad(400, error instanceof Error ? error.message : 'Webhook error');
  }
});
