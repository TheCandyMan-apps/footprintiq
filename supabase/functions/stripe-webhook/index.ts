import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Webhook event types
const WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: "customer.subscription.created",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
  PAYMENT_FAILED: "invoice.payment_failed",
  CHECKOUT_COMPLETED: "checkout.session.completed",
} as const;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[STRIPE-WEBHOOK] Received webhook request");

  try {
    // Get Stripe signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("[STRIPE-WEBHOOK] STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get raw body for signature verification
    const payload = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      console.log("[STRIPE-WEBHOOK] Signature verified successfully", {
        eventType: event.type,
        eventId: event.id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process webhook event
    switch (event.type) {
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[STRIPE-WEBHOOK] Processing subscription event:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        if (subscription.status === "active") {
          // Get customer email
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const customerEmail = (customer as Stripe.Customer).email;

          if (!customerEmail) {
            console.error("[STRIPE-WEBHOOK] No email found for customer");
            break;
          }

          // Get product ID from subscription
          const productId = subscription.items.data[0]?.price?.product as string;

          // Map product ID to subscription tier
          let tier: "free" | "basic" | "premium" | "enterprise" = "premium";
          // You can customize this mapping based on your actual product IDs
          // Example: if (productId === 'prod_basic') tier = 'basic';

          // Find user by email
          const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
          if (authError) {
            console.error("[STRIPE-WEBHOOK] Error listing users:", authError);
            break;
          }

          const user = authUser.users.find((u) => u.email === customerEmail);
          if (!user) {
            console.error("[STRIPE-WEBHOOK] User not found for email:", customerEmail);
            break;
          }

          // Update subscription in user_roles
          const subscriptionEnd = new Date(subscription.current_period_end * 1000);
          const { error: updateError } = await supabase
            .from("user_roles")
            .update({
              subscription_tier: tier,
              subscription_expires_at: subscriptionEnd.toISOString(),
            })
            .eq("user_id", user.id);

          if (updateError) {
            console.error("[STRIPE-WEBHOOK] Error updating subscription:", updateError);
          } else {
            console.log("[STRIPE-WEBHOOK] Subscription updated successfully:", {
              userId: user.id,
              tier,
              expiresAt: subscriptionEnd.toISOString(),
            });
          }
        }
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[STRIPE-WEBHOOK] Processing subscription deletion:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as Stripe.Customer).email;

        if (!customerEmail) {
          console.error("[STRIPE-WEBHOOK] No email found for customer");
          break;
        }

        // Find user by email
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.error("[STRIPE-WEBHOOK] Error listing users:", authError);
          break;
        }

        const user = authUser.users.find((u) => u.email === customerEmail);
        if (!user) {
          console.error("[STRIPE-WEBHOOK] User not found for email:", customerEmail);
          break;
        }

        // Downgrade to free tier
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            subscription_tier: "free",
            subscription_expires_at: null,
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("[STRIPE-WEBHOOK] Error downgrading subscription:", updateError);
        } else {
          console.log("[STRIPE-WEBHOOK] User downgraded to free tier:", user.id);
        }
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[STRIPE-WEBHOOK] Payment failed:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_due,
        });

        // Get customer email for notification
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        const customerEmail = (customer as Stripe.Customer).email;

        console.log("[STRIPE-WEBHOOK] Payment failure notification needed for:", customerEmail);
        // TODO: Send email notification to user about payment failure
        // Implement grace period logic here if needed
        break;
      }

      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[STRIPE-WEBHOOK] Checkout completed:", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });
        // Subscription will be handled by subscription.created event
        break;
      }

      default:
        console.log("[STRIPE-WEBHOOK] Unhandled event type:", event.type);
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[STRIPE-WEBHOOK] Error processing webhook:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
