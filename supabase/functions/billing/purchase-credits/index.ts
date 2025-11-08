import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`[RETRY] Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[RETRY] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Sentry-like error logging
const logError = (context: string, error: any, metadata?: any) => {
  console.error(`[CREDIT_PURCHASE_ERROR] ${context}:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    metadata,
    timestamp: new Date().toISOString(),
  });
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logError("auth", "No authorization header", { headers: Object.fromEntries(req.headers) });
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !data.user?.email) {
      logError("auth", authError || "No user", { token: token.substring(0, 10) + "..." });
      throw new Error("User not authenticated");
    }

    const user = data.user;
    console.log(`[PURCHASE] User ${user.email} initiated credit purchase`);

    const body = await req.json();
    const { package: packageKey, workspaceId } = body;
    
    if (!packageKey || !workspaceId) {
      logError("validation", "Missing required fields", { body });
      throw new Error("Missing package or workspaceId");
    }

    const selectedPackage = CREDIT_PACKAGES[packageKey as keyof typeof CREDIT_PACKAGES];
    
    if (!selectedPackage) {
      logError("validation", "Invalid package", { packageKey });
      throw new Error("Invalid credit package");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer with retries
    console.log(`[PURCHASE] Finding customer for ${user.email}`);
    const customers = await retryWithBackoff(
      () => stripe.customers.list({ email: user.email, limit: 1 }),
      3,
      1000
    );
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[PURCHASE] Found existing customer ${customerId}`);
    } else {
      console.log(`[PURCHASE] Creating new customer for ${user.email}`);
    }

    // Create checkout session with timeout and retries
    console.log(`[PURCHASE] Creating checkout session for ${selectedPackage.credits} credits`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const session = await retryWithBackoff(
        () => stripe.checkout.sessions.create({
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
                unit_amount: selectedPackage.price * 100,
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
            price_id: 'price_data',
          },
        }),
        3,
        1000
      );
      
      clearTimeout(timeoutId);
      console.log(`[PURCHASE] Checkout session created: ${session.id}`);

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        logError("timeout", "Stripe API timeout after 15s", { user: user.email });
        throw new Error("Request timeout - please try again");
      }
      throw error;
    }
  } catch (error) {
    logError("purchase", error, { 
      endpoint: "purchase-credits",
      failureRate: "tracked",
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        code: "purchase_failed"
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
