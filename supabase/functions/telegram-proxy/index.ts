/**
 * telegram-proxy – Supabase Edge Function
 *
 * Secure proxy that allows n8n Cloud to trigger Telegram OSINT checks
 * against a *private* Google Cloud Run `telegram-worker` service.
 *
 * ──────────────────────────────────────────────────────────────────
 * n8n INTEGRATION INSTRUCTIONS
 * ──────────────────────────────────────────────────────────────────
 * URL:     https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/telegram-proxy
 * Method:  POST
 * Headers:
 *   Content-Type: application/json
 *   x-n8n-key:    <N8N_GATEWAY_KEY secret value>
 *
 * Body (username action):
 *   {
 *     "action":      "username",
 *     "username":    "target_username",
 *     "scanId":      "<uuid>",
 *     "workspaceId": "<uuid>",
 *     "userId":      "<uuid>",
 *     "tier":        "free"
 *   }
 *
 * Body (phone_presence action – Pro+ only):
 *   {
 *     "action":           "phone_presence",
 *     "phoneE164":        "+447700900000",
 *     "consentConfirmed": true,
 *     "lawfulBasis":      "legitimate_interest",
 *     "scanId":           "<uuid>",
 *     "workspaceId":      "<uuid>",
 *     "userId":           "<uuid>",
 *     "tier":             "pro"
 *   }
 * ──────────────────────────────────────────────────────────────────
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-n8n-key",
};

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
    // ── Auth: shared n8n gateway key ──
    const gatewayKey = Deno.env.get("N8N_GATEWAY_KEY");
    const providedKey = req.headers.get("x-n8n-key");

    if (!gatewayKey || !providedKey || providedKey !== gatewayKey) {
      return json({ ok: false, error: "Forbidden – invalid x-n8n-key" }, 403);
    }

    // ── Parse & validate body ──
    const body = await req.json();
    const { action, username, phoneE164, consentConfirmed, lawfulBasis, scanId, workspaceId, userId, tier } = body;

    // Required for all actions
    if (!scanId || !workspaceId || !userId || !tier) {
      return json({ ok: false, error: "Missing required fields: scanId, workspaceId, userId, tier" }, 400);
    }

    if (!action || !["username", "phone_presence"].includes(action)) {
      return json({ ok: false, error: 'Invalid action. Must be "username" or "phone_presence"' }, 400);
    }

    // Action-specific validation
    if (action === "username") {
      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return json({ ok: false, error: "username is required for action=username" }, 400);
      }
    }

    if (action === "phone_presence") {
      if (!phoneE164 || typeof phoneE164 !== "string" || !/^\+[1-9]\d{1,14}$/.test(phoneE164)) {
        return json({ ok: false, error: "Valid E.164 phoneE164 is required for action=phone_presence" }, 400);
      }
      if (consentConfirmed !== true) {
        return json({ ok: false, error: "consentConfirmed must be true for phone_presence" }, 400);
      }
      if (tier !== "pro" && tier !== "business" && tier !== "enterprise") {
        return json({ ok: false, error: "phone_presence requires Pro tier or above" }, 400);
      }
    }

    // ── Build Cloud Run request ──
    const workerUrl = Deno.env.get("TELEGRAM_WORKER_URL");
    const workerKey = Deno.env.get("TELEGRAM_WORKER_KEY");

    if (!workerUrl) {
      return json({ ok: false, error: "TELEGRAM_WORKER_URL not configured" }, 500);
    }

    const path = action === "username" ? "/telegram/username" : "/telegram/phone-presence";
    const targetUrl = `${workerUrl.replace(/\/$/, "")}${path}`;

    // Build worker payload
    const workerPayload: Record<string, unknown> = {
      scanId,
      workspaceId,
      userId,
      tier,
    };

    if (action === "username") {
      workerPayload.username = username.trim();
    } else {
      workerPayload.phoneE164 = phoneE164;
      workerPayload.consentConfirmed = true;
      workerPayload.lawfulBasis = lawfulBasis || "legitimate_interest";
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

    if (!workerRes.ok) {
      console.error(`[telegram-proxy] Worker returned ${workerRes.status}: ${workerBody}`);
      return json({
        ok: false,
        scanId,
        error: `Worker returned ${workerRes.status}`,
        details: workerBody.substring(0, 500),
      }, 502);
    }

    // ── Parse and return findings ──
    let result: { ok: boolean; findings?: unknown[]; error?: string };
    try {
      result = JSON.parse(workerBody);
    } catch {
      return json({ ok: false, scanId, error: "Worker returned invalid JSON" }, 502);
    }

    if (!result.ok) {
      return json({ ok: false, scanId, error: result.error || "Worker reported failure" }, 502);
    }

    console.log(`[telegram-proxy] Success for scan ${scanId}: ${(result.findings || []).length} findings`);

    return json({
      ok: true,
      scanId,
      findings: result.findings || [],
    });
  } catch (err) {
    console.error("[telegram-proxy] Unhandled error:", err);
    return json({ ok: false, error: "Internal proxy error" }, 500);
  }
});
