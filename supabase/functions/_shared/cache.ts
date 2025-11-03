/**
 * Upstash Redis cache utility for Edge Functions
 */

const sanitizeEnv = (s?: string) => (s ?? '').trim().replace(/^['"]+|['"]+$/g, '');
const UPSTASH_URL = sanitizeEnv(Deno.env.get('UPSTASH_REDIS_REST_URL')).replace(/\/+$/,'');
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
 * Wrap a function call with caching
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    console.log(`[cache] HIT: ${key}`);
    return cached;
  }

  console.log(`[cache] MISS: ${key}`);
  
  // Execute function
  const result = await fn();
  
  // Store in cache
  await cacheSet(key, result, options);
  
  return result;
}
