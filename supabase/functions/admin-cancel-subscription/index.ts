import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { authenticateRequest } from '../_shared/auth-utils.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CancelRequestSchema = z.object({
  email: z.string().email('Valid email required'),
  reason: z.string().optional(),
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
    // Admin-only authentication
    const auth = await authenticateRequest(req, { requireAdmin: true });
    if (!auth.success || !auth.context) {
      return auth.response!;
    }

    const body = await req.json();
    const parsed = CancelRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { email, reason } = parsed.data;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found for this email' }),
        { status: 404, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const customerId = customers.data[0].id;

    // Find active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active subscriptions found for this customer' }),
        { status: 404, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Cancel all active subscriptions (cancel at period end for graceful cancellation)
    const cancelled = [];
    for (const sub of subscriptions.data) {
      const updated = await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by: 'admin',
          admin_user_id: auth.context.userId,
          cancel_reason: reason || 'Admin-initiated cancellation',
        },
      });
      cancelled.push({
        subscriptionId: updated.id,
        status: updated.status,
        cancelAtPeriodEnd: updated.cancel_at_period_end,
        currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
      });
    }

    // Log in audit
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('activity_logs').insert({
      user_id: auth.context.userId,
      action: 'subscription.cancelled',
      entity_type: 'billing',
      entity_id: customerId,
      metadata: {
        target_email: email,
        cancelled_subscriptions: cancelled,
        reason: reason || 'Admin-initiated cancellation',
      },
    });

    console.log(`[admin-cancel-subscription] Admin ${auth.context.email} cancelled subs for ${email}:`, cancelled);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cancelled ${cancelled.length} subscription(s). Access continues until period end.`,
        cancelled,
      }),
      { status: 200, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  } catch (error) {
    console.error('[admin-cancel-subscription] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
