import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceTurnstile } from "../_shared/turnstile.ts";

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
    const n8nFreeScanWebhookUrl = Deno.env.get("N8N_FREE_SCAN_WEBHOOK_URL");
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
    const { 
      scanId: providedScanId, 
      username, 
      email, 
      phone, 
      domain,
      firstName,
      lastName,
      workspaceId, 
      scanType = "username", 
      mode = "lean", 
      turnstile_token,
      tier = "free"  // Accept tier parameter from frontend
    } = body;
    
    // Determine if this is a Free tier quick scan (only username scans use quick workflow)
    const isFreeTierScan = tier === "free" && scanType === "username" && n8nFreeScanWebhookUrl;

    // ✅ TURNSTILE VERIFICATION for free tier users
    const turnstileError = await enforceTurnstile(req, body, user.id, corsHeaders);
    if (turnstileError) {
      return turnstileError;
    }

    // ✅ SCAN-TYPE-AWARE VALIDATION
    // Determine the target value and column based on scan type
    let targetValue: string | undefined;
    let targetColumn: string = 'target'; // Default value to avoid uninitialized error

    switch (scanType) {
      case 'email':
        targetValue = email?.trim() || username?.trim(); // fallback to username if email passed there
        targetColumn = 'email';
        break;
      case 'phone':
        targetValue = phone?.trim();
        targetColumn = 'phone';
        break;
      case 'domain':
        targetValue = domain?.trim();
        targetColumn = 'domain';
        break;
      case 'personal_details':
        // For personal_details, prefer email, then username, then construct from first/last name
        if (email?.trim()) {
          targetValue = email.trim();
          targetColumn = 'email';
        } else if (username?.trim()) {
          targetValue = username.trim();
          targetColumn = 'username';
        } else if (firstName?.trim() || lastName?.trim()) {
          // Construct a combined name for searching
          targetValue = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
          targetColumn = 'username'; // Store in username column as it's a name-based search
        } else {
          targetColumn = 'personal_details'; // For error messaging
        }
        break;
      case 'username':
      default:
        targetValue = username?.trim();
        targetColumn = 'username';
        break;
    }

    // Validate target exists
    if (!targetValue || typeof targetValue !== 'string') {
      console.error(`[n8n-scan-trigger] Invalid ${targetColumn} type: ${typeof targetValue}, value: ${targetValue}`);
      return new Response(JSON.stringify({ error: `${targetColumn} must be a non-empty string` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (targetValue.length === 0) {
      console.error(`[n8n-scan-trigger] Empty ${targetColumn} after trim`);
      return new Response(JSON.stringify({ error: `${targetColumn} cannot be empty` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject boolean-like and obviously invalid values
    const invalidValues = ['true', 'false', 'null', 'undefined', 'nan', '0', '1'];
    if (invalidValues.includes(targetValue.toLowerCase())) {
      console.error(`[n8n-scan-trigger] Rejected invalid ${targetColumn}: "${targetValue}"`);
      return new Response(JSON.stringify({ error: `Invalid ${targetColumn}: "${targetValue}" is not a valid target` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject very short values (likely accidental)
    const minLength = scanType === 'email' ? 5 : 2; // emails need to be longer
    if (targetValue.length < minLength) {
      console.error(`[n8n-scan-trigger] ${targetColumn} too short: "${targetValue}"`);
      return new Response(JSON.stringify({ error: `${targetColumn} must be at least ${minLength} characters` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ CRITICAL: Use provided scanId from frontend, or generate new one
    // This ensures frontend and backend use the SAME scan ID for real-time updates
    const scanId = providedScanId || crypto.randomUUID();
    console.log(`[n8n-scan-trigger] Using scanId: ${scanId} (provided: ${!!providedScanId})`);

    console.log(`[n8n-scan-trigger] Starting ${scanType} scan for ${targetColumn}: ${targetValue.substring(0, 3)}***`);

    // Build the scan insert object dynamically based on scan type
    const scanInsertData: Record<string, unknown> = {
      id: scanId,
      user_id: user.id,
      workspace_id: workspaceId,
      scan_type: scanType,
      status: "pending",
      provider_counts: {},
      results_route: "results",
    };

    // Set the appropriate column for the target value
    if (scanType === 'email' || (scanType === 'personal_details' && targetColumn === 'email')) {
      scanInsertData.email = targetValue;
    } else if (scanType === 'phone') {
      scanInsertData.phone = targetValue;
    } else if (scanType === 'domain') {
      scanInsertData.domain = targetValue;
    } else {
      scanInsertData.username = targetValue;
    }

    // Create scan record with the provided scanId
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert(scanInsertData)
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

    // Define providers based on scan type and tier
    let providers: string[];
    let totalSteps = 0;
    
    if (isFreeTierScan && scanType === 'username') {
      // Free tier quick scan: only WhatsMyName, but we show 6 synthetic steps
      providers = ["whatsmyname"];
      totalSteps = 6; // Synthetic steps for engaging UX
    } else {
      switch (scanType) {
        case 'email':
          // Email providers: Holehe + Abstract Email + IPQS Email + Breach Check
          providers = ["holehe", "abstract_email", "ipqs_email", "hibp"];
          break;
        case 'phone':
          // Phone providers: PhoneInfoga + Abstract Phone + NumVerify + IPQS Phone
          providers = ["phoneinfoga", "abstract_phone", "numverify", "ipqs_phone"];
          break;
        case 'domain':
          providers = ["whois", "dns"]; // Domain-specific providers
          break;
        case 'username':
        default:
          providers = ["sherlock", "gosearch", "maigret", "holehe", "whatsmyname"];
          break;
      }
    }

    // Create initial scan_progress record so UI can track progress
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    
    // Build initial progress record with step tracking for Free tier
    const progressRecord: Record<string, unknown> = {
      scan_id: scan.id,
      status: "running",
      total_providers: providers.length,
      completed_providers: 0,
      current_providers: providers,
      findings_count: 0,
      message: isFreeTierScan 
        ? "Starting quick scan..." 
        : `Starting scan with ${providers.length} providers...`,
      error: false,
      updated_at: new Date().toISOString(),
    };
    
    // Add step tracking fields for Free tier scans
    if (isFreeTierScan && totalSteps > 0) {
      progressRecord.current_step = 0;
      progressRecord.total_steps = totalSteps;
      progressRecord.step_title = "Initializing scan...";
      progressRecord.step_description = "Preparing to analyze your digital footprint...";
    }
    
    const { error: progressError } = await serviceClient.from("scan_progress").upsert(
      progressRecord,
      { onConflict: "scan_id" },
    );

    if (progressError) {
      console.error("[n8n-scan-trigger] Failed to create scan_progress:", progressError);
    } else {
      console.log(`[n8n-scan-trigger] Created scan_progress for ${scan.id} (Free tier: ${isFreeTierScan})`);
    }

    // Get callback token for n8n to post results back
    const callbackToken = Deno.env.get("N8N_CALLBACK_TOKEN");

    // Trigger n8n webhook (fire and forget using fetch without await)
    // Note: Supabase URL and anon key intentionally NOT sent to n8n
    // n8n should use callback tokens for authentication, not direct Supabase access
    const n8nPayload = {
      scanId: scan.id,
      scanType: scanType,
      target: targetValue,  // The primary value being searched (regardless of type)
      // Include specific fields for n8n workflow compatibility
      username: scanType === 'username' ? targetValue : (username?.trim() || undefined),
      email: scanType === 'email' ? targetValue : (email?.trim() || undefined),
      phone: scanType === 'phone' ? targetValue : (phone?.trim() || undefined),
      domain: scanType === 'domain' ? targetValue : (domain?.trim() || undefined),
      workspaceId: workspaceId,
      userId: user.id,
      mode,
      tier,  // Pass tier to n8n for conditional workflow logic
      workerUrl: workerUrl || "",
      workerToken: workerToken || "",
      callbackToken: callbackToken || "",
      progressWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-progress`,
      resultsWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-results`,
    };
    
    // Select webhook URL based on tier
    const webhookUrl = isFreeTierScan ? n8nFreeScanWebhookUrl : n8nWebhookUrl;

    console.log(`[n8n-scan-trigger] Tier: ${tier}, using ${isFreeTierScan ? 'FREE' : 'STANDARD'} workflow`);
    console.log(`[n8n-scan-trigger] Payload workerUrl: ${workerUrl ? "set" : "MISSING"}`);
    console.log(
      `[n8n-scan-trigger] Payload workerToken: ${workerToken ? `SET (${workerToken.length} chars)` : "MISSING"}`,
    );
    console.log(`[n8n-scan-trigger] Payload callbackToken: ${callbackToken ? "set" : "MISSING"}`);

    // Fire n8n webhook - wait briefly to catch immediate failures
    console.log(`[n8n-scan-trigger] Calling n8n webhook for scan ${scan.id} (URL: ${webhookUrl ? 'configured' : 'MISSING'})`);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for initial connection

    try {
      const n8nResponse = await fetch(webhookUrl!, {
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
            analysis_error: `n8n webhook returned ${n8nResponse.status}`,
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
          analysis_error: `n8n webhook unreachable: ${errMsg}`,
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

    // ==================== EMAIL-INTEL PARALLEL CALL ====================
    // For email scans, also call email-intel to run API providers (HIBP, Abstract, IPQS)
    // This runs in parallel with n8n which handles Holehe
    if (scanType === 'email' && targetValue) {
      console.log(`[n8n-scan-trigger] Triggering email-intel for ${targetValue.slice(0, 5)}***`);
      
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      try {
        // Fire email-intel edge function (don't await - fire and forget)
        fetch(`${supabaseUrl}/functions/v1/email-intel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            scanId: scan.id,
            email: targetValue,
            workspaceId: workspaceId,
            providers: ['hibp', 'abstract_email', 'ipqs_email'],
            userPlan: tier,
          }),
        }).then(res => {
          console.log(`[n8n-scan-trigger] email-intel responded: ${res.status}`);
        }).catch(err => {
          console.error(`[n8n-scan-trigger] email-intel error: ${err.message}`);
        });
        
        console.log(`[n8n-scan-trigger] email-intel triggered (fire-and-forget)`);
      } catch (emailIntelError) {
        console.error('[n8n-scan-trigger] Failed to trigger email-intel:', emailIntelError);
        // Don't fail the whole scan - n8n/Holehe can still run
      }
    }

    // ==================== PHONE-INTEL PARALLEL CALL ====================
    // For phone scans, also call phone-intel to run API providers (Abstract, IPQS, NumVerify)
    // This runs in parallel with n8n which handles PhoneInfoga
    if (scanType === 'phone' && targetValue) {
      console.log(`[n8n-scan-trigger] Triggering phone-intel for ${targetValue.slice(0, 5)}***`);
      
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      try {
        // Fire phone-intel edge function (don't await - fire and forget)
        fetch(`${supabaseUrl}/functions/v1/phone-intel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            scanId: scan.id,
            phone: targetValue,
            workspaceId: workspaceId,
            providers: ['abstract_phone', 'ipqs_phone', 'numverify'],
            userPlan: tier,
          }),
        }).then(res => {
          console.log(`[n8n-scan-trigger] phone-intel responded: ${res.status}`);
        }).catch(err => {
          console.error(`[n8n-scan-trigger] phone-intel error: ${err.message}`);
        });
        
        console.log(`[n8n-scan-trigger] phone-intel triggered (fire-and-forget)`);
      } catch (phoneIntelError) {
        console.error('[n8n-scan-trigger] Failed to trigger phone-intel:', phoneIntelError);
        // Don't fail the whole scan - n8n/PhoneInfoga can still run
      }
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
