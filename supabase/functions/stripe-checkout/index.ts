import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const CheckoutSchema = z.object({
  workspaceId: z.string().uuid(),
  plan: z.enum(['pro', 'business']),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: addSecurityHeaders(corsHeaders) });
  }

  if (req.method !== 'POST') {
    console.warn('[STRIPE-CHECKOUT] Invalid method:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  }

  try {
    console.log('[STRIPE-CHECKOUT] Starting checkout request');
    
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[STRIPE-CHECKOUT] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'MISSING_AUTH' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    // IMPORTANT: attach the caller JWT to the Supabase client so RLS evaluates as the user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[STRIPE-CHECKOUT] Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    console.log('[STRIPE-CHECKOUT] User authenticated:', user.id);

    // Parse and validate request body
    const body = await req.json();
    const validation = CheckoutSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[STRIPE-CHECKOUT] Invalid request body:', validation.error);
      return new Response(JSON.stringify({ error: 'Invalid request body', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { workspaceId, plan } = validation.data;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      userId: user.id,
      tier: 'basic',
      endpoint: 'stripe-checkout',
    });

    if (!rateLimitResult.allowed) {
      console.warn('[STRIPE-CHECKOUT] Rate limit exceeded for user:', user.id);
      return rateLimitResult.response!;
    }

    // Verify user can act on this workspace (member OR owner)
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .maybeSingle();

    const isOwner = !!workspace && workspace.owner_id === user.id;
    const isMember = !!membership && !membershipError;

    if (workspaceError || !workspace) {
      console.error('[STRIPE-CHECKOUT] Workspace not found or not accessible', { workspaceId, workspaceError });
      return new Response(JSON.stringify({ error: 'Workspace not found' }), {
        status: 404,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    if (!isMember && !isOwner) {
      console.warn('[STRIPE-CHECKOUT] Not authorized for workspace', { workspaceId, userId: user.id });
      return new Response(JSON.stringify({ error: 'Not authorized for workspace' }), {
        status: 403,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    console.log('[STRIPE-CHECKOUT] Workspace access OK', { workspaceId, isOwner, isMember });

    // Get Stripe price ID from environment
    const priceIdEnvVar = plan === 'pro' ? 'STRIPE_PRICE_PRO' : 'STRIPE_PRICE_BUSINESS';
    const priceId = Deno.env.get(priceIdEnvVar);

    if (!priceId) {
      console.error(`Missing environment variable: ${priceIdEnvVar}`);
      return new Response(JSON.stringify({ error: 'Stripe configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('workspace_id', workspaceId)
      .single();

    const frontendUrl = Deno.env.get('VITE_APP_URL') || req.headers.get('origin') || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/settings/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${frontendUrl}/settings/billing`,
      metadata: {
        workspace_id: workspaceId,
        plan: plan,
        user_id: user.id,
      },
    };

    // If customer exists, attach to session
    if (existingSubscription?.stripe_customer_id) {
      sessionConfig.customer = existingSubscription.stripe_customer_id;
    } else {
      sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('[STRIPE-CHECKOUT] Session created:', session.id);

    // Log the checkout session for abandoned checkout tracking
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { error: trackingError } = await serviceSupabase
      .from('checkout_sessions')
      .insert({
        stripe_session_id: session.id,
        user_id: user.id,
        workspace_id: workspaceId,
        plan: plan,
        status: 'pending',
        metadata: { price_id: priceId, customer_email: user.email },
      });

    if (trackingError) {
      // Non-blocking: don't fail checkout if tracking fails
      console.warn('[STRIPE-CHECKOUT] Failed to log checkout session for tracking:', trackingError.message);
    } else {
      console.log('[STRIPE-CHECKOUT] Checkout session tracked for abandonment monitoring');
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
