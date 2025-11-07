import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_PACKAGES = {
  "10": { price: 9, credits: 10 },
  "50": { price: 40, credits: 50 },
  "100": { price: 75, credits: 100 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { package: packageKey, workspaceId } = await req.json();
    const selectedPackage = CREDIT_PACKAGES[packageKey as keyof typeof CREDIT_PACKAGES];
    
    if (!selectedPackage) {
      throw new Error("Invalid credit package");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for credit purchase
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${selectedPackage.credits} Premium Credits`,
              description: "Use for dark web monitoring, dating/NSFW searches, and premium exports",
            },
            unit_amount: selectedPackage.price * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?credits_purchased=${selectedPackage.credits}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?credits_cancelled=true`,
      metadata: {
        user_id: user.id,
        workspace_id: workspaceId,
        credits: selectedPackage.credits.toString(),
        package: packageKey,
        price_id: 'price_data', // Indicates this used price_data instead of priceId
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in purchase-credits:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
