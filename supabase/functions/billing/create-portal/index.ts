import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../../_shared/auth-utils.ts';
import { checkRateLimit } from '../../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PortalRequestSchema = z.object({
  // No body params needed
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }

  try {
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

    // Rate limiting - 10 requests/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'billing-create-portal', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      console.error('[billing-create-portal] No Stripe customer found:', userEmail);
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found' }),
        { status: 404, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/settings/billing`,
    });

    console.log('[billing-create-portal] Portal session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  } catch (error) {
    console.error('[billing-create-portal] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
