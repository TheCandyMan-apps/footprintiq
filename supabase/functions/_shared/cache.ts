/**
 * Upstash Redis cache utility for Edge Functions
 */

const sanitizeEnv = (s?: string) => {
  if (!s) return '';
  // Remove quotes, whitespace, and the variable name if present
  return s.trim()
    .replace(/^UPSTASH_REDIS_REST_(URL|TOKEN)=/, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '');
};

const UPSTASH_URL = sanitizeEnv(Deno.env.get('UPSTASH_REDIS_REST_URL'));
const UPSTASH_TOKEN = sanitizeEnv(Deno.env.get('UPSTASH_REDIS_REST_TOKEN'));


interface CacheOptions {
  ttlSeconds?: number;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn('[cache] Upstash not configured, skipping cache read');
    return null;
  }

  try {
    const response = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (error) {
    console.error('[cache] Get error:', error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn('[cache] Upstash not configured, skipping cache write');
    return false;
  }

  try {
    const ttl = options.ttlSeconds || 86400; // 24h default
    const stringValue = JSON.stringify(value);

    const response = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringValue)}/EX/${ttl}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[cache] Set error:', error);
    return false;
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return false;

  try {
    const response = await fetch(`${UPSTASH_URL}/del/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[cache] Delete error:', error);
    return false;
  }
}

/**
 * Check if a result is empty or contains only error responses
 * This prevents caching of:
 * - Empty arrays/objects
 * - API key errors (which would be stale after key is configured)
 * - Provider errors that should be retried
 */
function isEmptyOrErrorResult(result: unknown): boolean {
  if (result === null || result === undefined) {
    return true;
  }
  if (Array.isArray(result) && result.length === 0) {
    return true;
  }
  if (typeof result === 'object' && result !== null) {
    const obj = result as Record<string, unknown>;
    
    // Don't cache empty findings
    if ('findings' in obj && Array.isArray(obj.findings) && obj.findings.length === 0) {
      return true;
    }
    
    // Don't cache error responses (API key errors, etc.)
    if ('error' in obj || 'kind' in obj && obj.kind === 'provider_error') {
      console.warn('[cache] Detected error result, not caching');
      return true;
    }
    
    // Check for evidence containing error indicators
    if ('evidence' in obj && Array.isArray(obj.evidence)) {
      const hasApiError = (obj.evidence as Array<{key?: string; value?: string}>).some(
        e => e.key === 'error' || (e.value && typeof e.value === 'string' && 
          (e.value.includes('Invalid API key') || 
           e.value.includes('unauthorized') ||
           e.value.includes('401')))
      );
      if (hasApiError) {
        console.warn('[cache] Detected API error in evidence, not caching');
        return true;
      }
    }
    
    // Check meta for error status codes
    if ('meta' in obj && typeof obj.meta === 'object' && obj.meta !== null) {
      const meta = obj.meta as Record<string, unknown>;
      if (meta.status === 401 || meta.status === 403 || meta.apiError) {
        console.warn('[cache] Detected auth error in meta, not caching');
        return true;
      }
    }
  }
  return false;
}

/**
 * Wrap a function call with caching
 * NOTE: Empty results (empty arrays, empty findings) are NOT cached to prevent cache poisoning
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    // Validate cached result - don't return poisoned empty/error cache entries
    if (isEmptyOrErrorResult(cached)) {
      console.warn(`[cache] POISONED (empty/error result in cache, ignoring): ${key}`);
      // Delete the poisoned entry
      await cacheDelete(key);
    } else {
      console.log(`[cache] HIT: ${key}`);
      return cached;
    }
  }

  console.log(`[cache] MISS: ${key}`);
  
  // Execute function
  const result = await fn();
  
  // Don't cache empty or error results to prevent cache poisoning
  if (isEmptyOrErrorResult(result)) {
    console.warn(`[cache] SKIP (not caching empty/error result): ${key}`);
    return result;
  }
  
  // Store in cache
  console.log(`[cache] SET: ${key}`);
  await cacheSet(key, result, options);
  
  return result;
}
