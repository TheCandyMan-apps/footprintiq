import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FixResult {
  success: boolean;
  component: string;
  fixed: boolean;
  message: string;
  details?: {
    itemsFixed?: number;
    itemsRemaining?: number;
    affectedResources?: string[];
  };
  manualSteps?: string[];
  rerunAudit?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || userRole.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { component, details } = await req.json();
    console.log(`[system-audit/fix] Attempting to fix: ${component}`);

    let result: FixResult;

    switch (component) {
      case "scan_flow":
      case "scan_success_rate":
        result = await fixStuckScans(supabase);
        break;

      case "tier_sync":
        result = await fixTierSync(supabase);
        break;

      case "maigret":
        result = await fixMaigretProvider(supabase);
        break;

      case "gosearch":
        result = await fixGoSearchProvider(supabase);
        break;

      case "spiderfoot":
        result = fixSpiderFootProvider();
        break;

      default:
        if (component.startsWith("rls_")) {
          result = fixRLSPolicy(component);
        } else {
          result = {
            success: false,
            component,
            fixed: false,
            message: `No automatic fix available for ${component}`,
            manualSteps: [
              "Review the audit details for this component",
              "Check the relevant configuration or code",
              "Contact engineering team if issue persists",
            ],
          };
        }
    }

    // Log the fix attempt
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "system_audit_fix_attempt",
      resource_type: "system_audit",
      resource_id: component,
      metadata: { result, details },
    });

    console.log(`[system-audit/fix] Result for ${component}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[system-audit/fix] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Fix failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function fixStuckScans(supabase: any): Promise<FixResult> {
  try {
    const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    // Find stuck scans
    const { data: stuckScans, error: queryError } = await supabase
      .from("scans")
      .select("id, workspace_id, user_id, scan_type, created_at")
      .in("status", ["pending", "processing"])
      .lt("created_at", cutoffTime)
      .limit(100);

    if (queryError) throw queryError;

    if (!stuckScans || stuckScans.length === 0) {
      return {
        success: true,
        component: "scan_flow",
        fixed: true,
        message: "No stuck scans found - scan flow is healthy",
        rerunAudit: false,
      };
    }

    let fixedCount = 0;
    const affectedResources: string[] = [];

    for (const scan of stuckScans) {
      const stuckDuration = Math.floor(
        (Date.now() - new Date(scan.created_at).getTime()) / 60000
      );
      const status = stuckDuration > 10 ? "failed" : "timeout";

      const { error: updateError } = await supabase
        .from("scans")
        .update({
          status,
          completed_at: new Date().toISOString(),
        })
        .eq("id", scan.id);

      if (!updateError) {
        fixedCount++;
        affectedResources.push(scan.id);

        // Log to scan_events
        await supabase.from("scan_events").insert({
          scan_id: scan.id,
          provider: "system",
          stage: "admin_fix",
          status: status,
          error_message: `Scan marked as ${status} by admin fix (${stuckDuration}m stuck)`,
          metadata: { stuckDuration, fixedBy: "system_audit_fix" },
        });
      }
    }

    return {
      success: true,
      component: "scan_flow",
      fixed: fixedCount > 0,
      message: `Fixed ${fixedCount} of ${stuckScans.length} stuck scans`,
      details: {
        itemsFixed: fixedCount,
        itemsRemaining: stuckScans.length - fixedCount,
        affectedResources,
      },
      rerunAudit: true,
    };
  } catch (error) {
    return {
      success: false,
      component: "scan_flow",
      fixed: false,
      message: `Failed to fix stuck scans: ${error instanceof Error ? error.message : "Unknown error"}`,
      manualSteps: [
        "Check database connectivity",
        "Manually review stuck scans in admin panel",
        "Consider restarting scan workers",
      ],
    };
  }
}

async function fixTierSync(supabase: any): Promise<FixResult> {
  try {
    // Find users with expired subscriptions still on paid tiers
    const { data: users, error } = await supabase
      .from("user_roles")
      .select("user_id, subscription_tier, subscription_expires_at")
      .neq("subscription_tier", "free")
      .not("subscription_expires_at", "is", null)
      .lt("subscription_expires_at", new Date().toISOString());

    if (error) throw error;

    if (!users || users.length === 0) {
      return {
        success: true,
        component: "tier_sync",
        fixed: true,
        message: "No tier sync issues found - all subscriptions are correctly synced",
        rerunAudit: false,
      };
    }

    let fixedCount = 0;
    const affectedResources: string[] = [];

    for (const user of users) {
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ subscription_tier: "free" })
        .eq("user_id", user.user_id);

      if (!updateError) {
        fixedCount++;
        affectedResources.push(user.user_id);
      }
    }

    return {
      success: true,
      component: "tier_sync",
      fixed: fixedCount > 0,
      message: `Reset ${fixedCount} expired subscriptions to free tier`,
      details: {
        itemsFixed: fixedCount,
        itemsRemaining: users.length - fixedCount,
        affectedResources,
      },
      rerunAudit: true,
    };
  } catch (error) {
    return {
      success: false,
      component: "tier_sync",
      fixed: false,
      message: `Failed to fix tier sync: ${error instanceof Error ? error.message : "Unknown error"}`,
      manualSteps: [
        "Review user_roles table manually",
        "Check Stripe webhook integration",
        "Run reconcile-entitlements edge function",
      ],
    };
  }
}

async function fixMaigretProvider(supabase: any): Promise<FixResult> {
  const maigretUrl = Deno.env.get("VITE_MAIGRET_API_URL") || Deno.env.get("MAIGRET_WORKER_URL");
  
  if (!maigretUrl) {
    return {
      success: false,
      component: "maigret",
      fixed: false,
      message: "Maigret worker URL not configured",
      manualSteps: [
        "Set MAIGRET_WORKER_URL in Supabase secrets",
        "Verify the Cloud Run worker is deployed",
        "Test the worker health endpoint manually",
      ],
    };
  }

  try {
    // Try to hit the health endpoint
    const response = await fetch(`${maigretUrl}/health`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      // Clear any circuit breaker state
      await supabase
        .from("circuit_breaker_states")
        .update({ state: "closed", failure_count: 0 })
        .eq("provider_id", "maigret");

      return {
        success: true,
        component: "maigret",
        fixed: true,
        message: "Maigret worker is responsive - reset circuit breaker",
        rerunAudit: true,
      };
    } else {
      return {
        success: false,
        component: "maigret",
        fixed: false,
        message: `Maigret worker returned status ${response.status}`,
        manualSteps: [
          "Check Cloud Run logs for the Maigret worker",
          "Verify worker has enough memory/CPU allocation",
          "Restart the worker if needed",
          `Health endpoint: ${maigretUrl}/health`,
        ],
      };
    }
  } catch (error) {
    return {
      success: false,
      component: "maigret",
      fixed: false,
      message: `Cannot reach Maigret worker: ${error instanceof Error ? error.message : "Unknown error"}`,
      manualSteps: [
        "Verify Cloud Run service is running",
        "Check network/firewall configuration",
        "Review Cloud Run logs for errors",
        `Worker URL: ${maigretUrl}`,
      ],
    };
  }
}

async function fixGoSearchProvider(supabase: any): Promise<FixResult> {
  const osintWorkerUrl = Deno.env.get("OSINT_WORKER_URL");
  
  if (!osintWorkerUrl) {
    return {
      success: false,
      component: "gosearch",
      fixed: false,
      message: "OSINT worker URL not configured",
      manualSteps: [
        "Set OSINT_WORKER_URL in Supabase secrets",
        "Verify the Cloud Run worker is deployed",
        "Test the worker health endpoint manually",
      ],
    };
  }

  try {
    const response = await fetch(`${osintWorkerUrl}/health`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      // Clear any circuit breaker state
      await supabase
        .from("circuit_breaker_states")
        .update({ state: "closed", failure_count: 0 })
        .eq("provider_id", "gosearch");

      // Clear gosearch_pending flags on stuck scans
      const { data: stuckScans } = await supabase
        .from("scans")
        .update({ gosearch_pending: false })
        .eq("gosearch_pending", true)
        .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .select("id");

      return {
        success: true,
        component: "gosearch",
        fixed: true,
        message: `GoSearch worker is responsive - reset circuit breaker${stuckScans?.length ? ` and cleared ${stuckScans.length} stuck flags` : ""}`,
        details: stuckScans?.length ? { itemsFixed: stuckScans.length } : undefined,
        rerunAudit: true,
      };
    } else {
      return {
        success: false,
        component: "gosearch",
        fixed: false,
        message: `GoSearch worker returned status ${response.status}`,
        manualSteps: [
          "Check Cloud Run logs for the OSINT worker",
          "Verify worker has enough memory/CPU allocation",
          "Restart the worker if needed",
        ],
      };
    }
  } catch (error) {
    return {
      success: false,
      component: "gosearch",
      fixed: false,
      message: `Cannot reach GoSearch worker: ${error instanceof Error ? error.message : "Unknown error"}`,
      manualSteps: [
        "Verify Cloud Run service is running",
        "Check network/firewall configuration",
        "Review Cloud Run logs for errors",
      ],
    };
  }
}

function fixSpiderFootProvider(): FixResult {
  return {
    success: false,
    component: "spiderfoot",
    fixed: false,
    message: "SpiderFoot is an optional service - no automatic fix available",
    manualSteps: [
      "SpiderFoot requires manual deployment and configuration",
      "Set VITE_SPIDERFOOT_API_URL if you want to enable it",
      "This warning can be safely ignored if SpiderFoot is not needed",
    ],
  };
}

function fixRLSPolicy(component: string): FixResult {
  const tableName = component.replace("rls_", "");
  
  return {
    success: false,
    component,
    fixed: false,
    message: `RLS policies require database migration - cannot auto-fix`,
    manualSteps: [
      `Review existing RLS policies on the '${tableName}' table`,
      "Use supabase/migrations to add or modify RLS policies",
      "Example policy for user data:",
      `  CREATE POLICY "Users can access own ${tableName}"`,
      `  ON ${tableName} FOR ALL`,
      `  USING (auth.uid() = user_id);`,
      "Run the database linter tool for specific guidance",
    ],
  };
}
