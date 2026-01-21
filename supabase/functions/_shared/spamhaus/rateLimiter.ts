/**
 * Spamhaus-specific Rate Limiter
 * Enforces Allowable Query Volume (AQV) constraints
 * Uses fixed window limiting with per-user and per-IP tracking
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface SpamhausRateLimitConfig {
  queriesPerSecond: number;   // Default: 1 (conservative)
  queriesPerMinute: number;   // Default: 30
  queriesPerHour: number;     // Default: 500
  queriesPerDay: number;      // Default: 5000
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // seconds until retry allowed
  limit: number;
  window: string;
}

const DEFAULT_CONFIG: SpamhausRateLimitConfig = {
  queriesPerSecond: 1,
  queriesPerMinute: 30,
  queriesPerHour: 500,
  queriesPerDay: 5000,
};

/**
 * Get current window key for rate limiting
 */
function getWindowKey(windowSeconds: number): string {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds;
  return `${windowStart}`;
}

/**
 * Check Spamhaus rate limit for a given identifier
 */
export async function checkSpamhausRateLimit(
  identifier: string,
  identifierType: 'user' | 'ip' | 'global',
  config: Partial<SpamhausRateLimitConfig> = {}
): Promise<RateLimitResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[SpamhausRateLimiter] Missing Supabase credentials');
    // Fail open but log the issue
    return { allowed: true, remaining: 1, limit: 1, window: 'unknown' };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check multiple windows (per-second, per-minute, per-hour, per-day)
  const windows = [
    { seconds: 1, limit: finalConfig.queriesPerSecond, name: 'second' },
    { seconds: 60, limit: finalConfig.queriesPerMinute, name: 'minute' },
    { seconds: 3600, limit: finalConfig.queriesPerHour, name: 'hour' },
    { seconds: 86400, limit: finalConfig.queriesPerDay, name: 'day' },
  ];
  
  for (const window of windows) {
    const windowKey = getWindowKey(window.seconds);
    const cacheKey = `spamhaus_rl:${identifierType}:${identifier}:${window.name}:${windowKey}`;
    
    try {
      // Check existing count
      const { data: existing } = await supabase
        .from('cache_entries')
        .select('cache_value, hit_count')
        .eq('cache_key', cacheKey)
        .single();
      
      const currentCount = existing?.hit_count || 0;
      
      if (currentCount >= window.limit) {
        // Calculate retry time
        const windowStart = parseInt(windowKey);
        const windowEnd = windowStart + window.seconds;
        const retryAfter = Math.max(1, windowEnd - Math.floor(Date.now() / 1000));
        
        console.log(`[SpamhausRateLimiter] Rate limit exceeded for ${identifierType}:${identifier} (${window.name})`);
        
        return {
          allowed: false,
          remaining: 0,
          retryAfter,
          limit: window.limit,
          window: window.name,
        };
      }
      
      // Increment counter
      if (existing) {
        await supabase
          .from('cache_entries')
          .update({ 
            hit_count: currentCount + 1,
            last_accessed_at: new Date().toISOString(),
          })
          .eq('cache_key', cacheKey);
      } else {
        // Create new entry
        const expiresAt = new Date(Date.now() + window.seconds * 1000).toISOString();
        await supabase
          .from('cache_entries')
          .insert({
            cache_key: cacheKey,
            cache_type: 'spamhaus_rate_limit',
            cache_value: { identifier, identifierType, window: window.name },
            hit_count: 1,
            ttl_seconds: window.seconds,
            expires_at: expiresAt,
          });
      }
    } catch (error) {
      console.error(`[SpamhausRateLimiter] Error checking ${window.name} window:`, error);
      // Continue to next window on error
    }
  }
  
  // All windows passed
  return {
    allowed: true,
    remaining: Math.min(
      finalConfig.queriesPerSecond - 1,
      finalConfig.queriesPerMinute - 1,
      finalConfig.queriesPerHour - 1,
      finalConfig.queriesPerDay - 1
    ),
    limit: finalConfig.queriesPerMinute,
    window: 'minute',
  };
}

/**
 * Get remaining quota for a given identifier
 */
export async function getSpamhausQuota(
  identifier: string,
  identifierType: 'user' | 'ip' | 'global',
  config: Partial<SpamhausRateLimitConfig> = {}
): Promise<{
  hourly: { used: number; limit: number; remaining: number };
  daily: { used: number; limit: number; remaining: number };
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      hourly: { used: 0, limit: finalConfig.queriesPerHour, remaining: finalConfig.queriesPerHour },
      daily: { used: 0, limit: finalConfig.queriesPerDay, remaining: finalConfig.queriesPerDay },
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const hourWindowKey = getWindowKey(3600);
  const dayWindowKey = getWindowKey(86400);
  
  const hourCacheKey = `spamhaus_rl:${identifierType}:${identifier}:hour:${hourWindowKey}`;
  const dayCacheKey = `spamhaus_rl:${identifierType}:${identifier}:day:${dayWindowKey}`;
  
  const [hourResult, dayResult] = await Promise.all([
    supabase.from('cache_entries').select('hit_count').eq('cache_key', hourCacheKey).single(),
    supabase.from('cache_entries').select('hit_count').eq('cache_key', dayCacheKey).single(),
  ]);
  
  const hourUsed = hourResult.data?.hit_count || 0;
  const dayUsed = dayResult.data?.hit_count || 0;
  
  return {
    hourly: {
      used: hourUsed,
      limit: finalConfig.queriesPerHour,
      remaining: Math.max(0, finalConfig.queriesPerHour - hourUsed),
    },
    daily: {
      used: dayUsed,
      limit: finalConfig.queriesPerDay,
      remaining: Math.max(0, finalConfig.queriesPerDay - dayUsed),
    },
  };
}

/**
 * Reset rate limit for testing/admin purposes
 */
export async function resetSpamhausRateLimit(
  identifier: string,
  identifierType: 'user' | 'ip' | 'global'
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    await supabase
      .from('cache_entries')
      .delete()
      .like('cache_key', `spamhaus_rl:${identifierType}:${identifier}:%`);
    
    console.log(`[SpamhausRateLimiter] Reset rate limits for ${identifierType}:${identifier}`);
    return true;
  } catch (error) {
    console.error('[SpamhausRateLimiter] Error resetting rate limits:', error);
    return false;
  }
}
