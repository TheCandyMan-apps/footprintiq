/**
 * Rate limiting utility using Supabase database
 */

import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and enforce rate limits
 */
export async function checkRateLimit(
  identifier: string,
  identifierType: 'user' | 'ip' | 'api_key',
  endpoint: string,
  config: RateLimitConfig = { maxRequests: 100, windowSeconds: 3600 }
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = new Date();
  
  // Get or create rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .eq('endpoint', endpoint)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[rate-limiter] Error fetching rate limit:', fetchError);
    // Fail open - allow request if we can't check limits
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowSeconds * 1000)
    };
  }

  // If no existing record, create one
  if (!existing) {
    await supabase.from('rate_limits').insert({
      identifier,
      identifier_type: identifierType,
      endpoint,
      request_count: 1,
      window_start: now.toISOString(),
      window_seconds: config.windowSeconds,
      max_requests: config.maxRequests
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now.getTime() + config.windowSeconds * 1000)
    };
  }

  // Check if window has expired
  const windowStart = new Date(existing.window_start);
  const windowEnd = new Date(windowStart.getTime() + existing.window_seconds * 1000);
  
  if (now > windowEnd) {
    // Reset window
    await supabase
      .from('rate_limits')
      .update({
        request_count: 1,
        window_start: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', existing.id);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now.getTime() + config.windowSeconds * 1000)
    };
  }

  // Check if limit exceeded
  if (existing.request_count >= existing.max_requests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: windowEnd
    };
  }

  // Increment counter
  await supabase
    .from('rate_limits')
    .update({
      request_count: existing.request_count + 1,
      updated_at: now.toISOString()
    })
    .eq('id', existing.id);

  return {
    allowed: true,
    remaining: existing.max_requests - existing.request_count - 1,
    resetAt: windowEnd
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

/**
 * Rate limit configuration by tier
 */
export const RATE_LIMITS = {
  free: {
    scans_per_hour: 5,
    scans_per_day: 10,
    api_calls_per_hour: 100
  },
  pro: {
    scans_per_hour: 50,
    scans_per_day: 200,
    api_calls_per_hour: 1000
  },
  enterprise: {
    scans_per_hour: 999999,
    scans_per_day: 999999,
    api_calls_per_hour: 999999
  }
};
