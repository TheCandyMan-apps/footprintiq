/**
 * Anonymous Scan Trigger
 * Allows unauthenticated users to run a free username scan.
 * - Rate limited: 2 scans per IP per 24h
 * - Stores scan with user_id=null, workspace_id=null, claimed=false
 * - Routes to the free n8n quick-scan workflow only
 * - No Pro features permitted
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-fp",
};

const ANON_RATE_LIMIT = 2;        // scans per IP
const RATE_WINDOW_HOURS = 24;      // window in hours

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nFreeScanWebhookUrl = Deno.env.get("N8N_FREE_SCAN_WEBHOOK_URL");
    const n8nWebhookUrl = Deno.env.get("N8N_SCAN_WEBHOOK_URL");
    const workerUrl = Deno.env.get("OSINT_WORKER_URL");
    const workerToken = Deno.env.get("OSINT_WORKER_TOKEN");
    const callbackToken = Deno.env.get("N8N_CALLBACK_TOKEN");

    const db = createClient(supabaseUrl, serviceRoleKey);

    // ── Get client IP ─────────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ── Parse body ────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const {
      username,
      session_fingerprint,
      scanId: providedScanId,
    } = body as {
      username?: string;
      session_fingerprint?: string;
      scanId?: string;
    };

    // ── Validate input ────────────────────────────────────────────
    const target = (username as string | undefined)?.trim();
    if (!target || target.length < 2) {
      return json({ error: "username must be at least 2 characters" }, 400);
    }
    if (target.length > 50) {
      return json({ error: "username must be 50 characters or fewer" }, 400);
    }

    // Only allow safe username characters (alphanumeric, dots, underscores, hyphens)
    const usernamePattern = /^[a-zA-Z0-9._-]+$/;
    if (!usernamePattern.test(target)) {
      return json({ error: "Username contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed." }, 400);
    }

    const invalidValues = ["true", "false", "null", "undefined", "nan"];
    if (invalidValues.includes(target.toLowerCase())) {
      return json({ error: "Invalid username value" }, 400);
    }

    // ── IP Rate Limit ─────────────────────────────────────────────
    const windowStart = new Date(Date.now() - RATE_WINDOW_HOURS * 3600 * 1000).toISOString();

    // Upsert rate limit record
    const { data: rateData, error: rateErr } = await db
      .from("anonymous_scan_rate_limits")
      .upsert(
        { ip_address: ip, scan_count: 0, window_start: new Date().toISOString() },
        { onConflict: "ip_address", ignoreDuplicates: false }
      )
      .select()
      .single();

    // Fetch current state
    const { data: currentRate } = await db
      .from("anonymous_scan_rate_limits")
      .select("*")
      .eq("ip_address", ip)
      .single();

    if (currentRate) {
      // Reset window if expired
      const windowExpired = new Date(currentRate.window_start) < new Date(windowStart);
      if (windowExpired) {
        await db
          .from("anonymous_scan_rate_limits")
          .update({ scan_count: 0, window_start: new Date().toISOString() })
          .eq("ip_address", ip);
        currentRate.scan_count = 0;
      }

      if (currentRate.scan_count >= ANON_RATE_LIMIT) {
        console.log(`[anon-scan-trigger] Rate limit hit for IP ${ip.substring(0, 8)}***`);
        return json(
          {
            error: "rate_limit_exceeded",
            message: `Free scans are limited to ${ANON_RATE_LIMIT} per day. Create a free account to continue scanning.`,
            code: "anon_rate_limit",
          },
          429
        );
      }

      // Increment counter
      await db
        .from("anonymous_scan_rate_limits")
        .update({
          scan_count: currentRate.scan_count + 1,
          last_scan_at: new Date().toISOString(),
        })
        .eq("ip_address", ip);
    }

    // ── Create scan record ────────────────────────────────────────
    const scanId = (providedScanId as string | undefined) || crypto.randomUUID();

    const { data: scan, error: scanErr } = await db
      .from("scans")
      .insert({
        id: scanId,
        user_id: null,       // anonymous
        workspace_id: null,  // anonymous
        scan_type: "username",
        username: target,
        status: "pending",
        provider_counts: {},
        results_route: "results",
        claimed: false,
        session_fingerprint: session_fingerprint || null,
      })
      .select()
      .single();

    if (scanErr || !scan) {
      console.error("[anon-scan-trigger] Failed to create scan:", scanErr);
      return json({ error: "Failed to create scan record" }, 500);
    }

    console.log(`[anon-scan-trigger] Created anonymous scan ${scanId} for target ${target.substring(0, 3)}***`);

    // ── Create scan_progress record ───────────────────────────────
    await db.from("scan_progress").upsert(
      {
        scan_id: scanId,
        status: "running",
        total_providers: 1,
        completed_providers: 0,
        current_providers: ["whatsmyname"],
        findings_count: 0,
        message: "Starting quick scan...",
        error: false,
        current_step: 0,
        total_steps: 6,
        step_title: "Initializing scan...",
        step_description: "Preparing to analyse your digital footprint...",
      },
      { onConflict: "scan_id" }
    );

    // ── Fire n8n free scan workflow ───────────────────────────────
    const webhookUrl = n8nFreeScanWebhookUrl || n8nWebhookUrl;
    if (!webhookUrl) {
      console.error("[anon-scan-trigger] No n8n webhook URL configured");
      await db.from("scans").update({ status: "failed" }).eq("id", scanId);
      return json({ error: "Scan workflow not configured" }, 500);
    }

    const n8nPayload = {
      scanId,
      scanType: "username",
      target,
      username: target,
      workspaceId: null,
      userId: null,
      mode: "lean",
      tier: "free",   // always free for anonymous scans
      workerUrl: workerUrl || "",
      workerToken: workerToken || "",
      callbackToken: callbackToken || "",
      progressWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-progress`,
      resultsWebhookUrl: `${supabaseUrl}/functions/v1/n8n-scan-results`,
      telegramOptions: { enabled: false },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (n8nRes.ok) {
        await db.from("scans").update({ status: "running" }).eq("id", scanId);
        console.log(`[anon-scan-trigger] n8n accepted scan ${scanId}`);
      } else {
        console.error(`[anon-scan-trigger] n8n rejected scan: HTTP ${n8nRes.status}`);
        await db.from("scans").update({ status: "running" }).eq("id", scanId);
      }
    } catch (fetchErr) {
      clearTimeout(timeout);
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error(`[anon-scan-trigger] n8n fetch error: ${msg}`);
      // Still return the scan ID — results page will handle pending state
      await db.from("scans").update({ status: "running" }).eq("id", scanId);
    }

    return json({ scan_id: scanId, anonymous: true }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[anon-scan-trigger] Unhandled error:", msg);
    return json({ error: "Internal server error" }, 500);
  }
});
