import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Missing signature or secret" }), {
      status: 400,
    });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`[stripe-credit-webhook] Event received: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`[stripe-credit-webhook] Processing session: ${session.id}`);
      console.log(`[stripe-credit-webhook] Metadata:`, session.metadata);

      // Extract metadata
      const userId = session.metadata?.user_id;
      const workspaceId = session.metadata?.workspace_id;
      const credits = parseInt(session.metadata?.credits || "0");
      const packType = session.metadata?.pack_type;

      if (!userId || !workspaceId || !credits) {
        console.error('[stripe-credit-webhook] Missing required metadata');
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
        });
      }

      // Create Supabase admin client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      console.log(`[stripe-credit-webhook] Adding ${credits} credits to workspace ${workspaceId}`);

      // Add credits to the workspace
      const { error: creditError } = await supabase
        .from('credits_ledger')
        .insert({
          workspace_id: workspaceId,
          delta: credits,
          reason: `Credit pack purchase: ${packType}`,
          meta: {
            stripe_session_id: session.id,
            pack_type: packType,
            payment_intent: session.payment_intent,
          },
        });

      if (creditError) {
        console.error('[stripe-credit-webhook] Failed to add credits:', creditError);
        throw creditError;
      }

      console.log(`[stripe-credit-webhook] Successfully added ${credits} credits to workspace ${workspaceId}`);

      // Log the purchase
      await supabase
        .from('audit_log')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'credit_purchase',
          target: `${credits} credits`,
          meta: {
            pack_type: packType,
            stripe_session_id: session.id,
            amount: session.amount_total,
            currency: session.currency,
          },
        });

      console.log(`[stripe-credit-webhook] Audit log created`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error('[stripe-credit-webhook] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 400 }
    );
  }
});
