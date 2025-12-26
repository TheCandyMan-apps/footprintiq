import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

/**
 * Shared rate limiting functionality for edge functions
 * Uses database-backed rate limiting with automatic cleanup
 */

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
}

/**
 * Check if request is rate limited
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<boolean> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    const windowSeconds = Math.floor(config.windowMs / 1000);

    // Get or create rate limit entry using correct schema columns
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("identifier", ip)
      .eq("identifier_type", "ip")
      .eq("endpoint", config.endpoint)
      .gte("window_start", windowStart.toISOString())
      .single();

    if (existing) {
      // Check if limit exceeded
      if (existing.current_count >= existing.limit_per_window) {
        console.log(`Rate limit exceeded for ${config.endpoint}:${ip}: ${existing.current_count}/${existing.limit_per_window}`);
        return false;
      }

      // Increment counter
      await supabase
        .from("rate_limits")
        .update({
          current_count: existing.current_count + 1,
          last_request_at: now.toISOString(),
          total_requests: (existing.total_requests || 0) + 1,
        })
        .eq("id", existing.id);

      return true;
    }

    // Create new rate limit entry with correct schema
    const { error } = await supabase
      .from("rate_limits")
      .insert({
        identifier: ip,
        identifier_type: "ip",
        endpoint: config.endpoint,
        current_count: 1,
        limit_per_window: config.maxRequests,
        window_seconds: windowSeconds,
        window_start: now.toISOString(),
        last_request_at: now.toISOString(),
        total_requests: 1,
        total_blocked: 0,
      });

    if (error) {
      console.error("Failed to create rate limit entry:", error);
      // On error, allow request (fail open)
      return true;
    }

    return true;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // On error, allow request (fail open)
    return true;
  }
}

/**
 * Extract IP from request
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Standard rate limit responses
 */
export const rateLimitResponse = (retryAfter: number = 300) => {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retry_after_seconds: retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
      },
    }
  );
};

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Analytics endpoints - 100 requests per hour
  analytics: {
    maxRequests: 100,
    windowMs: 3600000, // 1 hour
  },
  // Partner registration - 5 requests per day
  partnerRegister: {
    maxRequests: 5,
    windowMs: 86400000, // 24 hours
  },
  // API endpoints - 1000 requests per hour
  api: {
    maxRequests: 1000,
    windowMs: 3600000, // 1 hour
  },
  // Admin endpoints - 200 requests per hour
  admin: {
    maxRequests: 200,
    windowMs: 3600000, // 1 hour
  },
  // Cache manager - 500 requests per hour
  cache: {
    maxRequests: 500,
    windowMs: 3600000, // 1 hour
  },
  // Search/query endpoints - 50 requests per hour
  search: {
    maxRequests: 50,
    windowMs: 3600000, // 1 hour
  },
} as const;
