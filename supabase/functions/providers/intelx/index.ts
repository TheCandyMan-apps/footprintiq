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
  const limit = Math.min(100, body?.limit ?? 25);
  
  if (!target || typeof target !== "string") {
    return bad(400, "invalid_target");
  }

  const key = Deno.env.get("INTELX_API_KEY");
  if (!key) {
    console.error("[intelx] INTELX_API_KEY not configured");
    return bad(500, "server_misconfigured");
  }

  const t0 = Date.now();
  console.log(`[intelx] Searching for: ${target}`);

  try {
    // Start search job
    const jobRes = await fetch(
      `https://2.intelx.io/phonebook/search?k=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          term: target,
          maxresults: limit,
          media: 0,
          target: 2
        })
      }
    );

    if (!jobRes.ok) {
      const latency = Date.now() - t0;
      console.error(`[intelx] Job start failed: ${jobRes.status}`);
      return ok({
        findings: [{
          provider: "intelx",
          kind: "darkweb.none",
          severity: "low",
          confidence: 0.4,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: `http_${jobRes.status}`
        }]
      });
    }

    const { id } = await jobRes.json();
    console.log(`[intelx] Job ID: ${id}`);

    // Fetch results
    const resultsRes = await fetch(
      `https://2.intelx.io/phonebook/search/result?k=${encodeURIComponent(key)}&id=${encodeURIComponent(id)}&limit=${limit}`
    );

    const latency = Date.now() - t0;

    if (!resultsRes.ok) {
      console.error(`[intelx] Results fetch failed: ${resultsRes.status}`);
      return ok({
        findings: [{
          provider: "intelx",
          kind: "darkweb.none",
          severity: "low",
          confidence: 0.4,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: `http_${resultsRes.status}`
        }]
      });
    }

    const data = await resultsRes.json() as {
      records?: Array<{
        name?: string;
        systemid: string;
        type: number;
        date: string;
      }>;
    };

    const records = (data.records ?? []).slice(0, limit);
    console.log(`[intelx] Found ${records.length} records in ${latency}ms`);

    if (!records.length) {
      return ok({
        findings: [{
          provider: "intelx",
          kind: "darkweb.none",
          severity: "low",
          confidence: 0.9,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: "no_results"
        }]
      });
    }

    const evidence = records.map(r => ({
      key: r.systemid,
      value: `name=${r.name ?? "n/a"}; type=${r.type}; date=${r.date}`
    }));

    return ok({
      findings: [{
        provider: "intelx",
        kind: "darkweb.hit",
        severity: "high",
        confidence: Math.min(0.95, 0.6 + records.length * 0.02),
        observedAt: new Date().toISOString(),
        latencyMs: latency,
        reason: `${records.length}_records`,
        evidence
      }]
    });

  } catch (e) {
    const latency = Date.now() - t0;
    console.error(`[intelx] Exception:`, e);
    return ok({
      findings: [{
        provider: "intelx",
        kind: "darkweb.none",
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
