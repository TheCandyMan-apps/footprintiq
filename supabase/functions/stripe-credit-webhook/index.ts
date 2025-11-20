import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const WebhookMetadataSchema = z.object({
  user_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  credits: z.string().regex(/^\d+$/),
  pack_type: z.string().min(1),
});

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    console.error("[stripe-credit-webhook] Missing signature or webhook secret");
    return new Response(JSON.stringify({ error: "Missing signature or secret" }), {
      status: 400,
      headers: addSecurityHeaders({ "Content-Type": "application/json" }),
    });
  }

  // Rate limiting by IP (prevent webhook flooding)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rateLimitResult = await checkRateLimit(clientIp, 'ip', 'stripe-credit-webhook', {
    maxRequests: 100,
    windowSeconds: 60
  });
  if (!rateLimitResult.allowed) {
    console.warn(`[stripe-credit-webhook] Rate limit exceeded for IP ${clientIp}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: addSecurityHeaders({ "Content-Type": "application/json" }),
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

      // Validate metadata
      const validation = WebhookMetadataSchema.safeParse(session.metadata);
      if (!validation.success) {
        console.error('[stripe-credit-webhook] Invalid metadata:', validation.error.issues);
        return new Response(JSON.stringify({ error: "Invalid metadata", details: validation.error.issues }), {
          status: 400,
          headers: addSecurityHeaders({ "Content-Type": "application/json" }),
        });
      }

      // Extract validated metadata
      const { user_id: userId, workspace_id: workspaceId, credits: creditsStr, pack_type: packType } = validation.data;
      const credits = parseInt(creditsStr);

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
      headers: addSecurityHeaders({ "Content-Type": "application/json" }),
    });
  } catch (error) {
    console.error('[stripe-credit-webhook] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { 
        status: 400,
        headers: addSecurityHeaders({ "Content-Type": "application/json" }),
      }
    );
  }
});
