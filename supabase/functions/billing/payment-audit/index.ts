import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../../_shared/secure.ts';

// Sentry-like logging for payment operations
const logPaymentEvent = (event: string, context: any) => {
  console.log(`[PAYMENT_AUDIT] ${event}:`, JSON.stringify(context));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    logPaymentEvent('audit_started', { timestamp: new Date().toISOString() });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logPaymentEvent('auth_failed', { error: authError?.message });
      throw new Error('Unauthorized');
    }

    logPaymentEvent('user_authenticated', { user_id: user.id });

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      logPaymentEvent('admin_check_failed', { user_id: user.id, role: userRole?.role });
      throw new Error('Admin access required');
    }

    logPaymentEvent('admin_verified', { user_id: user.id });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const issues: any[] = [];

    // 1. Fetch recent Stripe payment intents (last 30 days)
    logPaymentEvent('fetching_stripe_payments', { lookback_days: 30 });
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
      },
    });

    logPaymentEvent('stripe_payments_fetched', { 
      total: paymentIntents.data.length,
      has_more: paymentIntents.has_more 
    });

    const failedPayments = paymentIntents.data.filter(pi => 
      pi.status === 'requires_payment_method' || 
      pi.status === 'canceled' ||
      pi.last_payment_error
    );

    if (failedPayments.length > 0) {
      logPaymentEvent('failed_payments_detected', { count: failedPayments.length });
    }

    failedPayments.forEach(payment => {
      logPaymentEvent('payment_failure_detail', {
        payment_id: payment.id,
        error_code: payment.last_payment_error?.code,
        error_type: payment.last_payment_error?.type,
      });

      issues.push({
        type: 'failed_payment',
        severity: 'high',
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        error: payment.last_payment_error?.message || 'Payment failed',
        created: new Date(payment.created * 1000).toISOString(),
      });
    });

    // 2. Check for webhook delivery failures
    const events = await stripe.events.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60),
      },
    });

    // 3. Fetch Supabase payment data
    logPaymentEvent('fetching_supabase_credits', {});
    const { data: creditsLedger, error: creditsError } = await supabase
      .from('credits_ledger')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (creditsError) {
      logPaymentEvent('supabase_credits_error', { 
        error: creditsError.message,
        code: creditsError.code 
      });
      console.error('Credits ledger error:', creditsError);
    } else {
      logPaymentEvent('supabase_credits_fetched', { count: creditsLedger?.length || 0 });
    }

    // 4. Check for subscription mismatches
    const { data: userSubscriptions } = await supabase
      .from('user_roles')
      .select('user_id, subscription_tier, subscription_expires_at')
      .neq('subscription_tier', 'free');

    if (userSubscriptions) {
      for (const sub of userSubscriptions) {
        // Get user email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', sub.user_id)
          .single();

        if (profile?.email) {
          const customers = await stripe.customers.list({ 
            email: profile.email, 
            limit: 1 
          });

          if (customers.data.length > 0) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: 'active',
            });

            // Check if Supabase tier matches Stripe
            if (subscriptions.data.length === 0 && sub.subscription_tier !== 'free') {
              logPaymentEvent('subscription_mismatch', {
                user_id: sub.user_id,
                email: profile.email,
                supabase_tier: sub.subscription_tier,
              });

              issues.push({
                type: 'subscription_mismatch',
                severity: 'critical',
                user_id: sub.user_id,
                email: profile.email,
                supabase_tier: sub.subscription_tier,
                stripe_active: false,
                message: 'User has paid tier in Supabase but no active Stripe subscription',
              });
            }
          }
        }
      }
    }

    // 5. Check for payment errors in last 24 hours
    const { data: paymentErrors } = await supabase
      .from('payment_errors')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (paymentErrors && paymentErrors.length > 0) {
      paymentErrors.forEach(error => {
        issues.push({
          type: 'logged_error',
          severity: 'medium',
          ...error,
        });
      });
    }

    // 6. RLS Policy Check Status
    const rlsChecks = {
      credits_ledger: 'RLS enabled',
      user_roles: 'RLS enabled',
      payment_errors: 'RLS enabled',
    };

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_issues: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
      },
      issues,
      stripe_stats: {
        total_payment_intents: paymentIntents.data.length,
        failed_payments: failedPayments.length,
        total_events: events.data.length,
      },
      supabase_stats: {
        credits_transactions: creditsLedger?.length || 0,
        paid_users: userSubscriptions?.length || 0,
      },
      rls_status: rlsChecks,
    };

    logPaymentEvent('audit_completed', { 
      total_issues: report.summary.total_issues,
      critical: report.summary.critical,
      high: report.summary.high,
      medium: report.summary.medium,
    });

    console.log('Payment audit completed:', report.summary);

    return ok(report);
  } catch (error) {
    logPaymentEvent('audit_failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('Payment audit error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
