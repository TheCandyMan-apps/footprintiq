/**
 * telegram-explore – Supabase Edge Function
 *
 * Lightweight proxy for the Telegram Explore (Beta) UI.
 * Authenticates regular users via Supabase JWT, checks workspace
 * membership, and forwards explore requests to the Cloud Run worker.
 *
 * Unlike telegram-proxy (which is for n8n/admin), this is called
 * directly by the frontend for interactive exploration.
 *
 * Supported actions:
 *   resolve   – Resolve a username/channel to entity info
 *   recent    – Fetch recent messages from a channel/group
 *   search    – Search messages within a channel/group
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── GCP OIDC auth (same pattern as telegram-proxy) ──

async function getGoogleIdToken(audience: string): Promise<string> {
  const email = Deno.env.get("GCP_SA_EMAIL")!;
  const rawKey = Deno.env.get("GCP_SA_PRIVATE_KEY")!;

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

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed (${tokenRes.status})`);
  }

  const { access_token } = await tokenRes.json();

  const idTokenRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${email}:generateIdToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audience, includeEmail: true }),
    },
  );

  if (!idTokenRes.ok) {
    throw new Error(`IAM generateIdToken failed (${idTokenRes.status})`);
  }

  const { token } = await idTokenRes.json();
  return token;
}

// ── Main handler ──

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: require valid Supabase JWT ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ ok: false, error: "Authentication required" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !userData?.user) {
      return json({ ok: false, error: "Invalid session" }, 401);
    }

    const userId = userData.user.id;

    // Get user tier + workspace
    const svc = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: roleData } = await svc
      .from("user_roles")
      .select("subscription_tier")
      .eq("user_id", userId)
      .single();

    const tier = roleData?.subscription_tier || "free";

    // Get user's workspace
    const { data: wsMember } = await svc
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    const workspaceId = wsMember?.workspace_id || "";

    // ── Parse body ──
    const body = await req.json();
    const { action, target, offset_id, query, message_limit } = body;

    if (!target || typeof target !== "string" || target.trim().length === 0) {
      return json({ ok: false, error: "target is required" }, 400);
    }

    const cleanTarget = target.trim().replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");

    const workerUrl = Deno.env.get("TELEGRAM_WORKER_URL");
    const workerKey = Deno.env.get("OSINT_WORKER_TOKEN");

    if (!workerUrl) {
      return json({ ok: false, error: "Worker not configured" }, 500);
    }

    let idToken: string;
    try {
      idToken = await getGoogleIdToken(workerUrl);
    } catch (err) {
      console.error("[telegram-explore] GCP auth failed:", err);
      return json({ ok: false, error: "Backend auth failed" }, 500);
    }

    const workerHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
    if (workerKey) {
      workerHeaders["X-Worker-Key"] = workerKey;
    }

    // ── Route action ──
    if (action === "resolve") {
      // Call username endpoint for entity resolution
      const targetUrl = `${workerUrl.replace(/\/$/, "")}/telegram/username`;
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: workerHeaders,
        body: JSON.stringify({
          username: cleanTarget,
          channel: cleanTarget,
          scanId: "explore",
          workspaceId,
          userId,
          tier,
          action: "username",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        const isNotFound = res.status === 404 || /not found|cannot find/i.test(text);
        if (isNotFound) {
          return json({ ok: true, action: "resolve", data: null, not_found: true });
        }
        return json({ ok: false, error: `Worker error ${res.status}` }, 502);
      }

      try {
        const parsed = JSON.parse(text);
        return json({ ok: true, action: "resolve", data: parsed });
      } catch {
        return json({ ok: false, error: "Invalid worker response" }, 502);
      }
    }

    if (action === "recent") {
      const targetUrl = `${workerUrl.replace(/\/$/, "")}/telegram/channel-scrape`;
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: workerHeaders,
        body: JSON.stringify({
          channel: cleanTarget,
          messageLimit: Math.min(message_limit || 25, 100),
          offset_id: offset_id || undefined,
          scanId: "explore",
          workspaceId,
          userId,
          tier,
          action: "channel_scrape",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        return json({ ok: false, error: `Worker error ${res.status}` }, 502);
      }

      try {
        const parsed = JSON.parse(text);
        return json({ ok: true, action: "recent", data: parsed });
      } catch {
        return json({ ok: false, error: "Invalid worker response" }, 502);
      }
    }

    if (action === "search") {
      if (!query || typeof query !== "string") {
        return json({ ok: false, error: "query is required for search" }, 400);
      }

      const targetUrl = `${workerUrl.replace(/\/$/, "")}/telegram/channel-scrape`;
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: workerHeaders,
        body: JSON.stringify({
          channel: cleanTarget,
          messageLimit: Math.min(message_limit || 50, 100),
          search_query: query,
          scanId: "explore",
          workspaceId,
          userId,
          tier,
          action: "channel_scrape",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        return json({ ok: false, error: `Worker error ${res.status}` }, 502);
      }

      try {
        const parsed = JSON.parse(text);
        return json({ ok: true, action: "search", data: parsed });
      } catch {
        return json({ ok: false, error: "Invalid worker response" }, 502);
      }
    }

    return json({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    console.error("[telegram-explore] Unhandled error:", err);
    return json({ ok: false, error: "Internal error" }, 500);
  }
});
