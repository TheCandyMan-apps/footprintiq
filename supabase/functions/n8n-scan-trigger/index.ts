import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const n8nWebhookUrl = Deno.env.get("N8N_SCAN_WEBHOOK_URL");
    const workerUrl = Deno.env.get("OSINT_WORKER_URL");
    const workerToken = Deno.env.get("OSINT_WORKER_TOKEN");

    if (!n8nWebhookUrl) {
      console.error("N8N_SCAN_WEBHOOK_URL not configured");
      return new Response(JSON.stringify({ error: "n8n webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { scanId: providedScanId, username, workspaceId, scanType = "username", mode = "lean" } = body;

    // ✅ STRICT USERNAME VALIDATION - Prevent "true", "false", empty, or invalid values
    if (!username || typeof username !== 'string') {
      console.error(`[n8n-scan-trigger] Invalid username type: ${typeof username}, value: ${username}`);
      return new Response(JSON.stringify({ error: "Username must be a non-empty string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      console.error("[n8n-scan-trigger] Empty username after trim");
      return new Response(JSON.stringify({ error: "Username cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject boolean-like and obviously invalid values
    const invalidUsernames = ['true', 'false', 'null', 'undefined', 'nan', '0', '1'];
    if (invalidUsernames.includes(trimmedUsername.toLowerCase())) {
      console.error(`[n8n-scan-trigger] Rejected invalid username: "${trimmedUsername}"`);
      return new Response(JSON.stringify({ error: `Invalid username: "${trimmedUsername}" is not a valid target` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject very short usernames (likely accidental)
    if (trimmedUsername.length < 2) {
      console.error(`[n8n-scan-trigger] Username too short: "${trimmedUsername}"`);
      return new Response(JSON.stringify({ error: "Username must be at least 2 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ CRITICAL: Use provided scanId from frontend, or generate new one
    // This ensures frontend and backend use the SAME scan ID for real-time updates
    const scanId = providedScanId || crypto.randomUUID();
    console.log(`[n8n-scan-trigger] Using scanId: ${scanId} (provided: ${!!providedScanId})`);

    console.log(`[n8n-scan-trigger] Starting scan for username: ${username.substring(0, 3)}***`);

    // Create scan record with the provided scanId
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert({
        id: scanId,  // ✅ Use the scanId (provided or generated)
        user_id: user.id,
        workspace_id: workspaceId,
        scan_type: scanType,
        username: username,
        status: "pending",
        provider_counts: {},
        results_route: "results",  // ✅ Advanced n8n scans always route to /results/:id
      })
      .select()
      .single();

    if (scanError) {
      console.error("[n8n-scan-trigger] Failed to create scan:", scanError);
      return new Response(JSON.stringify({ error: "Failed to create scan record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[n8n-scan-trigger] Created scan record: ${scan.id}`);

    // Define providers for username scans
    // Use providers matching what n8n workflow actually runs
    const providers = ["sherlock", "gosearch", "maigret", "holehe", "whatsmyname"];

    // Create initial scan_progress record so UI can track progress
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: progressError } = await serviceClient.from("scan_progress").upsert(
      {
        scan_id: scan.id,
        status: "running",
        total_providers: providers.length,
        completed_providers: 0,
        current_providers: providers,
        findings_count: 0,
        message: `Starting scan with ${providers.length} providers...`,
        error: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "scan_id" },
    );

    if (progressError) {
      console.error("[n8n-scan-trigger] Failed to create scan_progress:", progressError);
    } else {
      console.log(`[n8n-scan-trigger] Created scan_progress for ${scan.id}`);
    }

    // Get callback token for n8n to post results back
    const callbackToken = Deno.env.get("N8N_CALLBACK_TOKEN");

    // Trigger n8n webhook (fire and forget using fetch without await)
    // Note: Supabase URL and anon key intentionally NOT sent to n8n
    // n8n should use callback tokens for authentication, not direct Supabase access
    const n8nPayload = {
      scanId: scan.id,
      username: username,
      workspaceId: workspaceId,
      userId: user.id,
      mode,
      workerUrl: workerUrl || "",
      workerToken: workerToken || "",
      callbackToken: callbackToken || "",
      progressWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-progress`,
      resultsWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-results`,
    };

    console.log(`[n8n-scan-trigger] Payload workerUrl: ${workerUrl ? "set" : "MISSING"}`);
    console.log(
      `[n8n-scan-trigger] Payload workerToken: ${workerToken ? `SET (${workerToken.length} chars)` : "MISSING"}`,
    );
    console.log(`[n8n-scan-trigger] Payload callbackToken: ${callbackToken ? "set" : "MISSING"}`);

    // Fire n8n webhook - wait briefly to catch immediate failures
    console.log(`[n8n-scan-trigger] Calling n8n webhook for scan ${scan.id}`);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for initial connection

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!n8nResponse.ok) {
        console.error(`[n8n-scan-trigger] n8n webhook failed immediately: ${n8nResponse.status}`);
        // Mark scan as failed right away so user knows
        await serviceClient
          .from("scans")
          .update({ 
            status: "failed", 
            error_message: `n8n webhook returned ${n8nResponse.status}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", scan.id);
        
        // Also update progress
        await serviceClient.from("scan_progress").update({
          status: "error",
          error: true,
          message: `Workflow failed to start (HTTP ${n8nResponse.status})`,
          updated_at: new Date().toISOString(),
        }).eq("scan_id", scan.id);

        // Log to system_errors for debugging
        await serviceClient.from("system_errors").insert({
          error_type: "n8n_webhook_failure",
          message: `n8n returned ${n8nResponse.status} for scan ${scan.id}`,
          metadata: { scanId: scan.id, username, status: n8nResponse.status },
          severity: "error",
        });
      } else {
        console.log(`[n8n-scan-trigger] n8n webhook accepted scan ${scan.id}`);
        await serviceClient.from("scans").update({ status: "running" }).eq("id", scan.id);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[n8n-scan-trigger] Error calling n8n:", errMsg);
      
      // Mark scan as failed immediately
      await serviceClient
        .from("scans")
        .update({ 
          status: "failed", 
          error_message: `n8n webhook unreachable: ${errMsg}`,
          completed_at: new Date().toISOString()
        })
        .eq("id", scan.id);
      
      // Update progress
      await serviceClient.from("scan_progress").update({
        status: "error",
        error: true,
        message: `Workflow unreachable: ${errMsg.substring(0, 100)}`,
        updated_at: new Date().toISOString(),
      }).eq("scan_id", scan.id);

      // Log error
      await serviceClient.from("system_errors").insert({
        error_type: "n8n_webhook_unreachable",
        message: `n8n webhook failed for scan ${scan.id}: ${errMsg}`,
        metadata: { scanId: scan.id, username, error: errMsg },
        severity: "error",
      });
    }

    // Return immediately with scan ID
    return new Response(
      JSON.stringify({
        id: scan.id,
        scanId: scan.id,
        status: "accepted",
        message: "Scan queued for processing via n8n",
      }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const error = err as Error;
    console.error("[n8n-scan-trigger] Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
