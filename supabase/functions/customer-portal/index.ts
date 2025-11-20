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

const PortalRequestSchema = z.object({
  // No body params needed for customer portal
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[customer-portal] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    logStep("Function started");

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;
    const userEmail = authResult.context.email;
    logStep("User authenticated", { userId, email: userEmail });

    // Rate limiting - 10 requests/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'customer-portal', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId });
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found", { email: userEmail });
      return new Response(
        JSON.stringify({ error: "No Stripe customer found. Please subscribe first." }),
        { status: 404, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  }
});
