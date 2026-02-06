import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Stripe Webhook Handler for Production
 * 
 * Handles subscription lifecycle events:
 * - checkout.session.completed - New subscription or credit purchase
 * - customer.subscription.created - Subscription started
 * - customer.subscription.updated - Plan changes, renewals, status changes
 * - customer.subscription.deleted - Cancellation
 * - invoice.payment_succeeded - Successful payment
 * - invoice.payment_failed - Failed payment (retry or notify)
 * - customer.subscription.trial_will_end - Trial ending soon
 * - payment_intent.payment_failed - Payment failure
 * 
 * Security: This endpoint does NOT require JWT authentication.
 * Stripe signatures are validated instead.
 */

const logEvent = (eventType: string, message: string, metadata?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${eventType}] ${message}`, metadata ? JSON.stringify(metadata) : '');
};

// **CENTRALIZED PRICE-TO-TIER MAPPING** - Single source of truth
// This mapping aligns with actual Stripe products and database schema
// Synced with src/config/stripe.ts on 2026-02-06
const PRICE_TO_TIER_MAP: Record<string, 'free' | 'premium' | 'enterprise'> = {
  // Pro Monthly (£14.99/mo) - premium tier
  'price_1ShgNPA3ptI9drLW40rbWMjq': 'premium',
  
  // Pro Annual (£140/year) - premium tier
  'price_1Si2vkA3ptI9drLWCQrxU4Dc': 'premium',
  
  // Business (£49.99/mo) - enterprise tier
  'price_1ShdxJA3ptI9drLWjndMjptw': 'enterprise',
  
  // Enterprise (custom) - enterprise tier
  'price_1SQh9JPNdM5SAyj722p376Qh': 'enterprise',
};

const getTierFromPriceId = (priceId: string): 'free' | 'premium' | 'enterprise' => {
  return PRICE_TO_TIER_MAP[priceId] || 'free';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    logEvent('ERROR', 'Invalid method', { method: req.method });
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      logEvent('ERROR', 'Missing webhook signature or secret');
      throw new Error('Missing webhook signature or secret');
    }

    // Verify webhook signature
    const body = await req.text();
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logEvent('SUCCESS', 'Webhook signature verified', { eventType: event.type, eventId: event.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logEvent('ERROR', 'Webhook signature verification failed', { error: errorMessage });
      throw new Error(`Webhook signature verification failed: ${errorMessage}`);
    }

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
              reason: 'purchase',
              ref_id: `stripe_${session.id}`,
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
          
          // Use centralized tier mapping
          const tier = getTierFromPriceId(priceId);
          const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
          
          // Update user subscription tier
          await supabase.rpc('update_user_subscription', {
            _user_id: userId,
            _new_tier: tier,
            _expires_at: expiresAt,
          });
          
          console.log(`Updated user ${userId} to ${tier} tier`);
          
          // Grant monthly credits for premium tiers
          if (workspaceId && ['premium', 'enterprise'].includes(tier)) {
            const monthlyCredits = tier === 'enterprise' ? 1000 : 200;
            const { error: creditsError } = await supabase
              .from('credits_ledger')
              .insert({
                workspace_id: workspaceId,
                delta: monthlyCredits,
                reason: 'monthly_subscription',
                meta: { subscription_id: session.subscription, tier },
              });
            
            if (creditsError) {
              console.error('Error granting monthly credits:', creditsError);
            } else {
              console.log(`Granted ${monthlyCredits} credits to workspace ${workspaceId}`);
            }
          }
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
            
            // Use centralized tier mapping
            const tier = subscription.status === 'active' ? getTierFromPriceId(priceId) : 'free';
            const expiresAt = subscription.status === 'active' 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null;
            
            await supabase.rpc('update_user_subscription', {
              _user_id: profile.user_id,
              _new_tier: tier,
              _expires_at: expiresAt,
            });
            
            console.log(`Updated subscription for user ${profile.user_id} to ${tier}`);
            
            // Grant monthly credits on subscription renewal for premium tiers
            if (subscription.status === 'active' && ['premium', 'enterprise'].includes(tier)) {
              const { data: workspaces } = await supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('user_id', profile.user_id)
                .eq('role', 'admin')
                .limit(1)
                .single();
              
              if (workspaces) {
                const monthlyCredits = tier === 'enterprise' ? 1000 : 200;
                const { error: creditsError } = await supabase
                  .from('credits_ledger')
                  .insert({
                    workspace_id: workspaces.workspace_id,
                    delta: monthlyCredits,
                    reason: 'monthly_subscription',
                    meta: { subscription_id: subscription.id, tier },
                  });
                
                if (creditsError) {
                  console.error('Error granting monthly credits:', creditsError);
                } else {
                  console.log(`Granted ${monthlyCredits} credits to workspace ${workspaces.workspace_id}`);
                }
              }
            }
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

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        logEvent('SUBSCRIPTION_CREATED', 'New subscription created', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if ('email' in customer && customer.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', customer.email)
            .single();
          
          if (profile) {
            const priceId = subscription.items.data[0].price.id;
            
            // Use centralized tier mapping
            const tier = getTierFromPriceId(priceId);
            const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
            
            await supabase.rpc('update_user_subscription', {
              _user_id: profile.user_id,
              _new_tier: tier,
              _expires_at: expiresAt,
            });
            
            logEvent('SUBSCRIPTION_ACTIVATED', `User subscription activated`, {
              userId: profile.user_id,
              tier,
              expiresAt,
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logEvent('PAYMENT_SUCCESS', 'Invoice payment succeeded', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_paid,
          currency: invoice.currency,
        });
        
        // Update user role based on subscription payment with retry logic
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if ('email' in customer && customer.email) {
            const priceId = subscription.items.data[0].price.id;
            
            // Use centralized tier mapping
            const tier = getTierFromPriceId(priceId);
            const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
            
            // Get or create user profile
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('email', customer.email)
              .maybeSingle();
            
            if (profiles?.user_id) {
              // Update user_roles with 3x retry logic and progressive backoff
              let lastError: any = null;
              let success = false;
              
              for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                  logEvent('ROLE_UPDATE_ATTEMPT', `Attempt ${attempt}/3 to update user role`, {
                    userId: profiles.user_id,
                    tier,
                    attempt,
                  });
                  
                  // Update user_roles table with new subscription tier
                  const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({
                      user_id: profiles.user_id,
                      role: 'user',
                      subscription_tier: tier,
                      subscription_expires_at: expiresAt,
                    }, {
                      onConflict: 'user_id',
                    });
                  
                  if (roleError) {
                    throw roleError;
                  }
                  
                  logEvent('ROLE_UPDATED', `User role updated to ${tier}`, {
                    userId: profiles.user_id,
                    tier,
                    expiresAt,
                    attempt,
                  });
                  
                  success = true;
                  break;
                } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logEvent('ROLE_UPDATE_RETRY', `Attempt ${attempt}/3 failed`, {
      error: errorMessage,
                    userId: profiles.user_id,
                  });
                  
                  // Progressive backoff: 2s, 4s, 6s
                  if (attempt < 3) {
                    const delay = attempt * 2000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                  }
                }
              }
              
              if (!success) {
                logEvent('ERROR', 'Failed to update user role after 3 attempts', {
                  error: lastError?.message,
                  userId: profiles.user_id,
                });
              }
              
              // Log payment to audit trail (always attempt this, even if role update failed)
              await supabase.from('audit_log').insert({
                action: 'subscription.payment_succeeded',
                meta: {
                  invoice_id: invoice.id,
                  amount: invoice.amount_paid,
                  currency: invoice.currency,
                  customer_email: customer.email,
                  subscription_tier: tier,
                  role_update_success: success,
                },
              });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logEvent('PAYMENT_FAILED', 'Invoice payment failed', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_due,
          attemptCount: invoice.attempt_count,
        });
        
        // Get customer email for notification
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        
        if ('email' in customer && customer.email) {
          // Log failed payment
          await supabase.from('audit_log').insert({
            action: 'subscription.payment_failed',
            meta: {
              invoice_id: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              attempt_count: invoice.attempt_count,
              customer_email: customer.email,
            },
          });
          
          // Send email notification for payment failure (if Resend is configured)
          const resendKey = Deno.env.get('RESEND_API_KEY');
          if (resendKey) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'FootprintIQ <billing@footprintiq.com>',
                  to: customer.email,
                  subject: 'Payment Failed - Action Required',
                  html: `
                    <h2>Payment Failed</h2>
                    <p>We were unable to process your recent payment for your FootprintIQ subscription.</p>
                    <p><strong>Amount:</strong> $${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}</p>
                    <p><strong>Attempt:</strong> ${invoice.attempt_count} of 4</p>
                    <p>Please update your payment method to avoid service interruption.</p>
                    <p><a href="https://app.footprintiq.com/settings/billing">Update Payment Method</a></p>
                  `,
                }),
              });
              
              logEvent('EMAIL_SENT', 'Payment failure notification sent', { email: customer.email });
            } catch (emailError) {
              const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
              logEvent('EMAIL_ERROR', 'Failed to send payment failure email', { error: errorMessage });
            }
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const trialEnd = new Date(subscription.trial_end! * 1000);
        
        logEvent('TRIAL_ENDING', 'Subscription trial ending soon', {
          subscriptionId: subscription.id,
          trialEnd: trialEnd.toISOString(),
        });
        
        // Send trial ending notification
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if ('email' in customer && customer.email) {
          const resendKey = Deno.env.get('RESEND_API_KEY');
          if (resendKey) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'FootprintIQ <hello@footprintiq.com>',
                  to: customer.email,
                  subject: 'Your Trial is Ending Soon',
                  html: `
                    <h2>Your Trial Ends Soon</h2>
                    <p>Your FootprintIQ trial ends on ${trialEnd.toLocaleDateString()}.</p>
                    <p>Continue enjoying advanced OSINT features by keeping your subscription active.</p>
                    <p><a href="https://app.footprintiq.com/settings/billing">Manage Subscription</a></p>
                  `,
                }),
              });
              
              logEvent('EMAIL_SENT', 'Trial ending notification sent', { email: customer.email });
        } catch (emailError) {
          const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
          logEvent('EMAIL_ERROR', 'Failed to send trial ending email', { error: errorMessage });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logEvent('PAYMENT_INTENT_FAILED', 'Payment intent failed', {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer,
          amount: paymentIntent.amount,
          lastError: paymentIntent.last_payment_error?.message,
        });
        break;
      }

      default:
        logEvent('UNHANDLED_EVENT', `Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    logEvent('SUCCESS', `Webhook processed successfully in ${duration}ms`, { eventType: event.type });
    
    return new Response(
      JSON.stringify({ received: true, processed: event.type, duration }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Webhook error';
    logEvent('ERROR', 'Webhook processing failed', {
      error: errorMessage,
      duration,
    });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
