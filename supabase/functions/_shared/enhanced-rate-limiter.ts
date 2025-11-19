/**
 * Enhanced rate limiting with multiple strategies
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  identifier: string;
  identifierType: "user" | "ip" | "api_key";
  endpoint: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Tier-based rate limits
 */
export const RATE_LIMITS = {
  anonymous: {
    default: { maxRequests: 10, windowSeconds: 60 },
    scan: { maxRequests: 2, windowSeconds: 3600 }, // 2 per hour
  },
  free: {
    default: { maxRequests: 60, windowSeconds: 60 },
    scan: { maxRequests: 5, windowSeconds: 3600 }, // 5 per hour
    export: { maxRequests: 10, windowSeconds: 3600 },
  },
  basic: {
    default: { maxRequests: 120, windowSeconds: 60 },
    scan: { maxRequests: 20, windowSeconds: 3600 },
    export: { maxRequests: 50, windowSeconds: 3600 },
  },
  premium: {
    default: { maxRequests: 300, windowSeconds: 60 },
    scan: { maxRequests: 100, windowSeconds: 3600 },
    export: { maxRequests: 200, windowSeconds: 3600 },
  },
  enterprise: {
    default: { maxRequests: 1000, windowSeconds: 60 },
    scan: { maxRequests: 500, windowSeconds: 3600 },
    export: { maxRequests: 1000, windowSeconds: 3600 },
  },
  admin: {
    default: { maxRequests: 10000, windowSeconds: 60 },
    scan: { maxRequests: 10000, windowSeconds: 3600 },
    export: { maxRequests: 10000, windowSeconds: 3600 },
  },
};

/**
 * Get rate limit configuration for user tier
 */
export function getRateLimitConfig(
  tier: string,
  endpoint: string
): { maxRequests: number; windowSeconds: number } {
  const tierLimits = RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  
  // Determine endpoint type
  if (endpoint.includes("scan") || endpoint.includes("osint")) {
    return tierLimits.scan;
  } else if (endpoint.includes("export") && "export" in tierLimits) {
    return (tierLimits as any).export;
  }
  
  return tierLimits.default;
}

/**
 * Check rate limit using Supabase rate_limits table
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date();

  try {
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("identifier", config.identifier)
      .eq("identifier_type", config.identifierType)
      .eq("endpoint", config.endpoint)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[rate-limiter] Error fetching rate limit:", fetchError);
      // Fail open - allow request if we can't check limits
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
      };
    }

    // If no existing record, create one
    if (!existing) {
      await supabase.from("rate_limits").insert({
        identifier: config.identifier,
        identifier_type: config.identifierType,
        endpoint: config.endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        window_seconds: config.windowSeconds,
        max_requests: config.maxRequests,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
      };
    }

    // Check if window has expired
    const windowStart = new Date(existing.window_start);
    const windowEnd = new Date(
      windowStart.getTime() + existing.window_seconds * 1000
    );

    if (now > windowEnd) {
      // Reset window
      await supabase
        .from("rate_limits")
        .update({
          request_count: 1,
          window_start: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existing.id);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
      };
    }

    // Check if limit exceeded
    if (existing.request_count >= existing.max_requests) {
      const retryAfter = Math.ceil(
        (windowEnd.getTime() - now.getTime()) / 1000
      );
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowEnd,
        retryAfter,
      };
    }

    // Increment counter
    await supabase
      .from("rate_limits")
      .update({
        request_count: existing.request_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);

    return {
      allowed: true,
      remaining: existing.max_requests - existing.request_count - 1,
      resetAt: windowEnd,
    };
  } catch (error) {
    console.error("[rate-limiter] Unexpected error:", error);
    // Fail open
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
    };
  }
}

/**
 * Rate limit middleware for edge functions
 */
export async function rateLimitMiddleware(
  req: Request,
  options: {
    endpoint: string;
    userId?: string;
    tier?: string;
    customLimits?: { maxRequests: number; windowSeconds: number };
  }
): Promise<{ allowed: boolean; response?: Response; result?: RateLimitResult }> {
  const { endpoint, userId, tier = "free", customLimits } = options;

  // Get IP address
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Determine identifier
  const identifier = userId || ipAddress;
  const identifierType = userId ? "user" : "ip";

  // Get rate limit config
  const limits = customLimits || getRateLimitConfig(tier, endpoint);

  // Check rate limit
  const result = await checkRateLimit({
    identifier,
    identifierType,
    endpoint,
    maxRequests: limits.maxRequests,
    windowSeconds: limits.windowSeconds,
  });

  if (!result.allowed) {
    // Log rate limit violation
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("security_events").insert({
      event_type: "rate_limit",
      severity: "medium",
      user_id: userId,
      ip_address: ipAddress,
      user_agent: req.headers.get("user-agent"),
      endpoint,
      message: `Rate limit exceeded: ${limits.maxRequests} requests per ${limits.windowSeconds}s`,
      payload: { remaining: result.remaining, resetAt: result.resetAt },
    });

    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
          resetAt: result.resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limits.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetAt.toISOString(),
            "Retry-After": result.retryAfter?.toString() || "60",
            "Access-Control-Allow-Origin": "*",
          },
        }
      ),
    };
  }

  return { allowed: true, result };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  maxRequests: number
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", maxRequests.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetAt.toISOString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
