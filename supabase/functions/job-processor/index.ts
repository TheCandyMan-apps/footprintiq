import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      console.warn(`Non-admin user ${user.id} attempted to access job-processor`);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "enqueue";

    // Enqueue a new job
    if (action === "enqueue" && req.method === "POST") {
      const { jobType, payload, priority, scheduledAt } = await req.json();

      if (!jobType) {
        return new Response(
          JSON.stringify({ error: "Job type required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: job, error } = await supabase
        .from("background_jobs")
        .insert({
          job_type: jobType,
          payload: payload || {},
          priority: priority || 5,
          scheduled_at: scheduledAt || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, job }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Claim a job for processing
    if (action === "claim" && req.method === "POST") {
      const { workerId } = await req.json();

      if (!workerId) {
        return new Response(
          JSON.stringify({ error: "Worker ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: jobs, error } = await supabase.rpc("claim_background_job", {
        worker_id_param: workerId
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, job: jobs?.[0] || null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Complete a job
    if (action === "complete" && req.method === "POST") {
      const { jobId, success, error: jobError } = await req.json();

      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Job ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updates: any = {
        completed_at: new Date().toISOString()
      };

      if (success) {
        updates.status = "completed";
      } else {
        // Check if we should retry
        const { data: job } = await supabase
          .from("background_jobs")
          .select("attempts, max_attempts")
          .eq("id", jobId)
          .single();

        if (job && job.attempts >= job.max_attempts) {
          updates.status = "failed";
        } else {
          updates.status = "pending";
          updates.started_at = null;
          updates.worker_id = null;
        }

        updates.last_error = jobError;
      }

      const { error } = await supabase
        .from("background_jobs")
        .update(updates)
        .eq("id", jobId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get job status
    if (action === "status" && req.method === "GET") {
      const jobId = url.searchParams.get("job_id");

      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Job ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: job, error } = await supabase
        .from("background_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ job }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get queue statistics
    if (action === "stats" && req.method === "GET") {
      const { data: jobs } = await supabase
        .from("background_jobs")
        .select("status, job_type");

      const stats = {
        total: jobs?.length || 0,
        by_status: {} as Record<string, number>,
        by_type: {} as Record<string, number>
      };

      jobs?.forEach((job: any) => {
        stats.by_status[job.status] = (stats.by_status[job.status] || 0) + 1;
        stats.by_type[job.job_type] = (stats.by_type[job.job_type] || 0) + 1;
      });

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cancel a job
    if (action === "cancel" && req.method === "POST") {
      const { jobId } = await req.json();

      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Job ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("background_jobs")
        .update({ status: "cancelled" })
        .eq("id", jobId)
        .eq("status", "pending");

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Job processor error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
