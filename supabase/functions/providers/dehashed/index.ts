import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { allowedOrigin, ok, bad } from "../../_shared/secure.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") return bad(405, "method_not_allowed");
  if (!allowedOrigin(req)) return bad(403, "forbidden");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad(400, "invalid_json");
  }

  const target = (body?.target ?? "").trim();
  const queryType = body?.queryType ?? "email";
  const limit = Math.min(100, body?.limit ?? 25);

  if (!target || typeof target !== "string") {
    return bad(400, "invalid_target");
  }

  const apiKey = Deno.env.get("DEHASHED_API_KEY");
  const apiUser = Deno.env.get("DEHASHED_API_KEY_USERNAME");

  if (!apiKey || !apiUser) {
    console.error("[dehashed] DEHASHED_API_KEY or DEHASHED_API_KEY_USERNAME not configured");
    return bad(500, "server_misconfigured");
  }

  const t0 = Date.now();
  console.log(`[dehashed] Searching ${queryType}:${target}`);

  try {
    const auth = "Basic " + btoa(`${apiUser}:${apiKey}`);
    const qs = new URLSearchParams({
      query: `${queryType}:${target}`,
      page: "1",
      size: String(limit)
    });

    const resp = await fetch(`https://api.dehashed.com/search?${qs.toString()}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": auth
      }
    });

    const latency = Date.now() - t0;

    if (resp.status === 404) {
      console.log(`[dehashed] No results in ${latency}ms`);
      return ok({
        findings: [{
          provider: "dehashed",
          kind: "breach.none",
          severity: "low",
          confidence: 0.9,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: "no_results"
        }]
      });
    }

    if (!resp.ok) {
      console.error(`[dehashed] HTTP ${resp.status}`);
      return ok({
        findings: [{
          provider: "dehashed",
          kind: "breach.none",
          severity: "low",
          confidence: 0.4,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: `http_${resp.status}`
        }]
      });
    }

    const data = await resp.json() as {
      entries?: Array<Record<string, unknown>>;
      total?: number;
    };

    const entries = (data.entries ?? []).slice(0, limit);
    console.log(`[dehashed] Found ${entries.length} entries in ${latency}ms`);

    if (!entries.length) {
      return ok({
        findings: [{
          provider: "dehashed",
          kind: "breach.none",
          severity: "low",
          confidence: 0.9,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: "no_results"
        }]
      });
    }

    const evidence = entries.map((e, i) => {
      const src = String(e["source"] ?? "n/a");
      const leak = String(e["database_name"] ?? e["database"] ?? "unknown");
      const date = String(e["obtained_date"] ?? e["date"] ?? "n/a");
      return {
        key: `${i + 1}:${src}`,
        value: `leak=${leak}; date=${date}`
      };
    });

    return ok({
      findings: [{
        provider: "dehashed",
        kind: "breach.hit",
        severity: "high",
        confidence: Math.min(0.95, 0.6 + entries.length * 0.02),
        observedAt: new Date().toISOString(),
        latencyMs: latency,
        reason: `${entries.length}_records`,
        evidence
      }]
    });

  } catch (e) {
    const latency = Date.now() - t0;
    console.error(`[dehashed] Exception:`, e);
    return ok({
      findings: [{
        provider: "dehashed",
        kind: "breach.none",
        severity: "low",
        confidence: 0.3,
        observedAt: new Date().toISOString(),
        latencyMs: latency,
        reason: "exception",
        evidence: [{ key: "error", value: String(e).slice(0, 200) }]
      }]
    });
  }
});
