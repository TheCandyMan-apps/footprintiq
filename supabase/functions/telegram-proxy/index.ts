/**
 * telegram-proxy – Supabase Edge Function
 *
 * Secure proxy that allows n8n Cloud (or admin UI) to trigger Telegram
 * OSINT actions against private Google Cloud Run worker(s).
 *
 * ──────────────────────────────────────────────────────────────────
 * SUPPORTED ACTIONS
 * ──────────────────────────────────────────────────────────────────
 * | action           | tier   | description                         |
 * |------------------|--------|-------------------------------------|
 * | username         | free+  | Basic profile lookup                |
 * | phone_presence   | pro+   | Phone→Telegram presence check       |
 * | channel_scrape   | free+  | Channel metadata + recent messages  |
 * | activity_intel   | pro+   | Posting cadence, NER, risk scores   |
 *
 * Body (common fields for ALL actions):
 *   {
 *     "action":      "<action>",
 *     "scanId":      "<uuid>",
 *     "workspaceId": "<uuid | ''>",
 *     "userId":      "<uuid>",
 *     "tier":        "free" | "pro" | "business"
 *   }
 *
 * Action-specific fields:
 *   username:        { "username": "target" }
 *   phone_presence:  { "phoneE164": "+44…", "consentConfirmed": true, "lawfulBasis": "…" }
 *   channel_scrape:  { "channel": "@channelusername", "messageLimit": 25 }
 *   activity_intel:  { "channel": "@channelusername", "messageLimit": 200 }
 *
 * Headers:
 *   Content-Type: application/json
 *   x-n8n-key:    <N8N_GATEWAY_KEY>   (or Authorization: Bearer <JWT> for admin)
 * ──────────────────────────────────────────────────────────────────
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-n8n-key",
};

// ── Types & Constants ────────────────────────────────────────────

type TelegramAction = "username" | "phone_presence" | "channel_scrape" | "activity_intel";

const VALID_ACTIONS: readonly TelegramAction[] = [
  "username",
  "phone_presence",
  "channel_scrape",
  "activity_intel",
] as const;

/** Minimum tier required for each action */
const ACTION_TIER_GATE: Record<TelegramAction, "free" | "pro"> = {
  username: "free",
  phone_presence: "pro",
  channel_scrape: "free",
  activity_intel: "pro",
};

/** Worker path for each action (allows future split to separate services) */
const ACTION_SERVICE_MAP: Record<TelegramAction, { path: string; serviceUrlEnv?: string }> = {
  username:        { path: "/telegram/username" },
  phone_presence:  { path: "/telegram/phone-presence" },
  channel_scrape:  { path: "/telegram/channel-scrape" },
  activity_intel:  { path: "/telegram/activity-intel" },
  // To split channel_scrape to a separate service later, add:
  // channel_scrape: { path: "/telegram/channel-scrape", serviceUrlEnv: "TELEGRAM_CHANNEL_WORKER_URL" },
};

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, business: 2 };

function meetsTier(userTier: string, required: string): boolean {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[required] ?? 0);
}

// ── helpers ──────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Build a Google-signed JWT, exchange it for an ID token, then call Cloud Run.
 *
 * Flow:
 *   1. Create RS256 JWT with `target_audience` claim = Cloud Run URL
 *   2. POST to https://oauth2.googleapis.com/token  →  access_token
 *   3. POST to IAM generateIdToken                  →  id_token (OIDC)
 *   4. Call Cloud Run with `Authorization: Bearer <id_token>`
 */
async function getGoogleIdToken(audience: string): Promise<string> {
  const email = Deno.env.get("GCP_SA_EMAIL")!;
  const rawKey = Deno.env.get("GCP_SA_PRIVATE_KEY")!;

  // ── Import PEM private key ──
  const pemBody = rawKey
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/, "")
    .replace(/-----END (RSA )?PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // ── Build JWT ──
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    sub: email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/iam",
  };

  const b64url = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const signingInput = `${b64url(header)}.${b64url(payload)}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signingInput}.${sig64}`;

  // ── Exchange JWT for access token ──
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const { access_token } = await tokenRes.json();

  // ── Use IAM to generate ID token for Cloud Run audience ──
  const idTokenRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${email}:generateIdToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audience,
        includeEmail: true,
      }),
    },
  );

  if (!idTokenRes.ok) {
    const errText = await idTokenRes.text();
    throw new Error(`IAM generateIdToken failed (${idTokenRes.status}): ${errText}`);
  }

  const { token } = await idTokenRes.json();
  return token;
}

// ── main handler ─────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: n8n gateway key OR admin JWT ──
    const gatewayKey = Deno.env.get("N8N_GATEWAY_KEY");
    const providedKey = req.headers.get("x-n8n-key");
    const hasValidGatewayKey = gatewayKey && providedKey && providedKey === gatewayKey;

    let isAdminCaller = false;
    if (!hasValidGatewayKey) {
      // Check if caller is an authenticated admin via Supabase JWT
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          // Check admin role via service client (RLS bypass)
          const svc = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          );
          const { data: roleData } = await svc
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .single();
          isAdminCaller = roleData?.role === "admin";
        }
      }
    }

    if (!hasValidGatewayKey && !isAdminCaller) {
      return json({ ok: false, error: "Forbidden – invalid credentials" }, 403);
    }

    // ── Parse & validate body ──
    const body = await req.json();
    const {
      action,
      username,
      phoneE164,
      consentConfirmed,
      lawfulBasis,
      channel: rawChannel,  // for channel_scrape / activity_intel
      query,                // alias for channel (n8n sends query)
      messageLimit,         // optional: default 25 for scrape, 200 for intel
      maxMessages,          // alias for messageLimit
      scanId,
      workspaceId,
      userId,
      tier,
    } = body;

    // Normalize: accept query as alias for channel, maxMessages as alias for messageLimit
    const channel = rawChannel || query || "";
    const resolvedMessageLimit = messageLimit ?? maxMessages;

    // Required for all actions
    if (!scanId || workspaceId === undefined || workspaceId === null || !userId || !tier) {
      return json({ ok: false, error: "Missing required fields: scanId, workspaceId, userId, tier" }, 400);
    }

    if (!action || !VALID_ACTIONS.includes(action as TelegramAction)) {
      return json({
        ok: false,
        error: `Invalid action "${action}". Must be one of: ${VALID_ACTIONS.join(", ")}`,
      }, 400);
    }

    const typedAction = action as TelegramAction;

    // ── Tier gating ──
    const requiredTier = ACTION_TIER_GATE[typedAction];
    if (!meetsTier(tier, requiredTier)) {
      const tierLabel = requiredTier === "pro" ? "Pro" : "Business";
      return json({
        ok: false,
        error: `${typedAction} requires ${tierLabel} tier`,
        requiredTier,
      }, 403);
    }

    // ── Action-specific validation ──
    if (typedAction === "username") {
      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return json({ ok: false, error: "username is required for action=username" }, 400);
      }
    }

    if (typedAction === "phone_presence") {
      if (!phoneE164 || typeof phoneE164 !== "string" || !/^\+[1-9]\d{1,14}$/.test(phoneE164)) {
        return json({ ok: false, error: "Valid E.164 phoneE164 is required for action=phone_presence" }, 400);
      }
      if (consentConfirmed !== true) {
        return json({ ok: false, error: "consentConfirmed must be true for phone_presence" }, 400);
      }
    }

    if (typedAction === "channel_scrape" || typedAction === "activity_intel") {
      if (!channel || typeof channel !== "string" || channel.trim().length === 0) {
        return json({ ok: false, error: `channel is required for action=${typedAction}` }, 400);
      }
    }

    // ── Resolve worker service URL via action→service map ──
    const serviceMapping = ACTION_SERVICE_MAP[typedAction];
    const workerUrl = serviceMapping.serviceUrlEnv
      ? Deno.env.get(serviceMapping.serviceUrlEnv) || Deno.env.get("TELEGRAM_WORKER_URL")
      : Deno.env.get("TELEGRAM_WORKER_URL");
    const workerKey = Deno.env.get("OSINT_WORKER_TOKEN");

    if (!workerUrl) {
      return json({ ok: false, error: "TELEGRAM_WORKER_URL not configured" }, 500);
    }

    const targetUrl = `${workerUrl.replace(/\/$/, "")}${serviceMapping.path}`;

    // Build worker payload (common fields)
    const workerPayload: Record<string, unknown> = {
      scanId,
      workspaceId,
      userId,
      tier,
      action: typedAction,
    };

    // Action-specific payload fields
    switch (typedAction) {
      case "username":
        workerPayload.username = username.trim();
        workerPayload.channel = username.trim();  // handle_channel_scrape reads 'channel' field
        break;
      case "phone_presence":
        workerPayload.phoneE164 = phoneE164;
        workerPayload.consentConfirmed = true;
        workerPayload.lawfulBasis = lawfulBasis || "legitimate_interest";
        break;
      case "channel_scrape":
        workerPayload.channel = channel.trim();
        workerPayload.messageLimit = Math.min(Math.max(resolvedMessageLimit || 25, 1), 200);
        break;
      case "activity_intel":
        workerPayload.channel = channel.trim();
        workerPayload.messageLimit = Math.min(Math.max(resolvedMessageLimit || 200, 1), 200);
        break;
    }

    // ── Get GCP ID token for private Cloud Run ──
    let idToken: string;
    try {
      idToken = await getGoogleIdToken(workerUrl);
    } catch (err) {
      console.error("[telegram-proxy] Failed to get GCP ID token:", err);
      return json({ ok: false, error: "GCP authentication failed" }, 500);
    }

    // ── Call Cloud Run ──
    console.log(`[telegram-proxy] Calling ${targetUrl} for scan ${scanId}`);

    const workerHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
    if (workerKey) {
      workerHeaders["X-Worker-Key"] = workerKey;
    }

    const workerRes = await fetch(targetUrl, {
      method: "POST",
      headers: workerHeaders,
      body: JSON.stringify(workerPayload),
    });

    const workerBody = await workerRes.text();

    // ── Parse worker response ──
    let result: Record<string, any>;

    if (!workerRes.ok) {
      console.warn(`[telegram-proxy] Worker returned ${workerRes.status}: ${workerBody}`);

      // Check if this is a "not found" error — treat as empty results, not a failure
      const isNotFound =
        workerRes.status === 404 ||
        /cannot find any entity/i.test(workerBody) ||
        /not found/i.test(workerBody) ||
        /no (such |telegram )?user/i.test(workerBody);

      if (isNotFound) {
        console.log(`[telegram-proxy] Entity not found for scan ${scanId} — returning empty results`);
        return json({
          ok: true,
          scanId,
          findings: [],
          artifacts_stored: 0,
          note: "No Telegram entity found for this username",
        });
      }

      // Genuine errors still return 502
      return json({
        ok: false,
        scanId,
        error: `Worker returned ${workerRes.status}`,
        details: workerBody.substring(0, 500),
      }, 502);
    }

    try {
      result = JSON.parse(workerBody);
    } catch {
      return json({ ok: false, scanId, error: "Worker returned invalid JSON" }, 502);
    }

    if (!result.ok) {
      // Also check for not-found in parsed response
      const errMsg = result.error || "";
      if (/cannot find|not found|no such user/i.test(errMsg)) {
        console.log(`[telegram-proxy] Entity not found (parsed) for scan ${scanId}`);
        return json({ ok: true, scanId, findings: [], artifacts_stored: 0, note: errMsg });
      }
      return json({ ok: false, scanId, error: errMsg || "Worker reported failure" }, 502);
    }

    // ── Store large payloads in scan_artifacts, keep summaries in findings ──
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const artifactInserts: Promise<unknown>[] = [];

    // New actions return { ok, findings, artifacts: { key: data } }
    // Legacy actions (username) return top-level messages/graph
    const artifacts = (result as any).artifacts || {};

    // ── Artifacts from result.artifacts.* (new actions: channel_scrape, activity_intel) ──
    const ARTIFACT_KEYS: Array<{ key: string; type: string }> = [
      { key: "channel_metadata", type: "channel_metadata" },
      { key: "channel_messages", type: "channel_messages" },
      { key: "linked_channels", type: "linked_channels" },
      { key: "activity_analysis", type: "activity_analysis" },
      { key: "risk_indicators", type: "risk_indicators" },
      { key: "relationship_graph", type: "relationship_graph" },
    ];

    for (const { key, type } of ARTIFACT_KEYS) {
      const data = artifacts[key];
      if (data && (typeof data === "object" || Array.isArray(data))) {
        const wrappedData = Array.isArray(data) ? { [key]: data } : data;
        artifactInserts.push(
          svc.from("scan_artifacts").insert({
            scan_id: scanId,
            source: "telegram",
            artifact_type: type,
            visibility: "private",
            data: wrappedData,
          }),
        );
        console.log(`[telegram-proxy] Storing artifact '${type}' for scan ${scanId}`);
      }
    }

    // ── Backward compat: legacy top-level messages/graph (username action) ──
    if (!artifacts || Object.keys(artifacts).length === 0) {
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        artifactInserts.push(
          svc.from("scan_artifacts").insert({
            scan_id: scanId,
            source: "telegram",
            artifact_type: "messages",
            visibility: "private",
            data: { messages: result.messages, action: typedAction },
          }),
        );
        console.log(`[telegram-proxy] Storing ${result.messages.length} messages (legacy) as artifact for scan ${scanId}`);
      }

      if (result.graph && typeof result.graph === "object") {
        artifactInserts.push(
          svc.from("scan_artifacts").insert({
            scan_id: scanId,
            source: "telegram",
            artifact_type: "graph",
            visibility: "private",
            data: result.graph,
          }),
        );
        console.log(`[telegram-proxy] Storing graph (legacy) as artifact for scan ${scanId}`);
      }
    }

    // Wait for artifact inserts
    if (artifactInserts.length > 0) {
      const artifactResults = await Promise.allSettled(artifactInserts);
      for (const r of artifactResults) {
        if (r.status === "rejected") {
          console.error("[telegram-proxy] Artifact insert failed:", r.reason);
        }
      }
    }

    // Strip large payloads from findings response (summaries only)
    const findings = (result.findings || []).map((f: any) => {
      if (f?.evidence?.messages) {
        return { ...f, evidence: { ...f.evidence, messages: undefined, message_count: f.evidence.messages.length } };
      }
      if (f?.evidence?.graph) {
        return { ...f, evidence: { ...f.evidence, graph: undefined, has_graph: true } };
      }
      return f;
    });

    console.log(`[telegram-proxy] Success [${typedAction}] scan ${scanId}: ${findings.length} findings, ${artifactInserts.length} artifacts`);

    return json({
      ok: true,
      scanId,
      action: typedAction,
      findings,
      artifacts_stored: artifactInserts.length,
    });
  } catch (err) {
    console.error("[telegram-proxy] Unhandled error:", err);
    return json({ ok: false, error: "Internal proxy error" }, 500);
  }
});
