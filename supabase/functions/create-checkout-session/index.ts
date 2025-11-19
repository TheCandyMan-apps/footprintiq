import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit packages with Stripe price IDs
const CREDIT_PACKAGES: Record<string, { credits: number; priceId: string }> = {
  "10": { credits: 10, priceId: "price_1SQtRIPNdM5SAyj7WIxLQDeq" },
  "50": { credits: 50, priceId: "price_1SQtTSPNdM5SAyj77N2cBl6B" },
  "100": { credits: 100, priceId: "price_1SQtTfPNdM5SAyj7jrfjyTL7" },
  "500": { credits: 500, priceId: "price_1SQtUCPNdM5SAyj7Zat6OZcB" },
};

const CheckoutRequestSchema = z.object({
  credits: z.number().int().positive(),
  workspaceId: z.string().uuid(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier, email } = authResult.context;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'create-checkout-session',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const validation = validateRequestBody(body, CheckoutRequestSchema);

    if (!validation.valid) {
      return secureJsonResponse({ error: validation.error || 'Invalid input' }, 400);
    }

    const { credits, workspaceId } = validation.data!;

    // Get credit package
    const creditPackage = CREDIT_PACKAGES[credits.toString()];
    if (!creditPackage) {
      return new Response(
        JSON.stringify({ error: `Invalid credit amount. Available: ${Object.keys(CREDIT_PACKAGES).join(", ")}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ 
      email: email || '', 
      limit: 1 
    });

    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL") || "";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: creditPackage.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/scan/advanced?success=true&credits=${credits}`,
      cancel_url: `${origin}/scan/advanced?canceled=true`,
      metadata: {
        user_id: userId,
        workspace_id: workspaceId,
        credits: credits.toString(),
        purchase_type: "credits",
      },
    });

    console.log("Checkout session created:", {
      sessionId: session.id,
      userId,
      workspaceId,
      credits,
    });

    return secureJsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return secureJsonResponse(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      500
    );
  }
});
