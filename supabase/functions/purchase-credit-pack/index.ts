import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit pack mappings
const CREDIT_PACKS = {
  'starter': {
    priceId: 'price_1SRP2KPNdM5SAyj7j99PagEP',
    productId: 'prod_TOBP5MSoYtgefY',
    credits: 500,
    name: 'OSINT Starter Pack'
  },
  'pro': {
    priceId: 'price_1SRP2WPNdM5SAyj7GLCvttAF',
    productId: 'prod_TOBP6U1ZvowHE7',
    credits: 2000,
    name: 'Pro Pack'
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log(`[purchase-credit-pack] User ${user.id} initiating purchase`);

    // Parse request body
    const { packType, workspaceId } = await req.json();

    if (!packType || !CREDIT_PACKS[packType as keyof typeof CREDIT_PACKS]) {
      throw new Error("Invalid pack type");
    }

    if (!workspaceId) {
      throw new Error("Workspace ID required");
    }

    const pack = CREDIT_PACKS[packType as keyof typeof CREDIT_PACKS];

    console.log(`[purchase-credit-pack] Creating checkout for ${pack.name} (${pack.credits} credits)`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/settings/billing?credits_success=true&pack=${packType}`,
      cancel_url: `${req.headers.get("origin")}/settings/billing?credits_canceled=true`,
      metadata: {
        user_id: user.id,
        workspace_id: workspaceId,
        pack_type: packType,
        credits: pack.credits.toString(),
      },
    });

    console.log(`[purchase-credit-pack] Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[purchase-credit-pack] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
