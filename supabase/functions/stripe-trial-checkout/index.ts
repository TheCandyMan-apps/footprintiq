import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RequestSchema = z.object({
  workspaceId: z.string().uuid(),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[stripe-trial-checkout][${timestamp}] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    logStep('Starting trial checkout request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep('ERROR: Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logStep('ERROR: Authentication failed', { error: authError?.message });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    // Check email verification
    if (!user.email_confirmed_at) {
      logStep('ERROR: Email not verified', { userId: user.id });
      return new Response(JSON.stringify({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      logStep('ERROR: Invalid request body', { error: validation.error });
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { workspaceId } = validation.data;

    // Get workspace and verify ownership/membership
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, owner_id, plan, subscription_tier, trial_status, stripe_customer_id')
      .eq('id', workspaceId)
      .single();

    if (wsError || !workspace) {
      logStep('ERROR: Workspace not found', { workspaceId, error: wsError?.message });
      return new Response(JSON.stringify({ error: 'Workspace not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is owner or member
    const isOwner = workspace.owner_id === user.id;
    
    if (!isOwner) {
      const { data: membership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        logStep('ERROR: User not authorized for workspace', { userId: user.id, workspaceId });
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check eligibility: no active trial
    if (workspace.trial_status === 'active') {
      logStep('ERROR: Trial already active', { workspaceId });
      return new Response(JSON.stringify({ 
        error: 'Trial already active',
        code: 'TRIAL_ALREADY_ACTIVE' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check eligibility: no prior Pro subscription
    if (workspace.subscription_tier === 'premium' || workspace.subscription_tier === 'enterprise' ||
        workspace.plan === 'pro' || workspace.plan === 'business') {
      logStep('ERROR: Already has Pro subscription', { workspaceId, tier: workspace.subscription_tier });
      return new Response(JSON.stringify({ 
        error: 'Already subscribed to Pro or higher',
        code: 'ALREADY_PRO' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check eligibility: no prior trial (converted or cancelled counts as prior trial)
    if (workspace.trial_status === 'converted' || workspace.trial_status === 'cancelled' || workspace.trial_status === 'expired') {
      logStep('ERROR: Already used trial', { workspaceId, trialStatus: workspace.trial_status });
      return new Response(JSON.stringify({ 
        error: 'Trial already used',
        code: 'TRIAL_ALREADY_USED' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Eligibility checks passed', { workspaceId, userId: user.id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Get Pro price ID
    const priceId = Deno.env.get('STRIPE_PRICE_PRO') || 'price_1ShgNPA3ptI9drLW40rbWMjq';
    
    const frontendUrl = Deno.env.get('VITE_APP_URL') || req.headers.get('origin') || 'https://footprintiq.app';

    // Create Stripe Checkout Session with trial
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always', // Require card upfront
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3, // 72 hours
        metadata: {
          is_trial: 'true',
          workspace_id: workspaceId,
        },
      },
      success_url: `${frontendUrl}/settings/billing?trial_started=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/settings/billing?trial_cancelled=true`,
      metadata: {
        workspace_id: workspaceId,
        user_id: user.id,
        is_trial: 'true',
      },
    };

    // Use existing customer if available
    if (workspace.stripe_customer_id) {
      sessionConfig.customer = workspace.stripe_customer_id;
    } else {
      sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep('Trial checkout session created', { 
      sessionId: session.id, 
      workspaceId,
      trialDays: 3 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR: Trial checkout failed', { error: errMessage });
    return new Response(
      JSON.stringify({ error: errMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
