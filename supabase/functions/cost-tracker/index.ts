import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CostRecord {
  providerId: string;
  workspaceId?: string;
  success: boolean;
  latencyMs: number;
  unitCost: number;
  dataMb?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "record";

    // Record a cost event
    if (action === "record" && req.method === "POST") {
      const record: CostRecord = await req.json();
      
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthKey = monthStart.toISOString().split("T")[0];
      
      // Check budget before allowing the call
      if (record.workspaceId) {
        const { data: budget } = await supabase
          .from("provider_budgets")
          .select("*")
          .eq("workspace_id", record.workspaceId)
          .eq("provider_id", record.providerId)
          .eq("is_active", true)
          .single();

        if (budget) {
          // Check daily quota
          const { data: dailyCost } = await supabase
            .from("provider_costs")
            .select("total_calls")
            .eq("workspace_id", record.workspaceId)
            .eq("provider_id", record.providerId)
            .eq("period_type", "daily")
            .eq("period_start", today)
            .single();

          const currentCalls = dailyCost?.total_calls || 0;
          const quotaUsage = (currentCalls / budget.daily_quota) * 100;

          if (budget.block_on_quota_exceeded && quotaUsage >= 100) {
            return new Response(
              JSON.stringify({ 
                allowed: false, 
                reason: "Daily quota exceeded",
                usage: quotaUsage 
              }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Check monthly budget
          const { data: monthlyCost } = await supabase
            .from("provider_costs")
            .select("total_cost_gbp")
            .eq("workspace_id", record.workspaceId)
            .eq("provider_id", record.providerId)
            .eq("period_type", "monthly")
            .eq("period_start", monthKey)
            .single();

          const currentCost = Number(monthlyCost?.total_cost_gbp || 0);
          const budgetUsage = (currentCost / Number(budget.monthly_budget_gbp)) * 100;

          if (budget.block_on_budget_exceeded && budgetUsage >= 100) {
            return new Response(
              JSON.stringify({ 
                allowed: false, 
                reason: "Monthly budget exceeded",
                usage: budgetUsage 
              }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Send alerts if thresholds crossed
          if (quotaUsage >= budget.warn_threshold_pct || budgetUsage >= budget.warn_threshold_pct) {
            const alertType = quotaUsage >= budget.critical_threshold_pct || budgetUsage >= budget.critical_threshold_pct
              ? (quotaUsage >= budget.critical_threshold_pct ? "quota_critical" : "budget_critical")
              : (quotaUsage >= budget.warn_threshold_pct ? "quota_warning" : "budget_warning");

            // Only send alert if we haven't sent one recently (within last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { data: recentAlert } = await supabase
              .from("budget_alerts")
              .select("id")
              .eq("workspace_id", record.workspaceId)
              .eq("provider_id", record.providerId)
              .eq("alert_type", alertType)
              .gte("created_at", oneHourAgo)
              .single();

            if (!recentAlert) {
              await supabase.from("budget_alerts").insert({
                workspace_id: record.workspaceId,
                provider_id: record.providerId,
                alert_type: alertType,
                threshold_pct: alertType.includes("critical") ? budget.critical_threshold_pct : budget.warn_threshold_pct,
                current_usage: alertType.includes("quota") ? quotaUsage : budgetUsage,
                limit_value: alertType.includes("quota") ? budget.daily_quota : Number(budget.monthly_budget_gbp),
                message: `${record.providerId} has reached ${Math.round(alertType.includes("quota") ? quotaUsage : budgetUsage)}% of ${alertType.includes("quota") ? "daily quota" : "monthly budget"}`,
                metadata: {
                  current_calls: currentCalls,
                  current_cost: currentCost,
                  quota: budget.daily_quota,
                  budget: Number(budget.monthly_budget_gbp)
                }
              });
            }
          }
        }
      }

      // Record daily cost
      await supabase.from("provider_costs").upsert({
        provider_id: record.providerId,
        workspace_id: record.workspaceId || null,
        period_type: "daily",
        period_start: today,
        period_end: today,
        total_calls: 1,
        success_calls: record.success ? 1 : 0,
        failed_calls: record.success ? 0 : 1,
        total_cost_gbp: record.unitCost,
        api_cost_gbp: record.unitCost,
        avg_latency_ms: record.latencyMs,
        total_data_mb: record.dataMb || 0
      }, {
        onConflict: "provider_id,workspace_id,period_type,period_start",
        ignoreDuplicates: false
      });

      // Record monthly cost
      await supabase.from("provider_costs").upsert({
        provider_id: record.providerId,
        workspace_id: record.workspaceId || null,
        period_type: "monthly",
        period_start: monthKey,
        period_end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().split("T")[0],
        total_calls: 1,
        success_calls: record.success ? 1 : 0,
        failed_calls: record.success ? 0 : 1,
        total_cost_gbp: record.unitCost,
        api_cost_gbp: record.unitCost,
        avg_latency_ms: record.latencyMs,
        total_data_mb: record.dataMb || 0
      }, {
        onConflict: "provider_id,workspace_id,period_type,period_start",
        ignoreDuplicates: false
      });

      return new Response(
        JSON.stringify({ success: true, allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get cost summary
    if (action === "summary" && req.method === "GET") {
      const workspaceId = url.searchParams.get("workspace_id");
      const providerId = url.searchParams.get("provider_id");
      const period = url.searchParams.get("period") || "daily";

      let query = supabase
        .from("provider_costs")
        .select("*")
        .eq("period_type", period)
        .order("period_start", { ascending: false })
        .limit(30);

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }
      if (providerId) {
        query = query.eq("provider_id", providerId);
      }

      const { data: costs, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ costs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate cost recommendations
    if (action === "recommend" && req.method === "POST") {
      const { workspaceId } = await req.json();

      // Get recent costs
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const { data: costs } = await supabase
        .from("provider_costs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("period_type", "daily")
        .gte("period_start", thirtyDaysAgo);

      const recommendations = [];

      // Analyze each provider
      const providerStats = new Map();
      costs?.forEach((cost: any) => {
        if (!providerStats.has(cost.provider_id)) {
          providerStats.set(cost.provider_id, {
            totalCalls: 0,
            totalCost: 0,
            failureRate: 0,
            avgLatency: 0,
            days: 0
          });
        }
        const stats = providerStats.get(cost.provider_id);
        stats.totalCalls += cost.total_calls;
        stats.totalCost += Number(cost.total_cost_gbp);
        stats.failureRate += cost.total_calls > 0 ? (cost.failed_calls / cost.total_calls) : 0;
        stats.avgLatency += cost.avg_latency_ms || 0;
        stats.days += 1;
      });

      for (const [providerId, stats] of providerStats.entries()) {
        const avgDailyCalls = stats.totalCalls / stats.days;
        const avgFailureRate = stats.failureRate / stats.days;
        
        // Recommend reducing quota if usage is low
        if (avgDailyCalls < 100) {
          recommendations.push({
            workspace_id: workspaceId,
            provider_id: providerId,
            recommendation_type: "reduce_quota",
            priority: "low",
            title: `Reduce ${providerId} quota`,
            description: `Average daily usage is only ${Math.round(avgDailyCalls)} calls. Consider reducing quota to optimize costs.`,
            estimated_savings_gbp: stats.totalCost * 0.2,
          });
        }

        // Recommend switching provider if failure rate is high
        if (avgFailureRate > 0.2) {
          recommendations.push({
            workspace_id: workspaceId,
            provider_id: providerId,
            recommendation_type: "switch_provider",
            priority: "high",
            title: `High failure rate for ${providerId}`,
            description: `Failure rate is ${(avgFailureRate * 100).toFixed(1)}%. Consider switching to a more reliable provider.`,
            estimated_savings_gbp: stats.totalCost * avgFailureRate,
          });
        }

        // Recommend caching if high volume
        if (avgDailyCalls > 1000) {
          recommendations.push({
            workspace_id: workspaceId,
            provider_id: providerId,
            recommendation_type: "enable_caching",
            priority: "medium",
            title: `Enable caching for ${providerId}`,
            description: `High volume detected (${Math.round(avgDailyCalls)} calls/day). Caching could reduce costs by 30-50%.`,
            estimated_savings_gbp: stats.totalCost * 0.4,
          });
        }
      }

      // Insert recommendations
      if (recommendations.length > 0) {
        await supabase.from("cost_recommendations").insert(recommendations);
      }

      return new Response(
        JSON.stringify({ recommendations }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cost tracker error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
