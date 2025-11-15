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
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// Credit packages available for purchase
const CREDIT_PACKAGES: Record<string, { credits: number; price: number; priceId: string }> = {
  starter: { credits: 50, price: 999, priceId: "price_starter_credits" },
  pro: { credits: 200, price: 2999, priceId: "price_pro_credits" },
  enterprise: { credits: 1000, price: 9999, priceId: "price_enterprise_credits" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Credits Checkout] Request started');

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('[Credits Checkout] Missing authorization header');
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error('[Credits Checkout] Auth error:', authError);
      throw new Error("Authentication failed");
    }

    const user = data.user;
    if (!user?.email) {
      console.error('[Credits Checkout] No user or email found');
      throw new Error("User not authenticated");
    }

    console.log(`[Credits Checkout] User authenticated: ${user.id}`);

    const body = await req.json();
    const { priceId, credits, workspaceId } = body;
    
    // Validate payload
    if (!priceId || typeof priceId !== 'string') {
      console.error('[Credits Checkout] Invalid priceId:', priceId);
      throw new Error("Invalid priceId: must be a non-empty string");
    }
    
    if (!credits || typeof credits !== 'number' || credits <= 0) {
      console.error('[Credits Checkout] Invalid credits:', credits);
      throw new Error("Invalid credits: must be a positive number");
    }

    if (!workspaceId || typeof workspaceId !== 'string') {
      console.error('[Credits Checkout] Invalid workspaceId:', workspaceId);
      throw new Error("Invalid workspaceId: must be a non-empty string");
    }

    console.log(`[Credits Checkout] Validated payload - priceId: ${priceId}, credits: ${credits}, workspaceId: ${workspaceId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
      maxNetworkRetries: 2,
    });

    // Find or create Stripe customer with retry
    let customerId: string;
    try {
      customerId = await retryWithBackoff(async () => {
        console.log(`[Credits Checkout] Looking up customer: ${user.email}`);
        const customers = await stripe.customers.list({ 
          email: user.email, 
          limit: 1 
        });
        
        if (customers.data.length > 0) {
          console.log(`[Credits Checkout] Found existing customer: ${customers.data[0].id}`);
          return customers.data[0].id;
        }

        console.log(`[Credits Checkout] Creating new customer`);
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        console.log(`[Credits Checkout] Created customer: ${customer.id}`);
        return customer.id;
      });
    } catch (error) {
      console.error('[Credits Checkout] Customer lookup/creation failed after retries:', error);
      throw new Error("Failed to process customer information");
    }

    // Create checkout session with retry
    let session: Stripe.Checkout.Session;
    try {
      session = await retryWithBackoff(async () => {
        console.log(`[Credits Checkout] Creating checkout session for customer ${customerId}`);
        
        return await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${req.headers.get("origin")}/settings/credits?success=true`,
          cancel_url: `${req.headers.get("origin")}/settings/credits?canceled=true`,
          metadata: {
            user_id: user.id,
            workspace_id: workspaceId,
            credits: credits.toString(),
            price_id: priceId,
          },
        });
      });
      
      console.log(`[Credits Checkout] Created checkout session: ${session.id}`);
    } catch (error) {
      console.error('[Credits Checkout] Checkout session creation failed after retries:', error);
      
      // Log specific Stripe errors
      if (error instanceof Stripe.errors.StripeError) {
        const stripeError = error as Stripe.errors.StripeError;
        console.error('[Credits Checkout] Stripe error details:', {
          type: stripeError.type || 'unknown',
          code: stripeError.code || 'unknown',
          message: stripeError.message,
        });
      }
      
      throw new Error("Failed to create checkout session");
    }

    const duration = Date.now() - startTime;
    console.log(`[Credits Checkout] Success - Duration: ${duration}ms`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Credits Checkout] Error after ${duration}ms:`, error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isStripeError = error instanceof Stripe.errors.StripeError;
    const stripeError = isStripeError ? error as Stripe.errors.StripeError : null;
    const errorType = stripeError?.type || 'general_error';
    
    // Log error for monitoring
    console.error('[Credits Checkout] Error details:', {
      message: errorMessage,
      type: errorType,
      duration,
    });

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        type: errorType,
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && error.message.includes("Authentication") ? 401 : 500,
      }
    );
  }
});
