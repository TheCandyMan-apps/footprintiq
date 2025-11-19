/**
 * Rate Limiting Utilities for Edge Functions
 * Provides reusable rate limiting checks for workspaces and IPs
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetAt?: string;
  message?: string;
}

/**
 * Check workspace scan rate limit
 * Returns true if scan is allowed, false if limit exceeded
 */
export async function checkWorkspaceScanLimit(
  workspaceId: string,
  rateType: 'scan_hourly' | 'scan_daily' = 'scan_hourly'
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data, error } = await supabase.rpc('check_workspace_scan_limit', {
      _workspace_id: workspaceId,
      _rate_type: rateType,
    });

    if (error) throw error;

    if (!data) {
      // Get current rate limit info for response
      const { data: limit } = await supabase
        .from('workspace_rate_limits')
        .select('current_count, max_allowed, window_start, window_size_seconds')
        .eq('workspace_id', workspaceId)
        .eq('rate_limit_type', rateType)
        .single();

      if (limit) {
        const resetAt = new Date(
          new Date(limit.window_start).getTime() + limit.window_size_seconds * 1000
        );
        
        return {
          allowed: false,
          remaining: 0,
          resetAt: resetAt.toISOString(),
          message: `Rate limit exceeded. Resets at ${resetAt.toLocaleTimeString()}`,
        };
      }

      return {
        allowed: false,
        message: 'Rate limit exceeded',
      };
    }

    return {
      allowed: true,
    };
  } catch (err) {
    console.error('Rate limit check failed:', err);
    // Fail open - allow request if rate limit check fails
    return {
      allowed: true,
      message: 'Rate limit check failed, allowing request',
    };
  }
}

/**
 * Check IP-based rate limit for authentication endpoints
 */
export async function checkIpRateLimit(
  ipAddress: string,
  endpoint: 'signup' | 'login' | 'password_reset',
  maxAttempts: number = 5
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data, error } = await supabase.rpc('check_ip_rate_limit', {
      _ip_address: ipAddress,
      _endpoint: endpoint,
      _max_attempts: maxAttempts,
    });

    if (error) throw error;

    if (!data) {
      // Get blocked info
      const { data: limit } = await supabase
        .from('ip_rate_limits')
        .select('blocked_until, attempt_count, max_attempts')
        .eq('ip_address', ipAddress)
        .eq('endpoint', endpoint)
        .single();

      if (limit?.blocked_until) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: limit.blocked_until,
          message: `Too many attempts. Try again after ${new Date(limit.blocked_until).toLocaleTimeString()}`,
        };
      }

      return {
        allowed: false,
        remaining: 0,
        message: 'Rate limit exceeded',
      };
    }

    return {
      allowed: true,
    };
  } catch (err) {
    console.error('IP rate limit check failed:', err);
    // Fail open for non-critical errors
    return {
      allowed: true,
      message: 'Rate limit check failed, allowing request',
    };
  }
}

/**
 * Extract client IP from request
 */
export function getClientIp(req: Request): string {
  // Check various headers for IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a placeholder if no IP found
  return '0.0.0.0';
}
