import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side allowlist of valid credit pack price IDs
// This prevents price ID tampering from the client
const VALID_CREDIT_PACKS: Record<string, { credits: number; price: number; name: string }> = {
  // GBP prices (current)
  "price_1SiSphA3ptI9drLWm1pcbhil": { credits: 10, price: 500, name: "Tiny Pack" },
  "price_1SiSqdA3ptI9drLWHxUPXCRL": { credits: 50, price: 2000, name: "Small Pack" },
  "price_1SiSqpA3ptI9drLWZps53myc": { credits: 100, price: 3500, name: "Medium Pack" },
  "price_1SiSrBA3ptI9drLWPRWHVCrG": { credits: 500, price: 900, name: "OSINT Starter Pack" },
  "price_1SiSrNA3ptI9drLWyZjkEr4d": { credits: 2000, price: 2900, name: "Pro Pack" },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Credits Checkout] Request started');

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('[Credits Checkout] Missing authorization header');
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !data.user) {
      console.error('[Credits Checkout] Auth error:', authError);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = data.user;
    if (!user.email) {
      return new Response(JSON.stringify({ error: "User email required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`[Credits Checkout] User authenticated: ${user.id}`);

    // Parse and validate request body
    const body = await req.json();
    const { priceId, workspaceId } = body;
    
    if (!priceId || typeof priceId !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate priceId against server-side allowlist (ignore client-sent credits)
    const packInfo = VALID_CREDIT_PACKS[priceId];
    if (!packInfo) {
      console.error(`[Credits Checkout] Invalid/unknown priceId: ${priceId}`);
      return new Response(JSON.stringify({ error: "Invalid or archived price ID. Please refresh the page and try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!workspaceId || typeof workspaceId !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid workspaceId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`[Credits Checkout] Processing - priceId: ${priceId}, credits: ${packInfo.credits}, workspaceId: ${workspaceId}, pack: ${packInfo.name}`);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('[Credits Checkout] Stripe key not configured');
      return new Response(JSON.stringify({ error: "Payment system not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[Credits Checkout] Found existing customer: ${customerId}`);
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
      console.log(`[Credits Checkout] Created new customer: ${customerId}`);
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://footprintiq.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/settings/credits?success=true`,
      cancel_url: `${origin}/settings/credits?canceled=true`,
      metadata: {
        user_id: user.id,
        workspace_id: workspaceId,
        credits: packInfo.credits.toString(), // Use server-side credits value
        price_id: priceId,
        pack_name: packInfo.name,
      },
    });

    console.log(`[Credits Checkout] Created session: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[Credits Checkout] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
