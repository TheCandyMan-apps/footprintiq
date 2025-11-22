/**
 * Stripe Entitlement Reconciliation
 * 
 * Purpose: Ensure workspace plan/entitlements always match Stripe subscription state
 * Triggered by: Stripe webhook OR daily cron
 * 
 * Handles:
 * - Upgrade
 * - Downgrade
 * - Cancel at period end
 * - Immediate cancellation
 * - Payment failed → grace period → revert to free
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkspaceEntitlement {
  workspace_id: string;
  plan: string;
  subscription_tier: string;
  scan_limit_monthly: number | null;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    console.log('[reconcile-entitlements] Starting reconciliation');

    // Get all workspaces with Stripe subscription IDs
    const { data: billingCustomers, error: billingError } = await supabase
      .from('billing_customers')
      .select('workspace_id, stripe_subscription_id, plan, status')
      .not('stripe_subscription_id', 'is', null);

    if (billingError) {
      console.error('[reconcile-entitlements] Error fetching billing customers:', billingError);
      throw billingError;
    }

    console.log(`[reconcile-entitlements] Found ${billingCustomers?.length || 0} workspaces with Stripe subscriptions`);

    const reconciliations: Array<{
      workspace_id: string;
      old_plan: string;
      new_plan: string;
      action: string;
    }> = [];

    // Process each workspace
    for (const customer of billingCustomers || []) {
      try {
        // Fetch current Stripe subscription
        const subscription = await stripe.subscriptions.retrieve(customer.stripe_subscription_id);
        
        console.log(`[reconcile-entitlements] Workspace ${customer.workspace_id}: Stripe status=${subscription.status}`);

        // Determine target plan based on Stripe status
        let targetPlan: string;
        let targetTier: string;
        let targetScanLimit: number | null;
        let targetStatus: string;

        switch (subscription.status) {
          case 'active':
            // Extract plan from subscription items
            const priceId = subscription.items.data[0]?.price.id;
            // Map price ID to plan (adjust based on your Stripe price IDs)
            if (priceId?.includes('pro')) {
              targetPlan = 'pro';
              targetTier = 'basic';
              targetScanLimit = 100;
            } else if (priceId?.includes('premium') || priceId?.includes('unlimited')) {
              targetPlan = 'premium';
              targetTier = 'premium';
              targetScanLimit = null; // unlimited
            } else if (priceId?.includes('business') || priceId?.includes('enterprise')) {
              targetPlan = 'business';
              targetTier = 'enterprise';
              targetScanLimit = null; // unlimited
            } else {
              targetPlan = 'free';
              targetTier = 'free';
              targetScanLimit = 10;
            }
            targetStatus = 'active';
            break;

          case 'trialing':
            // During trial, maintain premium features
            targetPlan = 'premium';
            targetTier = 'premium';
            targetScanLimit = null;
            targetStatus = 'trialing';
            break;

          case 'past_due':
            // Grace period - maintain current plan for 7 days
            const pastDueDate = new Date(subscription.current_period_end * 1000);
            const gracePeriodEnd = new Date(pastDueDate);
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
            
            if (new Date() > gracePeriodEnd) {
              // Grace period expired
              targetPlan = 'free';
              targetTier = 'free';
              targetScanLimit = 10;
              targetStatus = 'past_due_expired';
            } else {
              // Still in grace period
              targetPlan = customer.plan;
              targetTier = customer.plan;
              targetScanLimit = customer.plan === 'free' ? 10 : (customer.plan === 'pro' ? 100 : null);
              targetStatus = 'past_due';
            }
            break;

          case 'canceled':
          case 'unpaid':
          case 'incomplete_expired':
            // Revert to free immediately
            targetPlan = 'free';
            targetTier = 'free';
            targetScanLimit = 10;
            targetStatus = 'canceled';
            break;

          case 'incomplete':
            // Payment setup not complete - wait
            continue;

          default:
            console.warn(`[reconcile-entitlements] Unknown subscription status: ${subscription.status}`);
            continue;
        }

        // Check if update needed
        if (customer.plan !== targetPlan || customer.status !== targetStatus) {
          console.log(`[reconcile-entitlements] Updating workspace ${customer.workspace_id}: ${customer.plan} → ${targetPlan}`);

          // Update billing_customers
          const { error: updateBillingError } = await supabase
            .from('billing_customers')
            .update({
              plan: targetPlan,
              status: targetStatus,
              period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('workspace_id', customer.workspace_id);

          if (updateBillingError) {
            console.error(`[reconcile-entitlements] Error updating billing for workspace ${customer.workspace_id}:`, updateBillingError);
            continue;
          }

          // Update workspaces table
          const { error: updateWorkspaceError } = await supabase
            .from('workspaces')
            .update({
              plan: targetPlan,
              subscription_tier: targetTier,
              scan_limit_monthly: targetScanLimit,
              updated_at: new Date().toISOString(),
            })
            .eq('id', customer.workspace_id);

          if (updateWorkspaceError) {
            console.error(`[reconcile-entitlements] Error updating workspace ${customer.workspace_id}:`, updateWorkspaceError);
            continue;
          }

          // Log audit activity
          await supabase.from('audit_activity').insert({
            workspace_id: customer.workspace_id,
            action: 'entitlement_reconciled',
            meta: {
              old_plan: customer.plan,
              new_plan: targetPlan,
              stripe_status: subscription.status,
              reconciled_at: new Date().toISOString(),
            },
          });

          reconciliations.push({
            workspace_id: customer.workspace_id,
            old_plan: customer.plan,
            new_plan: targetPlan,
            action: 'reconciled',
          });
        }
      } catch (error) {
        console.error(`[reconcile-entitlements] Error processing workspace ${customer.workspace_id}:`, error);
        // Continue with next workspace
      }
    }

    console.log(`[reconcile-entitlements] Reconciled ${reconciliations.length} workspaces`);

    return new Response(
      JSON.stringify({
        success: true,
        reconciled_count: reconciliations.length,
        reconciliations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[reconcile-entitlements] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
