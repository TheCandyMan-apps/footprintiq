import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';
import { resolvePriceId, getKnownPriceIds, tierToFrontendPlan } from '../_shared/stripePlans.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BillingSyncSchema = z.object({
  workspaceId: z.string().uuid(),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[billing-sync][${timestamp}] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting billing sync request');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep('ERROR: Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logStep('ERROR: Authentication failed', { error: authError?.message });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    logStep('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    const validation = BillingSyncSchema.safeParse(body);
    
    if (!validation.success) {
      logStep('ERROR: Invalid request body', { error: validation.error.issues });
      return new Response(JSON.stringify({ error: 'Invalid request body', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { workspaceId } = validation.data;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      userId: user.id,
      tier: 'basic',
      endpoint: 'billing-sync',
    });

    if (!rateLimitResult.allowed) {
      logStep('WARNING: Rate limit exceeded', { userId: user.id });
      return rateLimitResult.response!;
    }

    // Verify workspace membership
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      logStep('ERROR: Not a workspace member', { workspaceId, userId: user.id });
      return new Response(JSON.stringify({ error: 'Not a workspace member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get workspace's current state and Stripe customer ID
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('plan, subscription_tier, scans_used_monthly, scan_limit_monthly')
      .eq('id', workspaceId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('workspace_id', workspaceId)
      .single();

    if (!subscription?.stripe_customer_id) {
      // No Stripe customer yet - workspace is on free plan (but don't downgrade if already paid)
      if (workspaceData?.plan && workspaceData.plan !== 'free') {
        logStep('No Stripe customer but workspace has paid plan - keeping existing', { 
          currentPlan: workspaceData.plan 
        });
        return new Response(
          JSON.stringify({
            plan: workspaceData.plan,
            status: 'active',
            scans_used: workspaceData.scans_used_monthly || 0,
            scans_limit: workspaceData.scan_limit_monthly,
          }),
          { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
        );
      }

      logStep('No Stripe customer, workspace on free plan');
      return new Response(
        JSON.stringify({
          plan: 'free',
          status: 'active',
          scans_used: workspaceData?.scans_used_monthly || 0,
          scans_limit: 10,
        }),
        { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Fetch active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: subscription.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription in Stripe
      logStep('No active Stripe subscription found', { customerId: subscription.stripe_customer_id });
      
      // Update subscription record to canceled
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          current_period_end: new Date().toISOString(),
        })
        .eq('workspace_id', workspaceId);
      
      // Downgrade workspace to free
      await supabase
        .from('workspaces')
        .update({
          plan: 'free',
          subscription_tier: 'free',
          scan_limit_monthly: 10,
        })
        .eq('id', workspaceId);

      return new Response(
        JSON.stringify({
          plan: 'free',
          status: 'canceled',
          scans_used: workspaceData?.scans_used_monthly || 0,
          scans_limit: 10,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Active subscription found - resolve using canonical mapping
    const activeSubscription = subscriptions.data[0];
    const priceId = activeSubscription.items.data[0]?.price.id;
    const resolution = resolvePriceId(priceId);

    logStep('Resolved price ID', { 
      priceId, 
      tier: resolution.tier,
      plan: resolution.plan,
      scanLimit: resolution.scanLimit,
      known: resolution.known 
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL: If price ID is unknown, DO NOT downgrade to free
    // Log an error and keep existing tier
    // ═══════════════════════════════════════════════════════════════════════════════
    if (!resolution.known) {
      logStep('WARNING: Unknown Stripe price ID - NOT downgrading user', { 
        priceId,
        knownPrices: getKnownPriceIds(),
        keepingPlan: workspaceData?.plan || 'unknown'
      });

      // Log to system_errors for admin visibility
      await supabase.from('system_errors').insert({
        error_code: 'UNKNOWN_STRIPE_PRICE',
        error_message: `Unknown Stripe price ID in billing-sync: ${priceId}`,
        function_name: 'billing-sync',
        workspace_id: workspaceId,
        user_id: user.id,
        severity: 'error',
        metadata: {
          priceId,
          subscriptionId: activeSubscription.id,
          customerId: subscription.stripe_customer_id,
          knownPrices: getKnownPriceIds(),
          currentPlan: workspaceData?.plan,
        },
      });

      // Return existing plan state without modifying
      return new Response(
        JSON.stringify({
          plan: workspaceData?.plan || 'free',
          status: activeSubscription.status,
          scans_used: workspaceData?.scans_used_monthly || 0,
          scans_limit: workspaceData?.scan_limit_monthly || 10,
          period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          warning: 'unknown_price_id',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update subscription and workspace records with resolved values
    await Promise.all([
      supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: activeSubscription.id,
          stripe_price_id: priceId,
          status: activeSubscription.status,
          plan: resolution.plan,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          scan_limit_monthly: resolution.scanLimit,
        })
        .eq('workspace_id', workspaceId),
      supabase
        .from('workspaces')
        .update({
          plan: resolution.plan,
          subscription_tier: resolution.tier,
          scan_limit_monthly: resolution.scanLimit,
        })
        .eq('id', workspaceId),
    ]);

    logStep('Updated workspace and subscription', { 
      workspaceId,
      plan: resolution.plan,
      tier: resolution.tier,
      scanLimit: resolution.scanLimit 
    });

    return new Response(
      JSON.stringify({
        plan: resolution.plan,
        tier: resolution.tier,
        status: activeSubscription.status,
        scans_used: workspaceData?.scans_used_monthly || 0,
        scans_limit: resolution.scanLimit,
        period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR: Billing sync failed', { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
