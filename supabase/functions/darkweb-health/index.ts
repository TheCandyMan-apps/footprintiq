import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APIFY_BASE_URL = "https://api.apify.com/v2";
const DARKWEB_ACTOR_ID = "epctex/darkweb-scraper";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const checks: Record<string, { status: string; message?: string; latencyMs?: number }> = {};

  try {
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    
    // Check 1: Token exists
    if (!apifyToken) {
      checks.token = { status: "error", message: "APIFY_API_TOKEN not configured" };
    } else {
      checks.token = { status: "ok", message: "Token configured" };
    }

    // Check 2: Validate token by fetching user info
    if (apifyToken) {
      const tokenCheckStart = Date.now();
      try {
        const userResponse = await fetch(`${APIFY_BASE_URL}/users/me?token=${apifyToken}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          checks.tokenValid = {
            status: "ok",
            message: `Authenticated as: ${userData.data?.username || "unknown"}`,
            latencyMs: Date.now() - tokenCheckStart,
          };
        } else {
          checks.tokenValid = {
            status: "error",
            message: `Token validation failed: ${userResponse.status}`,
            latencyMs: Date.now() - tokenCheckStart,
          };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        checks.tokenValid = {
          status: "error",
          message: `Token validation error: ${errMsg}`,
          latencyMs: Date.now() - tokenCheckStart,
        };
      }
    }

    // Check 3: Verify darkweb-scraper actor is accessible
    if (apifyToken) {
      const actorCheckStart = Date.now();
      try {
        const actorResponse = await fetch(
          `${APIFY_BASE_URL}/acts/${encodeURIComponent(DARKWEB_ACTOR_ID)}?token=${apifyToken}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (actorResponse.ok) {
          const actorData = await actorResponse.json();
          checks.actor = {
            status: "ok",
            message: `Actor found: ${actorData.data?.name || DARKWEB_ACTOR_ID}`,
            latencyMs: Date.now() - actorCheckStart,
          };
        } else if (actorResponse.status === 404) {
          checks.actor = {
            status: "error",
            message: `Actor not found: ${DARKWEB_ACTOR_ID}`,
            latencyMs: Date.now() - actorCheckStart,
          };
        } else {
          checks.actor = {
            status: "error",
            message: `Actor check failed: ${actorResponse.status}`,
            latencyMs: Date.now() - actorCheckStart,
          };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        checks.actor = {
          status: "error",
          message: `Actor check error: ${errMsg}`,
          latencyMs: Date.now() - actorCheckStart,
        };
      }
    }

    // Check 4: Verify we have recent runs (optional insight)
    if (apifyToken) {
      const runsCheckStart = Date.now();
      try {
        const runsResponse = await fetch(
          `${APIFY_BASE_URL}/acts/${encodeURIComponent(DARKWEB_ACTOR_ID)}/runs?token=${apifyToken}&limit=5`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (runsResponse.ok) {
          const runsData = await runsResponse.json();
          const runCount = runsData.data?.items?.length || 0;
          const lastRun = runsData.data?.items?.[0];
          
          checks.recentRuns = {
            status: runCount > 0 ? "ok" : "warning",
            message: runCount > 0 
              ? `${runCount} recent runs. Last: ${lastRun?.status} at ${lastRun?.finishedAt || lastRun?.startedAt}`
              : "No recent runs found",
            latencyMs: Date.now() - runsCheckStart,
          };
        } else {
          checks.recentRuns = {
            status: "warning",
            message: `Could not fetch runs: ${runsResponse.status}`,
            latencyMs: Date.now() - runsCheckStart,
          };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        checks.recentRuns = {
          status: "warning",
          message: `Runs check error: ${errMsg}`,
          latencyMs: Date.now() - runsCheckStart,
        };
      }
    }

    // Determine overall health
    const hasErrors = Object.values(checks).some((c) => c.status === "error");
    const hasWarnings = Object.values(checks).some((c) => c.status === "warning");
    
    const overallStatus = hasErrors ? "unhealthy" : hasWarnings ? "degraded" : "healthy";

    const response = {
      status: overallStatus,
      service: "darkweb-monitoring",
      actor: DARKWEB_ACTOR_ID,
      timestamp: new Date().toISOString(),
      totalLatencyMs: Date.now() - startTime,
      checks,
    };

    console.log(`🏥 Dark Web Health Check: ${overallStatus}`, JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response, null, 2), {
      status: overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Health check failed:", error);
    
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        service: "darkweb-monitoring",
        error: errMsg,
        timestamp: new Date().toISOString(),
        totalLatencyMs: Date.now() - startTime,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
