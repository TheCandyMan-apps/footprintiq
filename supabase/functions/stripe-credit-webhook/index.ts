import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── Inlined security headers (avoids shared dep chain) ──────────────────────
function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  };
}

// ── Inlined rate limiter (uses DB RPC) ──────────────────────────────────────
async function checkRateLimit(
  identifier: string,
  identifierType: string,
  endpoint: string,
  config: { maxRequests: number; windowSeconds: number },
  supabaseClient: ReturnType<typeof createClient>,
) {
  const now = new Date();
  const { data: result } = await supabaseClient.rpc('check_rate_limit', {
    p_identifier: identifier,
    p_identifier_type: identifierType,
    p_endpoint: endpoint,
    p_max_requests: config.maxRequests,
    p_window_seconds: config.windowSeconds,
  });
  if (!result || result.length === 0) {
    return { allowed: true, remaining: config.maxRequests, resetAt: new Date(now.getTime() + config.windowSeconds * 1000) };
  }
  const row = result[0];
  return { allowed: row.allowed, remaining: row.remaining, resetAt: new Date(row.reset_at) };
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const WebhookMetadataSchema = z.object({
  user_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  credits: z.string().regex(/^\d+$/),
  pack_type: z.string().min(1).optional(),
  pack_name: z.string().min(1).optional(),
  price_id: z.string().optional(),
}).refine(data => data.pack_type || data.pack_name, {
  message: "Either pack_type or pack_name must be provided"
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

  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Rate limiting by IP (prevent webhook flooding)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rateLimitResult = await checkRateLimit(clientIp, 'ip', 'stripe-credit-webhook', {
    maxRequests: 100,
    windowSeconds: 60
  }, supabase);
  if (!rateLimitResult.allowed) {
    console.warn(`[stripe-credit-webhook] Rate limit exceeded for IP ${clientIp}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: addSecurityHeaders({ "Content-Type": "application/json" }),
    });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log(`[stripe-credit-webhook] Event received: ${event.type}, ID: ${event.id}`);

    // Check for duplicate event (replay protection)
    const { data: existingEvent } = await supabase
      .from('stripe_events_processed')
      .select('event_id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`[stripe-credit-webhook] Duplicate event detected: ${event.id}, skipping`);
      return new Response(
        JSON.stringify({ received: true, duplicate: true }),
        { 
          status: 200,
          headers: addSecurityHeaders({ "Content-Type": "application/json" }),
        }
      );
    }

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

      const { user_id: userId, workspace_id: workspaceId, credits: creditsStr, pack_type: packType, pack_name: packName } = validation.data;
      const credits = parseInt(creditsStr);
      const packLabel = packType || packName || 'unknown';

      console.log(`[stripe-credit-webhook] Adding ${credits} credits to workspace ${workspaceId}`);

      const { error: creditError } = await supabase
        .from('credits_ledger')
        .insert({
          workspace_id: workspaceId,
          delta: credits,
          reason: 'purchase',
          meta: {
            stripe_session_id: session.id,
            stripe_event_id: event.id,
            pack_label: packLabel,
            payment_intent: session.payment_intent,
          },
        });

      if (creditError) {
        console.error('[stripe-credit-webhook] Failed to add credits:', creditError);
        throw creditError;
      }

      console.log(`[stripe-credit-webhook] Successfully added ${credits} credits to workspace ${workspaceId}`);

      await supabase
        .from('audit_log')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'credit_purchase',
          target: `${credits} credits`,
          meta: {
            pack_label: packLabel,
            stripe_session_id: session.id,
            stripe_event_id: event.id,
            amount: session.amount_total,
            currency: session.currency,
          },
        });

      console.log(`[stripe-credit-webhook] Audit log created`);
    }

    // Mark event as processed
    const { error: insertError } = await supabase
      .from('stripe_events_processed')
      .insert({ event_id: event.id });

    if (insertError) {
      console.error('[stripe-credit-webhook] Failed to mark event as processed:', insertError);
    } else {
      console.log(`[stripe-credit-webhook] Event ${event.id} marked as processed`);
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
