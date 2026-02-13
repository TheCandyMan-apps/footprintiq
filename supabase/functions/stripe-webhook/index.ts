import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";
import { logSecurityEvent } from "../_shared/security-validation.ts";
import { resolvePriceId, getKnownPriceIds } from "../_shared/stripePlans.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[stripe-webhook][${timestamp}] ${step}`, details ? JSON.stringify(details) : '');
};

// Helper to safely convert Stripe timestamps (seconds since epoch) to ISO strings
function safeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined || isNaN(timestamp)) {
    return null;
  }
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
}

serve(async (req) => {
  try {
    // Rate limiting by IP to prevent webhook flooding
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await checkRateLimit(ipAddress, 'ip', 'stripe-webhook', {
      maxRequests: 100,
      windowSeconds: 60
    });
    
    if (!rateLimitResult.allowed) {
      console.warn(`[stripe-webhook] Rate limit exceeded for IP: ${ipAddress}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ "Content-Type": "application/json" }) }
      );
    }

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      logStep("ERROR: Missing signature or webhook secret", { hasSignature: !!signature, hasSecret: !!webhookSecret });
      await logSecurityEvent(supabase, {
        type: "auth_failure",
        severity: "high",
        endpoint: "stripe-webhook",
        message: "Missing Stripe signature",
        ipAddress,
        userAgent: req.headers.get("user-agent") || "unknown",
      });
      return new Response(
        JSON.stringify({ error: "Missing signature" }), 
        { status: 400, headers: addSecurityHeaders({ "Content-Type": "application/json" }) }
      );
    }

    const body = await req.text();
    
    // Validate webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Signature verification failed", { error: errMessage });
      await logSecurityEvent(supabase, {
        type: "auth_failure",
        severity: "critical",
        endpoint: "stripe-webhook",
        message: "Invalid Stripe webhook signature",
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      });
      return new Response(
        JSON.stringify({ error: "Invalid signature" }), 
        { status: 400, headers: addSecurityHeaders({ "Content-Type": "application/json" }) }
      );
    }

    logStep("Processing event", { type: event.type, id: event.id });

    // Check for duplicate events (idempotency)
    const eventId = event.id;
    const { data: existing } = await supabase
      .from('stripe_events_processed')
      .select('event_id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      logStep('Duplicate event ignored', { eventId });
      return new Response(JSON.stringify({ ok: true, duplicate: true }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          mode: session.mode,
          customerId: session.customer,
          metadata: session.metadata 
        });

        // Mark checkout session as completed for abandonment tracking
        const { error: trackingUpdateError } = await supabase
          .from('checkout_sessions')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString(),
            amount_total: session.amount_total,
            currency: session.currency,
          })
          .eq('stripe_session_id', session.id);
        
        if (trackingUpdateError) {
          logStep("WARN: Failed to update checkout_sessions tracking", { error: trackingUpdateError.message });
        } else {
          logStep("Checkout session marked as completed in tracking", { sessionId: session.id });
        }
        
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session);
        } else {
          await handleCreditPurchase(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { 
          type: event.type,
          subscriptionId: subscription.id, 
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id
        });
        
        await handleSubscriptionChange(subscription, event.type);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { 
          subscriptionId: subscription.id, 
          customerId: subscription.customer 
        });
        
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session expired (abandoned)", { sessionId: session.id });

        const { error: expiredError } = await supabase
          .from('checkout_sessions')
          .update({ 
            status: 'expired', 
            expired_at: new Date().toISOString() 
          })
          .eq('stripe_session_id', session.id);
        
        if (expiredError) {
          logStep("WARN: Failed to mark checkout as expired", { error: expiredError.message });
        } else {
          logStep("Checkout session marked as expired/abandoned", { sessionId: session.id });
        }
        break;
      }

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase.from('stripe_events_processed').insert({ event_id: eventId });
    logStep("Event marked as processed", { eventId });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Webhook handler failed", { error: errMessage });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook handler failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// HANDLER: Subscription Checkout Completed
// ════════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  logStep("Processing subscription checkout", { customerId, subscriptionId, metadata: session.metadata });
  
  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    logStep("ERROR: Customer was deleted", { customerId });
    return;
  }
  
  const email = customer.email;
  if (!email) {
    logStep("ERROR: Customer has no email", { customerId });
    return;
  }
  
  // Find user by email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    logStep("ERROR: Failed to list users", { error: userError.message });
    return;
  }
  
  const user = userData?.users.find(u => u.email === email);
  if (!user) {
    logStep("ERROR: No user found with email", { email });
    return;
  }
  
  logStep("Found user for subscription", { userId: user.id, email });
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  
  logStep("Retrieved subscription details", { 
    subscriptionId, 
    priceId, 
    status: subscription.status,
    periodEnd: safeTimestampToISO(subscription.current_period_end)
  });
  
  // ════════════════════════════════════════════════════════════════════════════════
  // USE CANONICAL MAPPING
  // ════════════════════════════════════════════════════════════════════════════════
  const resolution = resolvePriceId(priceId);
  
  logStep("Resolved price to tier", { 
    priceId, 
    tier: resolution.tier, 
    plan: resolution.plan, 
    scanLimit: resolution.scanLimit,
    known: resolution.known 
  });
  
  // Handle unknown price ID
  if (!resolution.known) {
    logStep("WARNING: Unknown price ID - logging to system_errors", { 
      priceId, 
      knownPrices: getKnownPriceIds() 
    });
    
    await supabase.from('system_errors').insert({
      error_code: 'UNKNOWN_STRIPE_PRICE',
      error_message: `Unknown Stripe price ID in webhook: ${priceId}`,
      function_name: 'stripe-webhook',
      user_id: user.id,
      severity: 'error',
      metadata: { priceId, subscriptionId, customerId, event: 'checkout.session.completed' },
    });
  }
  
  const { tier, plan, scanLimit } = resolution;
  
  // UPSERT user_roles
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: user.id,
      role: 'user',
      subscription_tier: tier,
      subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
    }, { onConflict: 'user_id' });
  
  if (roleError) {
    logStep("ERROR: Failed to upsert user_roles", { error: roleError.message, userId: user.id });
  } else {
    logStep("Upserted user_roles", { userId: user.id, tier });
  }
  
  // Find or CREATE user's workspace
  let workspace = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();
  
  if (workspace.error) {
    logStep("ERROR: Failed to find workspace", { error: workspace.error.message, userId: user.id });
    return;
  }
  
  let workspaceId = workspace.data?.id;
  
  // If no workspace exists, CREATE one
  if (!workspaceId) {
    logStep("No workspace found, creating one for user", { userId: user.id, email });
    
    const emailPrefix = email.split('@')[0];
    const workspaceName = `${emailPrefix} Workspace`;
    const workspaceSlug = `personal-${user.id.substring(0, 8)}`;
    
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspaces")
      .insert({
        name: workspaceName,
        slug: workspaceSlug,
        owner_id: user.id,
        subscription_tier: tier,
        plan: plan,
        scan_limit_monthly: scanLimit,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
      })
      .select("id")
      .single();
    
    if (createError) {
      logStep("ERROR: Failed to create workspace", { error: createError.message, userId: user.id });
      return;
    }
    
    workspaceId = newWorkspace.id;
    logStep("Created workspace", { workspaceId, workspaceName });
    
    // Add user as admin member
    await supabase
      .from("workspace_members")
      .upsert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: 'admin',
      }, { onConflict: 'workspace_id,user_id' });
    
    logStep("Added user as workspace admin", { workspaceId, userId: user.id });
  } else {
    logStep("Found workspace", { workspaceId });
    
    // Update existing workspace with Stripe IDs and tier
    const { error: wsUpdateError } = await supabase
      .from("workspaces")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_tier: tier,
        plan: plan,
        scan_limit_monthly: scanLimit,
        subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
        trial_status: 'converted',
      })
      .eq("id", workspaceId);
    
    if (wsUpdateError) {
      logStep("ERROR: Failed to update workspace", { error: wsUpdateError.message, workspaceId });
    } else {
      logStep("Updated workspace with subscription", { 
        workspaceId, 
        customerId, 
        subscriptionId,
        tier,
        plan
      });
    }
  }
  
  // Create or update subscriptions table record
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      workspace_id: workspaceId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: plan,
      status: subscription.status,
      scan_limit_monthly: scanLimit,
      scans_used_monthly: 0,
      current_period_start: safeTimestampToISO(subscription.current_period_start),
      current_period_end: safeTimestampToISO(subscription.current_period_end),
    }, { onConflict: 'workspace_id' });
  
  if (subError) {
    logStep("ERROR: Failed to upsert subscription record", { error: subError.message, workspaceId });
  } else {
    logStep("Upserted subscription record", { workspaceId, status: subscription.status });
  }
  
  // Log to audit
  await supabase.from("audit_log").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    action: "subscription_created",
    target: subscriptionId,
    meta: { tier, plan, priceId, customerId },
  });
  
  // Grant monthly credits for premium tiers
  if (resolution.monthlyCredits > 0) {
    const { error: creditsError } = await supabase
      .from('credits_ledger')
      .insert({
        workspace_id: workspaceId,
        delta: resolution.monthlyCredits,
        reason: 'monthly_subscription',
        meta: { subscription_id: subscriptionId, tier },
      });
    
    if (creditsError) {
      logStep("ERROR: Failed to grant monthly credits", { error: creditsError.message });
    } else {
      logStep("Granted monthly credits", { workspaceId, credits: resolution.monthlyCredits });
    }
  }
  
  logStep("✅ Subscription checkout processed successfully", { userId: user.id, tier, plan });
}

// ════════════════════════════════════════════════════════════════════════════════
// HANDLER: Subscription Created/Updated
// ════════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionChange(subscription: Stripe.Subscription, eventType: string) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;
  
  logStep("Processing subscription change", { eventType, customerId, priceId, status });
  
  // Get customer details
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    logStep("ERROR: Customer was deleted", { customerId });
    return;
  }

  const email = customer.email;
  if (!email) {
    logStep("ERROR: Customer has no email", { customerId });
    return;
  }

  // Find user by email
  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email === email);
  if (!user) {
    logStep("ERROR: No user found with email", { email });
    return;
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // IMMEDIATE DOWNGRADE FOR FAILED PAYMENTS
  // Statuses: past_due, unpaid, incomplete_expired = payment failed
  // ════════════════════════════════════════════════════════════════════════════════
  const failedStatuses = ['past_due', 'unpaid', 'incomplete_expired', 'canceled'];
  
  if (failedStatuses.includes(status)) {
    logStep("⚠️ Payment failed - DOWNGRADING to free tier", { status, email, userId: user.id });
    
    // Downgrade user_roles to free
    const { error: downgradeError } = await supabase
      .from("user_roles")
      .update({
        subscription_tier: "free",
        subscription_expires_at: null,
      })
      .eq("user_id", user.id);
    
    if (downgradeError) {
      logStep("ERROR: Failed to downgrade user_roles", { error: downgradeError.message });
    } else {
      logStep("Downgraded user_roles to free", { userId: user.id });
    }
    
    // Find and downgrade workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();
    
    if (workspace) {
      const { error: wsError } = await supabase
        .from("workspaces")
        .update({
          subscription_tier: "free",
          plan: "free",
          scan_limit_monthly: 10,
          subscription_expires_at: null,
        })
        .eq("id", workspace.id);
      
      if (wsError) {
        logStep("ERROR: Failed to downgrade workspace", { error: wsError.message });
      } else {
        logStep("Downgraded workspace to free", { workspaceId: workspace.id });
      }
      
      // Update subscription record status
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: status,
          plan: "free",
          scan_limit_monthly: 10,
        })
        .eq("workspace_id", workspace.id);
      
      if (subError) {
        logStep("ERROR: Failed to update subscription status", { error: subError.message });
      } else {
        logStep("Updated subscription status", { workspaceId: workspace.id, status });
      }
    }
    
    logStep("✅ Payment failure downgrade complete", { email, status });
    return; // Exit early - don't process as normal update
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // NORMAL ACTIVE/TRIALING SUBSCRIPTION - USE CANONICAL MAPPING
  // ════════════════════════════════════════════════════════════════════════════════
  const resolution = resolvePriceId(priceId);
  
  logStep("Resolved price to tier", { 
    priceId, 
    tier: resolution.tier, 
    plan: resolution.plan,
    known: resolution.known 
  });
  
  // Handle unknown price ID - log but don't downgrade
  if (!resolution.known && priceId) {
    logStep("WARNING: Unknown price ID - logging to system_errors", { 
      priceId, 
      knownPrices: getKnownPriceIds() 
    });
    
    await supabase.from('system_errors').insert({
      error_code: 'UNKNOWN_STRIPE_PRICE',
      error_message: `Unknown Stripe price ID in webhook: ${priceId}`,
      function_name: 'stripe-webhook',
      user_id: user.id,
      severity: 'error',
      metadata: { priceId, subscriptionId: subscription.id, customerId, event: eventType },
    });
    
    // Don't proceed with unknown price - keep existing tier
    logStep("Skipping update due to unknown price ID");
    return;
  }

  const { tier, plan, scanLimit } = resolution;

  // UPSERT user subscription in user_roles
  const { error: updateError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: user.id,
      role: 'user',
      subscription_tier: tier,
      subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
    }, { onConflict: 'user_id' });

  if (updateError) {
    logStep("ERROR: Failed to upsert user_roles — not throwing to prevent 400", { error: updateError.message, userId: user.id });
    return;
  }
  
  logStep("Upserted user_roles", { userId: user.id, email, tier });

  // Find or CREATE user's workspace
  let workspace = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  let workspaceId = workspace.data?.id;

  // If no workspace exists, CREATE one
  if (!workspaceId) {
    logStep("No workspace found, creating one for user", { userId: user.id, email });
    
    const emailPrefix = email.split('@')[0];
    const workspaceName = `${emailPrefix} Workspace`;
    const workspaceSlug = `personal-${user.id.substring(0, 8)}`;
    
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspaces")
      .insert({
        name: workspaceName,
        slug: workspaceSlug,
        owner_id: user.id,
        subscription_tier: tier,
        plan: plan,
        scan_limit_monthly: scanLimit,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
      })
      .select("id")
      .single();
    
    if (createError) {
      logStep("ERROR: Failed to create workspace", { error: createError.message, userId: user.id });
      return;
    }
    
    workspaceId = newWorkspace.id;
    logStep("Created workspace", { workspaceId, workspaceName });
    
    // Add user as admin member
    await supabase
      .from("workspace_members")
      .upsert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: 'admin',
      }, { onConflict: 'workspace_id,user_id' });
  } else {
    // Update existing workspace
    const { error: wsError } = await supabase
      .from("workspaces")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_tier: tier,
        plan: plan,
        scan_limit_monthly: scanLimit,
        subscription_expires_at: safeTimestampToISO(subscription.current_period_end),
        trial_status: 'converted',
      })
      .eq("id", workspaceId);
    
    if (wsError) {
      logStep("ERROR: Failed to update workspace", { error: wsError.message, workspaceId });
    } else {
      logStep("Updated workspace", { workspaceId, tier, plan });
    }
  }

  // Upsert subscription record
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      workspace_id: workspaceId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan: plan,
      status: subscription.status,
      scan_limit_monthly: scanLimit,
      current_period_start: safeTimestampToISO(subscription.current_period_start),
      current_period_end: safeTimestampToISO(subscription.current_period_end),
    }, { onConflict: 'workspace_id' });
  
  if (subError) {
    logStep("ERROR: Failed to upsert subscription record", { error: subError.message });
  } else {
    logStep("Upserted subscription record", { workspaceId });
  }

  logStep("✅ Subscription change processed", { email, tier, eventType });
}

// ════════════════════════════════════════════════════════════════════════════════
// HANDLER: Subscription Cancelled
// ════════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  logStep("Processing subscription cancellation", { customerId, subscriptionId: subscription.id });

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    logStep("ERROR: Customer was deleted", { customerId });
    return;
  }

  const email = customer.email;
  if (!email) {
    logStep("ERROR: Customer has no email", { customerId });
    return;
  }

  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email === email);
  if (!user) {
    logStep("ERROR: No user found with email", { email });
    return;
  }

  // Downgrade to free tier
  const { error: updateError } = await supabase
    .from("user_roles")
    .update({
      subscription_tier: "free",
      subscription_expires_at: null,
    })
    .eq("user_id", user.id);

  if (updateError) {
    logStep("ERROR: Failed to downgrade user_roles", { error: updateError.message, userId: user.id });
    throw updateError;
  }

  logStep("Downgraded user_roles to free", { userId: user.id, email });

  // Find and update workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (workspace) {
    const { error: wsError } = await supabase
      .from("workspaces")
      .update({
        subscription_tier: "free",
        plan: "free",
        scan_limit_monthly: 10,
        subscription_expires_at: null,
      })
      .eq("id", workspace.id);
    
    if (wsError) {
      logStep("ERROR: Failed to downgrade workspace", { error: wsError.message });
    } else {
      logStep("Downgraded workspace to free", { workspaceId: workspace.id });
    }

    // Update subscription record
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        plan: "free",
        scan_limit_monthly: 10,
      })
      .eq("workspace_id", workspace.id);
    
    if (subError) {
      logStep("ERROR: Failed to update subscription record", { error: subError.message });
    } else {
      logStep("Updated subscription record to canceled", { workspaceId: workspace.id });
    }
  }

  logStep("✅ Subscription cancellation processed", { email });
}

// ════════════════════════════════════════════════════════════════════════════════
// HANDLER: Credit Purchase
// ════════════════════════════════════════════════════════════════════════════════
async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const workspaceId = session.metadata?.workspace_id;
  const credits = parseInt(session.metadata?.credits || "0");

  logStep("Processing credit purchase", { userId, workspaceId, credits, sessionId: session.id });

  if (!userId || !workspaceId || !credits) {
    logStep("ERROR: Missing required metadata", { userId, workspaceId, credits, metadata: session.metadata });
    return;
  }

  // Add credits to workspace's ledger
  const { error: creditError } = await supabase
    .from("credits_ledger")
    .insert({
      workspace_id: workspaceId,
      delta: credits,
      reason: "purchase",
      ref_id: session.id,
    });

  if (creditError) {
    logStep("ERROR: Failed to credit account", { error: creditError.message, workspaceId });
    throw creditError;
  }

  logStep("✅ Credited workspace", { workspaceId, credits });
  
  // Send confirmation email
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email;

    if (userEmail) {
      const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
      const currency = session.currency?.toUpperCase() || "GBP";

      await resend.emails.send({
        from: "Credits Purchase <onboarding@resend.dev>",
        to: [userEmail],
        subject: `${credits} Credits Added to Your Account! 🎉`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Great news! Your credit purchase has been processed successfully.</p>
                
                <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #667eea;">Purchase Details</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Credits Added:</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 24px; color: #667eea;">${credits} credits</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right;">${currency} ${amountPaid}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                      <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px; color: #6b7280;">${session.id}</td>
                    </tr>
                  </table>
                </div>

                <p style="margin-top: 30px;">Your credits are now available and ready to use.</p>
                
                <div style="text-align: center; margin-top: 40px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">Thank you for your purchase!</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      logStep("📧 Confirmation email sent", { email: userEmail });
    }
  } catch (emailError) {
    logStep("WARNING: Failed to send confirmation email", { error: emailError instanceof Error ? emailError.message : String(emailError) });
  }
}
