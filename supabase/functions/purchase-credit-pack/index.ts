import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PurchaseRequestSchema = z.object({
  packType: z.enum(['starter', 'pro']),
  workspaceId: z.string().uuid(),
});

// Credit pack mappings - using correct Stripe price IDs
const CREDIT_PACKS = {
  'starter': {
    priceId: 'price_1ShybzA3ptI9drLWWxLWAMYN',
    productId: 'prod_TfJEFdAKyUzqTX',
    credits: 500,
    name: 'OSINT Starter Pack'
  },
  'pro': {
    priceId: 'price_1ShycjA3ptI9drLW6zWBiEj4',
    productId: 'prod_TfJFObINjrsLxO',
    credits: 2000,
    name: 'Pro Pack'
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { userId, email } = authResult.context;

    // Rate limiting - 10 purchases per hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'purchase-credit-pack', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = PurchaseRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { packType, workspaceId } = validation.data;

    const pack = CREDIT_PACKS[packType];

    console.log(`[purchase-credit-pack] User ${userId} purchasing ${pack.name} (${pack.credits} credits)`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/scan/advanced?credits_success=true&pack=${packType}&credits=${pack.credits}`,
      cancel_url: `${req.headers.get("origin")}/scan/advanced?credits_canceled=true`,
      metadata: {
        user_id: userId,
        workspace_id: workspaceId,
        pack_type: packType,
        credits: pack.credits.toString(),
      },
    });

    console.log(`[purchase-credit-pack] Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
      status: 200,
    });
  } catch (error) {
    console.error('[purchase-credit-pack] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
      status: 500,
    });
  }
});
