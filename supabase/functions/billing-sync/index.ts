import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BillingSyncSchema = z.object({
  workspaceId: z.string().uuid(),
});

// Plan configuration matching frontend tiers.ts
const PLANS = {
  free: { id: 'free', scan_limit: 10 },
  pro: { id: 'pro', scan_limit: 100 },
  business: { id: 'business', scan_limit: null }, // unlimited
};

const PRICE_TO_PLAN: Record<string, 'pro' | 'business'> = {
  'price_1ShgNPA3ptI9drLW40rbWMjq': 'pro',
  'price_1ShdxJA3ptI9drLWjndMjptw': 'business',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[BILLING-SYNC] Starting billing sync request');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[BILLING-SYNC] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[BILLING-SYNC] Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    console.log('[BILLING-SYNC] User authenticated:', user.id);

    // Parse and validate request body
    const body = await req.json();
    const validation = BillingSyncSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[BILLING-SYNC] Invalid request body:', validation.error);
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
      console.warn('[BILLING-SYNC] Rate limit exceeded for user:', user.id);
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
      return new Response(JSON.stringify({ error: 'Not a workspace member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get workspace's Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('workspace_id', workspaceId)
      .single();

    if (!subscription?.stripe_customer_id) {
      // No Stripe customer yet - workspace is on free plan
      await supabase
        .from('workspaces')
        .update({
          plan: 'free',
          scan_limit_monthly: PLANS.free.scan_limit,
        })
        .eq('id', workspaceId);

    console.log('[BILLING-SYNC] No Stripe customer, workspace on free plan');
    return new Response(
      JSON.stringify({
        plan: 'free',
        status: 'active',
        scans_used: 0,
        scans_limit: PLANS.free.scan_limit,
      }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      }
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
      // No active subscription - downgrade to free
      await Promise.all([
        supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date().toISOString(),
          })
          .eq('workspace_id', workspaceId),
        supabase
          .from('workspaces')
          .update({
            plan: 'free',
            scan_limit_monthly: PLANS.free.scan_limit,
          })
          .eq('id', workspaceId),
      ]);

      return new Response(
        JSON.stringify({
          plan: 'free',
          status: 'canceled',
          scans_used: 0,
          scans_limit: PLANS.free.scan_limit,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Active subscription found
    const activeSubscription = subscriptions.data[0];
    const priceId = activeSubscription.items.data[0]?.price.id;
    const plan = PRICE_TO_PLAN[priceId] || 'free';
    const scanLimit = PLANS[plan].scan_limit;

    // Update subscription and workspace records
    await Promise.all([
      supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: activeSubscription.id,
          stripe_price_id: priceId,
          status: activeSubscription.status,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          scan_limit_monthly: scanLimit,
        })
        .eq('workspace_id', workspaceId),
      supabase
        .from('workspaces')
        .update({
          plan,
          scan_limit_monthly: scanLimit,
        })
        .eq('id', workspaceId),
    ]);

    // Get current usage
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('scans_used_monthly')
      .eq('id', workspaceId)
      .single();

    return new Response(
      JSON.stringify({
        plan,
        status: activeSubscription.status,
        scans_used: workspaceData?.scans_used_monthly || 0,
        scans_limit: scanLimit,
        period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Billing sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
