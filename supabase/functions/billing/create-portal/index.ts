import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error('Unauthorized');

    const { workspace_id } = await req.json();
    if (!workspace_id) throw new Error('Missing workspace_id');

    // Get Stripe customer ID
    const { data: billing, error: billingError } = await supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('workspace_id', workspace_id)
      .single();

    if (billingError || !billing?.stripe_customer_id) {
      throw new Error('No billing customer found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/settings/billing`,
    });

    return ok({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
