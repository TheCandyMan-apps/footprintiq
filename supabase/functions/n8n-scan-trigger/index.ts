import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceTurnstile } from "../_shared/turnstile.ts";
import { normalizePlanTier } from "../_shared/planCapabilities.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Block reason codes for consistent frontend handling
type BlockReasonCode = 
  | 'email_verification_required'
  | 'free_any_scan_exhausted'
  | 'scan_blocked_by_tier'
  | 'no_providers_available_for_tier';

interface BlockResponse {
  error: string;
  code: BlockReasonCode;
  message: string;
  scanType: string;
}

function createBlockResponse(block: BlockResponse): Response {
  console.log(`[n8n-scan-trigger] Scan blocked: ${block.code} - ${block.message}`);
  return new Response(JSON.stringify(block), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
      tier: requestedTier = "free",  // Accept tier parameter from frontend (not trusted)
      referrer,  // Optional: normalised hostname of document.referrer
    } = body;
    
    // ==================== TIER & EMAIL VERIFICATION GATING ====================
    // Enforce same rules as scan-orchestrate for non-username scans
    
    // Create service client for workspace lookup
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Get workspace plan/tier
    let workspacePlan = 'free';
    if (workspaceId) {
      const { data: workspace } = await serviceClient
        .from('workspaces')
        .select('plan, subscription_tier')
        .eq('id', workspaceId)
        .single();
      
      if (workspace) {
        // IMPORTANT: Prefer subscription_tier over plan.
        // This supports Hybrid test mode where plan='free' (UI rendering) but subscription_tier='pro' (backend execution).
        workspacePlan = normalizePlanTier(workspace.subscription_tier || workspace.plan);
      }
    }
    
    // Never trust the client-provided tier for enforcement.
    // Use workspace-derived tier for all backend gating and workflow routing.
    const effectiveTier = workspacePlan;

    console.log(
      `[n8n-scan-trigger] Workspace tier: ${workspacePlan}, requestedTier: ${requestedTier}, scanType: ${scanType}`,
    );
    
    // For non-username scans on Free tier, check email verification and scan credits
    if (workspacePlan === 'free' && (scanType === 'email' || scanType === 'phone')) {
      // Check if user email is verified
      if (!user.email_confirmed_at) {
        // Log scan.blocked event
        await serviceClient.from('activity_logs').insert({
          user_id: user.id,
          action: 'scan.blocked',
          entity_type: 'scan',
          metadata: {
            scan_type: scanType,
            reason: 'email_verification_required',
            workspace_id: workspaceId,
          },
        });
        
        return createBlockResponse({
          error: 'email_verification_required',
          code: 'email_verification_required',
          message: 'Please verify your email address to use this scan type.',
          scanType,
        });
      }
      
      // Phone scans on Free tier: allowed with abstract_phone only (free-tier provider)
      // Other phone providers (IPQS, NumVerify, Twilio, TrueCaller) are gated by enforceProviderAccess in phone-intel
      
      // For email scans - check if user has free_any_scan_credits OR allow holehe-only scan
      // (Holehe is available on Free tier, so we allow email scans to proceed)
      // The email-intel function will filter providers by tier
    }
    
    // Determine if this is a Free tier quick scan (only username scans use quick workflow)
    const isFreeTierScan = workspacePlan === "free" && scanType === "username" && n8nFreeScanWebhookUrl;

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

    // Store referrer if provided (already normalised to hostname by frontend)
    if (referrer && typeof referrer === 'string' && referrer.length < 255) {
      scanInsertData.referrer = referrer;
    }

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
          // Email providers: Holehe + Abstract Email + Email Reputation + IPQS Email + Breach Check
          providers = ["holehe", "abstract_email", "abstract_email_reputation", "ipqs_email", "hibp"];
          break;
        case 'phone':
          // Phone providers: PhoneInfoga + Abstract Phone + NumVerify + IPQS Phone
          providers = ["phoneinfoga", "abstract_phone", "numverify", "ipqs_phone"];
          break;
        case 'domain':
          providers = ["whois", "dns"]; // Domain-specific providers
          break;
        case 'personal_details':
          // Name/personal_details searches use PredictaSearch (supports name queries)
          // Also try username tools with sanitized name (no spaces → underscores)
          providers = ["predictasearch"];
          break;
        case 'username':
        default:
          providers = ["sherlock", "gosearch", "maigret", "holehe", "whatsmyname", "predictasearch"];
          break;
      }
    }

    // Create initial scan_progress record so UI can track progress
    // (serviceClient already created above for tier gating)
    
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
      // For personal_details (name searches), pass as 'name' field for PredictaSearch
      name: scanType === 'personal_details' ? targetValue : undefined,
      workspaceId: workspaceId,
      userId: user.id,
      mode,
      tier: effectiveTier, // Pass effective tier to workflow for conditional logic
      workerUrl: workerUrl || "",
      workerToken: workerToken || "",
      callbackToken: callbackToken || "",
      progressWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-progress`,
      resultsWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-results`,
      // Telegram OSINT proxy options for n8n workflow
      telegramOptions: {
        enabled: true,
        action: scanType === 'phone' && effectiveTier !== 'free' ? 'phone_presence' : 'username',
        username: scanType === 'username' ? targetValue : undefined,
        phoneE164: scanType === 'phone' ? targetValue : null,
        consentConfirmed: scanType === 'phone' && effectiveTier !== 'free',
        lawfulBasis: scanType === 'phone' && effectiveTier !== 'free' ? 'legitimate_interest' : null,
      },
      telegramProxyUrl: `${supabaseUrl}/functions/v1/telegram-proxy`,
    };
    
    // Select webhook URL based on tier
    const webhookUrl = isFreeTierScan ? n8nFreeScanWebhookUrl : n8nWebhookUrl;

    console.log(`[n8n-scan-trigger] Tier: ${effectiveTier}, using ${isFreeTierScan ? 'FREE' : 'STANDARD'} workflow`);
    console.log(`[n8n-scan-trigger] Payload workerUrl: ${workerUrl ? "set" : "MISSING"}`);
    console.log(
      `[n8n-scan-trigger] Payload workerToken: ${workerToken ? `SET (${workerToken.length} chars)` : "MISSING"}`,
    );
    console.log(`[n8n-scan-trigger] Payload callbackToken: ${callbackToken ? "set" : "MISSING"}`);

    // For personal_details (name) scans, skip n8n entirely.
    // Name-intel (PredictaSearch) is the sole handler — username tools (Sherlock, Maigret)
    // don't support spaces and would return empty, then overwrite valid results.
    if (scanType === 'personal_details') {
      console.log(`[n8n-scan-trigger] Skipping n8n workflow for personal_details scan ${scan.id} — name-intel handles this`);
      await serviceClient.from("scans").update({ status: "running" }).eq("id", scan.id);
    } else {
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
          await serviceClient
            .from("scans")
            .update({ 
              status: "failed", 
              analysis_error: `n8n webhook returned ${n8nResponse.status}`,
              completed_at: new Date().toISOString()
            })
            .eq("id", scan.id);
          
          await serviceClient.from("scan_progress").update({
            status: "error",
            error: true,
            message: `Workflow failed to start (HTTP ${n8nResponse.status})`,
            updated_at: new Date().toISOString(),
          }).eq("scan_id", scan.id);

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
        
        await serviceClient
          .from("scans")
          .update({ 
            status: "failed", 
            analysis_error: `n8n webhook unreachable: ${errMsg}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", scan.id);
        
        await serviceClient.from("scan_progress").update({
          status: "error",
          error: true,
          message: `Workflow unreachable: ${errMsg.substring(0, 100)}`,
          updated_at: new Date().toISOString(),
        }).eq("scan_id", scan.id);

        await serviceClient.from("system_errors").insert({
          error_type: "n8n_webhook_unreachable",
          message: `n8n webhook failed for scan ${scan.id}: ${errMsg}`,
          metadata: { scanId: scan.id, username, error: errMsg },
          severity: "error",
        });
      }
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
            providers: ['hibp', 'abstract_email', 'abstract_email_reputation', 'ipqs_email'],
            userPlan: effectiveTier,
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
            userPlan: effectiveTier,
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

    // ==================== NAME-INTEL CALL (personal_details scans) ====================
    // For personal_details (name) scans, call name-intel to run PredictaSearch
    // This is the PRIMARY handler for name searches (n8n not used for this scan type)
    if (scanType === 'personal_details' && targetValue) {
      console.log(`[n8n-scan-trigger] Triggering name-intel for "${targetValue.slice(0, 10)}***"`);
      
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      try {
        // Fire name-intel edge function (don't await - fire and forget)
        fetch(`${supabaseUrl}/functions/v1/name-intel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            scanId: scan.id,
            name: targetValue,
            workspaceId: workspaceId,
            providers: ['predictasearch'],
            userPlan: effectiveTier,
          }),
        }).then(res => {
          console.log(`[n8n-scan-trigger] name-intel responded: ${res.status}`);
        }).catch(err => {
          console.error(`[n8n-scan-trigger] name-intel error: ${err.message}`);
        });
        
        console.log(`[n8n-scan-trigger] name-intel triggered (fire-and-forget)`);
      } catch (nameIntelError) {
        console.error('[n8n-scan-trigger] Failed to trigger name-intel:', nameIntelError);
      }
    }

    // ==================== PREDICTA-INTEL PARALLEL CALL (username scans, Pro+) ====================
    // For username scans on Pro+ tiers, also call Predicta Search for rich profile data & photos
    // Costs 3 credits per call. Fire-and-forget pattern (does not block scan response).
    if (scanType === 'username' && targetValue && effectiveTier !== 'free') {
      console.log(`[n8n-scan-trigger] Evaluating Predicta Search for username "${targetValue.slice(0, 5)}***" (tier: ${effectiveTier})`);
      
      try {
        // 1. Check credit balance
        const { data: balanceData, error: balanceError } = await serviceClient
          .rpc('get_credits_balance', { _workspace_id: workspaceId });
        
        const currentBalance = balanceData ?? 0;
        const predictaCost = 3;
        
        if (balanceError) {
          console.error(`[n8n-scan-trigger] Failed to check credits for Predicta:`, balanceError);
          // Log as skipped and continue
          await serviceClient.from('scan_events').insert({
            scan_id: scan.id,
            provider: 'predictasearch',
            event_type: 'provider_skipped',
            payload: { reason: 'credit_check_failed', error: balanceError.message },
          });
        } else if (currentBalance < predictaCost) {
          console.log(`[n8n-scan-trigger] Insufficient credits for Predicta (have: ${currentBalance}, need: ${predictaCost})`);
          // Log as skipped due to insufficient credits
          await serviceClient.from('scan_events').insert({
            scan_id: scan.id,
            provider: 'predictasearch',
            event_type: 'provider_skipped',
            payload: { reason: 'insufficient_credits', balance: currentBalance, cost: predictaCost },
          });
        } else {
          // 2. Deduct credits
          const { data: spendResult, error: spendError } = await serviceClient
            .rpc('spend_credits', {
              _workspace_id: workspaceId,
              _cost: predictaCost,
              _reason: 'api_usage',
              _meta: { provider: 'predictasearch', scan_id: scan.id, scan_type: 'username', username: targetValue },
            });
          
          if (spendError || !spendResult) {
            console.error(`[n8n-scan-trigger] Failed to deduct credits for Predicta:`, spendError);
            await serviceClient.from('scan_events').insert({
              scan_id: scan.id,
              provider: 'predictasearch',
              event_type: 'provider_skipped',
              payload: { reason: 'credit_deduction_failed', error: spendError?.message },
            });
          } else {
            console.log(`[n8n-scan-trigger] Deducted ${predictaCost} credits for Predicta Search (balance: ${currentBalance - predictaCost})`);
            
            // Log credit deduction event
            await serviceClient.from('scan_events').insert({
              scan_id: scan.id,
              provider: 'predictasearch',
              event_type: 'credits_deducted',
              payload: { cost: predictaCost, remaining: currentBalance - predictaCost },
            });
            
            // 3. Fire predicta-search edge function (fire-and-forget)
            fetch(`${supabaseUrl}/functions/v1/predicta-search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                query: targetValue,
                queryType: 'username',
                networks: ['all'],
              }),
            }).then(async (res) => {
              console.log(`[n8n-scan-trigger] predicta-search responded: ${res.status}`);
              
              if (!res.ok) {
                console.error(`[n8n-scan-trigger] predicta-search HTTP error: ${res.status}`);
                await serviceClient.from('scan_events').insert({
                  scan_id: scan.id,
                  provider: 'predictasearch',
                  event_type: 'provider_error',
                  payload: { status: res.status, error: `HTTP ${res.status}` },
                });
                return;
              }
              
              const predictaResult = await res.json();
              
              if (!predictaResult?.success) {
                console.error(`[n8n-scan-trigger] predicta-search returned error:`, predictaResult?.error || predictaResult?.message);
                await serviceClient.from('scan_events').insert({
                  scan_id: scan.id,
                  provider: 'predictasearch',
                  event_type: 'provider_error',
                  payload: { error: predictaResult?.error || predictaResult?.message || 'Unknown error' },
                });
                return;
              }
              
              // 4. Normalize and insert findings
              const profiles = predictaResult.data?.profiles || [];
              const breaches = predictaResult.data?.breaches || [];
              const leaks = predictaResult.data?.leaks || [];
              
              console.log(`[n8n-scan-trigger] Predicta returned ${profiles.length} profiles, ${breaches.length} breaches, ${leaks.length} leaks`);
              
              const findings: Record<string, unknown>[] = [];
              const now = new Date().toISOString();
              
              // Helper: cache a single avatar image to scan-images storage bucket
              // Returns the public URL on success, or null on failure (graceful skip)
              async function cacheAvatar(
                imageUrl: string, 
                scanId: string, 
                platformSlug: string
              ): Promise<string | null> {
                try {
                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
                  
                  const imgRes = await fetch(imageUrl, { 
                    signal: controller.signal,
                    headers: { 'User-Agent': 'FootprintIQ/1.0' },
                  });
                  clearTimeout(timeout);
                  
                  if (!imgRes.ok) {
                    console.log(`[avatar-cache] Failed to fetch ${platformSlug}: HTTP ${imgRes.status}`);
                    return null;
                  }
                  
                  const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
                  const blob = await imgRes.blob();
                  
                  // Skip if image is too small (likely a placeholder/error page)
                  if (blob.size < 100) {
                    console.log(`[avatar-cache] Skipping ${platformSlug}: too small (${blob.size} bytes)`);
                    return null;
                  }
                  
                  const storagePath = `avatars/${scanId}/${platformSlug}.${ext}`;
                  
                  const { error: uploadError } = await serviceClient.storage
                    .from('scan-images')
                    .upload(storagePath, blob, { 
                      contentType, 
                      upsert: true,
                    });
                  
                  if (uploadError) {
                    console.error(`[avatar-cache] Upload failed for ${platformSlug}:`, uploadError.message);
                    return null;
                  }
                  
                  const { data: publicUrlData } = serviceClient.storage
                    .from('scan-images')
                    .getPublicUrl(storagePath);
                  
                  console.log(`[avatar-cache] Cached ${platformSlug} avatar → ${storagePath}`);
                  return publicUrlData?.publicUrl || null;
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err);
                  // Don't log abort errors as errors (expected on timeout)
                  if (msg.includes('abort')) {
                    console.log(`[avatar-cache] Timeout fetching ${platformSlug} avatar`);
                  } else {
                    console.error(`[avatar-cache] Error caching ${platformSlug}:`, msg);
                  }
                  return null;
                }
              }
              
              // Normalize profiles into findings (correct schema)
              // Cache avatars in parallel before building findings
              const avatarCachePromises = profiles.map(async (profile: Record<string, unknown>) => {
                const cdnUrl = (profile.pfp_image || profile.avatar_url) as string | null;
                if (!cdnUrl) return null;
                const platformSlug = ((profile.platform as string) || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_');
                return cacheAvatar(cdnUrl, scan.id, platformSlug);
              });
              
              const cachedAvatarUrls = await Promise.all(avatarCachePromises);
              console.log(`[n8n-scan-trigger] Avatar caching: ${cachedAvatarUrls.filter(Boolean).length}/${profiles.length} succeeded`);
              
              for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                const profileUrl = profile.link || profile.url || null;
                const originalAvatar = profile.pfp_image || profile.avatar_url || null;
                const cachedAvatar = cachedAvatarUrls[i] || null;
                
                findings.push({
                  scan_id: scan.id,
                  workspace_id: workspaceId,
                  provider: 'predictasearch',
                  kind: 'social.profile',
                  severity: 'info',
                  confidence: profile.is_verified ? 0.90 : 0.70,
                  observed_at: now,
                  evidence: profileUrl ? [{ key: 'url', value: profileUrl }] : [],
                  meta: {
                    label: profile.platform || profile.name || 'Unknown',
                    url: profileUrl,
                    platform: profile.platform,
                    username: profile.username || targetValue,
                    display_name: profile.name || profile.display_name,
                    avatar: originalAvatar,
                    avatar_cached: cachedAvatar,
                    followers: profile.followers_count,
                    following: profile.following_count,
                    verified: profile.is_verified,
                    country: profile.country,
                    gender: profile.gender,
                    age: profile.age,
                    source: 'predictasearch',
                  },
                });
              }
              
              // Normalize breaches into findings (correct schema)
              for (const breach of breaches) {
                const breachDomain = breach.breach_domain || breach.domain || null;
                findings.push({
                  scan_id: scan.id,
                  workspace_id: workspaceId,
                  provider: 'predictasearch',
                  kind: 'breach.hit',
                  severity: 'high',
                  confidence: 0.85,
                  observed_at: now,
                  evidence: breachDomain ? [{ key: 'domain', value: breachDomain }] : [],
                  meta: {
                    label: breach.breach_name || breach.name || 'Unknown Breach',
                    url: breachDomain,
                    breach_name: breach.breach_name || breach.name,
                    breach_domain: breachDomain,
                    breach_date: breach.date,
                    pwn_count: breach.pwn_count,
                    description: breach.description,
                    data_classes: breach.data_classes,
                    source: 'predictasearch',
                  },
                });
              }
              
              // Normalize leaks into findings (correct schema)
              for (const leak of leaks) {
                const leakDomain = leak.domain || null;
                findings.push({
                  scan_id: scan.id,
                  workspace_id: workspaceId,
                  provider: 'predictasearch',
                  kind: 'breach.hit',
                  severity: 'high',
                  confidence: 0.80,
                  observed_at: now,
                  evidence: leakDomain ? [{ key: 'domain', value: leakDomain }] : [],
                  meta: {
                    label: leak.name || leak.title || 'Data Leak',
                    url: leakDomain,
                    leak_name: leak.name || leak.title,
                    description: leak.description,
                    data_classes: leak.data_classes,
                    source: 'predictasearch',
                  },
                });
              }
              
              if (findings.length > 0) {
                const { error: insertError } = await serviceClient
                  .from('findings')
                  .insert(findings);
                
                if (insertError) {
                  console.error(`[n8n-scan-trigger] Failed to insert Predicta findings:`, insertError);
                  await serviceClient.from('scan_events').insert({
                    scan_id: scan.id,
                    provider: 'predictasearch',
                    event_type: 'provider_error',
                    payload: { error: 'findings_insert_failed', details: insertError.message },
                  });
                } else {
                  console.log(`[n8n-scan-trigger] Inserted ${findings.length} Predicta findings for scan ${scan.id}`);
                  
                  // Update scan_progress findings count
                  const { data: currentProgress } = await serviceClient
                    .from('scan_progress')
                    .select('findings_count')
                    .eq('scan_id', scan.id)
                    .single();
                  
                  const newCount = (currentProgress?.findings_count || 0) + findings.length;
                  await serviceClient.from('scan_progress').update({
                    findings_count: newCount,
                    updated_at: new Date().toISOString(),
                  }).eq('scan_id', scan.id);
                }
              }
              
              // Log completion event
              await serviceClient.from('scan_events').insert({
                scan_id: scan.id,
                provider: 'predictasearch',
                event_type: 'provider_done',
                payload: {
                  profiles: profiles.length,
                  breaches: breaches.length,
                  leaks: leaks.length,
                  findings_inserted: findings.length,
                },
              });
              
              console.log(`[n8n-scan-trigger] Predicta Search completed for scan ${scan.id}`);
            }).catch(async (err) => {
              console.error(`[n8n-scan-trigger] predicta-search fetch error: ${err.message}`);
              await serviceClient.from('scan_events').insert({
                scan_id: scan.id,
                provider: 'predictasearch',
                event_type: 'provider_error',
                payload: { error: err.message },
              });
            });
            
            console.log(`[n8n-scan-trigger] predicta-search triggered (fire-and-forget)`);
          }
        }
      } catch (predictaError) {
        console.error('[n8n-scan-trigger] Failed to trigger predicta-search:', predictaError);
        // Don't fail the whole scan
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
