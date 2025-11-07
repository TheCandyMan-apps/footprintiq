import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Webhook Error: Missing signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the checkout session
        const userId = session.metadata?.user_id;
        const workspaceId = session.metadata?.workspace_id;
        const credits = parseInt(session.metadata?.credits || "0");
        const priceId = session.metadata?.price_id;

        if (!userId || !workspaceId || !credits) {
          console.error("Missing required metadata in checkout session", {
            userId,
            workspaceId,
            credits,
            metadata: session.metadata
          });
          break;
        }

        console.log(`Processing credit purchase: ${credits} credits for workspace ${workspaceId}`);

        // Add credits to workspace's ledger
        const { error: creditError } = await supabase
          .from("credits_ledger")
          .insert({
            workspace_id: workspaceId,
            delta: credits,
            reason: `Credit purchase - ${credits} credits`,
            reference_type: "stripe_payment",
            reference_id: session.id,
            meta: {
              stripe_session_id: session.id,
              stripe_price_id: priceId,
              amount_paid: session.amount_total,
              currency: session.currency,
              payment_status: session.payment_status,
            }
          });

        if (creditError) {
          console.error("Failed to credit account:", creditError);
          throw creditError;
        }

        console.log(`✅ Successfully credited ${credits} credits to workspace ${workspaceId}`);
        
        // Optional: Send confirmation email or notification here
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const email = customer.email;
        if (!email) break;

        // Find user by email
        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === email);
        if (!user) break;

        // Map Stripe price to subscription tier
        const priceId = subscription.items.data[0]?.price.id;
        let tier: "free" | "basic" | "premium" | "enterprise" = "free";
        
        if (priceId === Deno.env.get("STRIPE_PRICE_ANALYST")) tier = "basic";
        else if (priceId === Deno.env.get("STRIPE_PRICE_PRO")) tier = "premium";
        else if (priceId === Deno.env.get("STRIPE_PRICE_ENTERPRISE")) tier = "enterprise";

        // Update user subscription
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            subscription_tier: tier,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
          throw updateError;
        }

        console.log(`Updated subscription for ${email} to ${tier}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const email = customer.email;
        if (!email) break;

        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === email);
        if (!user) break;

        // Downgrade to free tier
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            subscription_tier: "free",
            subscription_expires_at: null,
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to downgrade subscription:", updateError);
          throw updateError;
        }

        console.log(`Downgraded ${email} to free tier`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook handler failed",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
