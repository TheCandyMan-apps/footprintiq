import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface AuditCheck {
  component: string;
  status: "success" | "failure" | "warning";
  message: string;
  details?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { auditType } = await req.json();
    console.log(`Running audit: ${auditType}`);

    const checks: AuditCheck[] = [];
    let overallStatus: "success" | "failure" | "warning" = "success";

    // RLS Checks
    if (auditType === "full_system" || auditType === "rls_check") {
      const rlsChecks = await performRLSChecks(supabase);
      checks.push(...rlsChecks);
    }

    // Provider Health Checks
    if (auditType === "full_system" || auditType === "provider_health") {
      const providerChecks = await performProviderHealthChecks();
      checks.push(...providerChecks);
    }

    // Tier/Credit Sync Checks
    if (auditType === "full_system" || auditType === "tier_sync") {
      const tierChecks = await performTierSyncChecks(supabase);
      checks.push(...tierChecks);
    }

    // Scan Flow Checks
    if (auditType === "full_system" || auditType === "scan_flow") {
      const scanChecks = await performScanFlowChecks(supabase);
      checks.push(...scanChecks);
    }

    // Calculate overall status and failure rate
    const failures = checks.filter(c => c.status === "failure").length;
    const warnings = checks.filter(c => c.status === "warning").length;
    const failureRate = checks.length > 0 ? (failures / checks.length) * 100 : 0;

    if (failures > 0) overallStatus = "failure";
    else if (warnings > 0) overallStatus = "warning";

    // Get AI analysis of failures
    let aiSummary = "";
    let aiPriority = "low";
    let recommendations: string[] = [];

    if (failures > 0 || warnings > 0) {
      const aiAnalysis = await getAIAnalysis(checks.filter(c => c.status !== "success"));
      aiSummary = aiAnalysis.summary;
      aiPriority = aiAnalysis.priority;
      recommendations = aiAnalysis.recommendations;
    }

    // Store audit result
    const { error: insertError } = await supabase
      .from("system_audit_results")
      .insert({
        audit_type: auditType,
        status: overallStatus,
        details: { checks },
        failure_rate: failureRate,
        ai_summary: aiSummary,
        ai_priority: aiPriority,
        recommendations,
      });

    if (insertError) {
      console.error("Failed to store audit result:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: overallStatus,
        checks,
        failureRate,
        aiSummary,
        aiPriority,
        recommendations,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Audit failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function performRLSChecks(supabase: any): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  const criticalTables = ["scans", "findings", "workspaces", "credits_ledger", "user_roles"];

  for (const table of criticalTables) {
    try {
      // Check if RLS is enabled
      const { data: rlsData, error: rlsError } = await supabase.rpc("pg_get_table_policies", {
        table_name: table,
      });

      if (rlsError) {
        checks.push({
          component: `rls_${table}`,
          status: "failure",
          message: `Failed to check RLS for ${table}`,
          details: { error: rlsError.message },
        });
      } else if (!rlsData || rlsData.length === 0) {
        checks.push({
          component: `rls_${table}`,
          status: "failure",
          message: `No RLS policies found for ${table}`,
        });
      } else {
        checks.push({
          component: `rls_${table}`,
          status: "success",
          message: `RLS enabled with ${rlsData.length} policies`,
        });
      }
    } catch (error) {
      checks.push({
        component: `rls_${table}`,
        status: "failure",
        message: `RLS check failed for ${table}`,
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      });
    }
  }

  return checks;
}

async function performProviderHealthChecks(): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // Check Unified OSINT Worker (replaces separate Maigret/GoSearch workers)
  try {
    const osintWorkerUrl = Deno.env.get("OSINT_WORKER_URL");
    const osintWorkerToken = Deno.env.get("OSINT_WORKER_TOKEN");
    
    if (osintWorkerUrl && osintWorkerToken) {
      const baseUrl = osintWorkerUrl.replace('/scan', '');
      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(10000),
      });

      checks.push({
        component: "osint_worker",
        status: response.ok ? "success" : "failure",
        message: response.ok ? "Unified OSINT Worker operational" : `OSINT Worker returned ${response.status}`,
      });
    } else {
      checks.push({
        component: "osint_worker",
        status: "failure",
        message: osintWorkerUrl ? "OSINT_WORKER_TOKEN not configured" : "OSINT_WORKER_URL not configured",
      });
    }
  } catch (error) {
    checks.push({
      component: "osint_worker",
      status: "failure",
      message: "Unified OSINT Worker unreachable",
      details: { error: error instanceof Error ? error.message : "Timeout or network error" },
    });
  }

  // Check n8n Orchestration
  try {
    const n8nWebhookUrl = Deno.env.get("N8N_SCAN_WEBHOOK_URL");
    const n8nCallbackToken = Deno.env.get("N8N_CALLBACK_TOKEN");
    
    if (n8nWebhookUrl && n8nCallbackToken) {
      checks.push({
        component: "n8n_orchestration",
        status: "success",
        message: "n8n scan orchestration configured",
      });
    } else {
      checks.push({
        component: "n8n_orchestration",
        status: "failure",
        message: !n8nWebhookUrl ? "N8N_SCAN_WEBHOOK_URL not configured" : "N8N_CALLBACK_TOKEN not configured",
      });
    }
  } catch (error) {
    checks.push({
      component: "n8n_orchestration",
      status: "warning",
      message: "Failed to verify n8n configuration",
    });
  }

  return checks;
}

async function performTierSyncChecks(supabase: any): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  try {
    // Check for users with inconsistent tier/credit data
    const { data: users, error } = await supabase
      .from("user_roles")
      .select("user_id, subscription_tier, subscription_expires_at")
      .limit(100);

    if (error) throw error;

    const inconsistencies = users?.filter((user: any) => {
      const isExpired =
        user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date();
      const shouldBeFree = isExpired && user.subscription_tier !== "free";
      return shouldBeFree;
    });

    if (inconsistencies && inconsistencies.length > 0) {
      checks.push({
        component: "tier_sync",
        status: "warning",
        message: `Found ${inconsistencies.length} users with expired subscriptions not reverted to free`,
        details: { count: inconsistencies.length },
      });
    } else {
      checks.push({
        component: "tier_sync",
        status: "success",
        message: "Tier synchronization healthy",
      });
    }
  } catch (error) {
    checks.push({
      component: "tier_sync",
      status: "failure",
      message: "Failed to check tier sync",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    });
  }

  return checks;
}

async function performScanFlowChecks(supabase: any): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  try {
    // Check recent scans for stuck states
    const { data: scans, error } = await supabase
      .from("scans")
      .select("id, status, created_at")
      .in("status", ["pending", "processing"])
      .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(10);

    if (error) throw error;

    if (scans && scans.length > 0) {
      checks.push({
        component: "scan_flow",
        status: "warning",
        message: `Found ${scans.length} scans stuck in pending/processing state for >30min`,
        details: { stuck_scans: scans.length },
      });
    } else {
      checks.push({
        component: "scan_flow",
        status: "success",
        message: "No stuck scans detected",
      });
    }

    // Check recent scan success rate
    const { data: recentScans, error: recentError } = await supabase
      .from("scans")
      .select("status")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!recentError && recentScans) {
      const failed = recentScans.filter((s: any) => s.status === "failed").length;
      const total = recentScans.length;
      const failRate = total > 0 ? (failed / total) * 100 : 0;

      if (failRate > 10) {
        checks.push({
          component: "scan_success_rate",
          status: "failure",
          message: `High scan failure rate: ${failRate.toFixed(1)}%`,
          details: { failure_rate: failRate, total_scans: total, failed_scans: failed },
        });
      } else {
        checks.push({
          component: "scan_success_rate",
          status: "success",
          message: `Scan success rate: ${(100 - failRate).toFixed(1)}%`,
          details: { failure_rate: failRate },
        });
      }
    }
  } catch (error) {
    checks.push({
      component: "scan_flow",
      status: "failure",
      message: "Failed to check scan flow",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    });
  }

  return checks;
}

async function getAIAnalysis(failedChecks: AuditCheck[]): Promise<{
  summary: string;
  priority: string;
  recommendations: string[];
}> {
  try {
    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return {
        summary: "AI analysis unavailable (Grok API key not configured)",
        priority: "medium",
        recommendations: ["Configure Grok API key for AI-powered analysis"],
      };
    }

    const prompt = `Analyze these system audit failures and provide prioritized recommendations:

${JSON.stringify(failedChecks, null, 2)}

Provide:
1. A concise summary of the issues
2. Priority level (low/medium/high/critical)
3. Top 3 actionable recommendations to fix

Format as JSON: { "summary": "...", "priority": "...", "recommendations": ["...", "...", "..."] }`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${grokApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      // If not JSON, create structured response from text
      return {
        summary: content.slice(0, 500),
        priority: "medium",
        recommendations: ["Review detailed audit logs", "Address failures one by one", "Set up monitoring"],
      };
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      summary: `${failedChecks.length} checks failed. Manual review required.`,
      priority: failedChecks.length > 3 ? "high" : "medium",
      recommendations: [
        "Check component health individually",
        "Review error logs for root cause",
        "Escalate critical failures to engineering team",
      ],
    };
  }
}
