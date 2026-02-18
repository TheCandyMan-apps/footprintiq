import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackfillResult {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  email: string;
  status: 'synced' | 'created' | 'updated' | 'error' | 'no_user';
  message: string;
  workspaceId?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-BACKFILL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== "admin") {
      throw new Error("Admin access required");
    }

    logStep("Admin verified", { userId: user.id });

    const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));
    logStep("Mode", { dryRun });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Fetch all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer"],
    });

    logStep("Fetched Stripe subscriptions", { count: subscriptions.data.length });

    const results: BackfillResult[] = [];

    for (const subscription of subscriptions.data) {
      const customer = subscription.customer as Stripe.Customer;
      const email = customer.email;

      if (!email) {
        results.push({
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          email: "unknown",
          status: "error",
          message: "Customer has no email",
        });
        continue;
      }

      logStep("Processing subscription", { 
        customerId: customer.id, 
        subscriptionId: subscription.id, 
        email 
      });

      // Find user in auth.users
      const { data: authUsers } = await supabaseAdmin
        .from("auth.users")
        .select("id, email")
        .eq("email", email)
        .limit(1);

      // Alternative: use auth admin API
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = userList?.users?.find(u => u.email === email);

      if (!authUser) {
        results.push({
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          email,
          status: "no_user",
          message: "No matching user in auth.users",
        });
        continue;
      }

      const userId = authUser.id;

      // Check if workspace exists with this Stripe customer ID
      const { data: existingWorkspace } = await supabaseAdmin
        .from("workspaces")
        .select("id, stripe_customer_id, stripe_subscription_id, subscription_tier")
        .eq("stripe_customer_id", customer.id)
        .single();

      if (existingWorkspace) {
        // Already synced
        results.push({
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          email,
          status: "synced",
          message: "Already synced",
          workspaceId: existingWorkspace.id,
        });
        continue;
      }

      // Check if user has any workspace (by owner_id or membership)
      const { data: userWorkspace } = await supabaseAdmin
        .from("workspaces")
        .select("id")
        .eq("owner_id", userId)
        .single();

      let workspaceId = userWorkspace?.id;

      // Calculate subscription end date
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

      if (dryRun) {
        results.push({
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          email,
          status: workspaceId ? "updated" : "created",
          message: dryRun ? "Would sync (dry run)" : "Synced",
          workspaceId,
        });
        continue;
      }

      // Execute the sync
      if (workspaceId) {
        // Update existing workspace
        const { error: updateError } = await supabaseAdmin
          .from("workspaces")
          .update({
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            subscription_tier: "pro",
            plan: "pro",
            subscription_expires_at: subscriptionEnd,
          })
          .eq("id", workspaceId);

        if (updateError) {
          results.push({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            email,
            status: "error",
            message: `Update failed: ${updateError.message}`,
          });
          continue;
        }
      } else {
        // Create new workspace
        const { data: newWorkspace, error: createError } = await supabaseAdmin
          .from("workspaces")
          .insert({
            name: `${email.split("@")[0]}'s Workspace`,
            owner_id: userId,
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            subscription_tier: "pro",
            plan: "pro",
            subscription_expires_at: subscriptionEnd,
          })
          .select("id")
          .single();

        if (createError) {
          results.push({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            email,
            status: "error",
            message: `Create failed: ${createError.message}`,
          });
          continue;
        }

        workspaceId = newWorkspace.id;

        // Add user as admin member
        await supabaseAdmin.from("workspace_members").upsert({
          workspace_id: workspaceId,
          user_id: userId,
          role: "admin",
        }, { onConflict: "workspace_id,user_id" });
      }

      // Update user_roles
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "user",
        subscription_tier: "pro",
        subscription_expires_at: subscriptionEnd,
      }, { onConflict: "user_id" });

      results.push({
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        email,
        status: workspaceId ? "updated" : "created",
        message: "Successfully synced",
        workspaceId,
      });

      logStep("Synced subscription", { email, workspaceId });
    }

    const summary = {
      total: results.length,
      synced: results.filter(r => r.status === "synced").length,
      created: results.filter(r => r.status === "created").length,
      updated: results.filter(r => r.status === "updated").length,
      errors: results.filter(r => r.status === "error").length,
      noUser: results.filter(r => r.status === "no_user").length,
    };

    logStep("Backfill complete", summary);

    return new Response(JSON.stringify({ results, summary, dryRun }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
