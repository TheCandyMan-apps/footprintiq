import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { allowedOrigin, ok, bad } from "../../_shared/secure.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_PATTERNS: Record<string, (u: string) => string> = {
  twitter: (u) => `https://x.com/${encodeURIComponent(u)}`,
  instagram: (u) => `https://www.instagram.com/${encodeURIComponent(u)}/`,
  github: (u) => `https://github.com/${encodeURIComponent(u)}`,
  reddit: (u) => `https://www.reddit.com/user/${encodeURIComponent(u)}`,
  linkedin: (u) => `https://www.linkedin.com/in/${encodeURIComponent(u)}`,
  tiktok: (u) => `https://www.tiktok.com/@${encodeURIComponent(u)}`,
  youtube: (u) => `https://www.youtube.com/@${encodeURIComponent(u)}`,
  twitch: (u) => `https://www.twitch.tv/${encodeURIComponent(u)}`,
};

async function checkPresence(url: string): Promise<"found" | "not_found" | "unknown"> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const r = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "FootprintIQ-Bot/1.0 (+https://footprintiq.app)"
      }
    });
    
    clearTimeout(timeoutId);
    
    if (r.status === 200) return "found";
    if (r.status === 404) return "not_found";
    if ([301, 302, 307, 308].includes(r.status)) return "found";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function rateLimit(ip: string): Promise<boolean> {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  
  if (!url || !token) {
    console.log("[presence] Upstash not configured, skipping rate limit");
    return true;
  }

  try {
    const key = `fiq:presence:${ip}`;
    
    // Increment counter
    await fetch(`${url}/incr/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Get current count
    const countRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const countData = await countRes.json();
    const count = Number(countData?.result ?? "0");
    
    // Set expiry on first request
    if (count === 1) {
      await fetch(`${url}/expire/${key}/300`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    // Allow 60 requests per 5 minutes
    return count <= 60;
  } catch (e) {
    console.error("[presence] Rate limit check failed:", e);
    return true; // Fail open
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") return bad(405, "method_not_allowed");
  if (!allowedOrigin(req)) return bad(403, "forbidden");

  // Get IP for rate limiting
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  
  if (!(await rateLimit(ip))) {
    console.log(`[presence] Rate limited: ${ip}`);
    return bad(429, "rate_limited");
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad(400, "invalid_json");
  }

  const username = (body?.username ?? "").trim();
  const sites = (body?.sites ?? ["twitter", "instagram", "github"]) as string[];

  if (!username || typeof username !== "string") {
    return bad(400, "invalid_username");
  }

  // Validate and limit sites
  const validSites = sites
    .filter(s => SITE_PATTERNS[s])
    .slice(0, 10);

  console.log(`[presence] Checking ${username} on ${validSites.length} sites`);

  const tasks = validSites.map(async (site) => {
    const url = SITE_PATTERNS[site](username);
    const status = await checkPresence(url);
    return { site, url, status };
  });

  const results = await Promise.all(tasks);
  console.log(`[presence] Completed checks for ${username}`);

  return ok({ results });
});
