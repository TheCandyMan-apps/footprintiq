import { Finding } from "@/lib/ufm";
import { checkSpend, recordCall } from "./costs";
import { ensureAllowed } from "./policy";
import { getProviderMeta } from "./registry";

interface CallOptions {
  ttlMs?: number;
  timeoutMs?: number;
  retries?: number;
}

interface CircuitState {
  failures: number;
  lastFailure: number;
  cooldownUntil: number;
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

// Circuit breaker state
const circuits = new Map<string, CircuitState>();
const CIRCUIT_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 60_000;

// Rate limiting (token bucket per provider)
const rateLimits = new Map<string, RateLimitBucket>();
const DEFAULT_RATE_LIMIT = parseInt(import.meta.env.VITE_PROVIDER_RATE_LIMIT_PER_MIN || "30");
const REFILL_INTERVAL_MS = 60_000;

// Cache
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCacheKey(providerId: string, params: string): string {
  return `${providerId}:${params}`;
}

function checkCircuit(providerId: string): boolean {
  const state = circuits.get(providerId);
  if (!state) return true;
  
  const now = Date.now();
  if (state.cooldownUntil > now) {
    console.warn(`[runtime] Circuit breaker OPEN for ${providerId} (cooldown until ${new Date(state.cooldownUntil).toISOString()})`);
    return false;
  }
  
  // Reset if cooldown expired
  if (state.failures >= CIRCUIT_THRESHOLD) {
    circuits.delete(providerId);
  }
  return true;
}

function recordFailure(providerId: string): void {
  const state = circuits.get(providerId) || { failures: 0, lastFailure: 0, cooldownUntil: 0 };
  state.failures += 1;
  state.lastFailure = Date.now();
  
  if (state.failures >= CIRCUIT_THRESHOLD) {
    state.cooldownUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    console.error(`[runtime] Circuit breaker OPENED for ${providerId} after ${state.failures} failures`);
  }
  
  circuits.set(providerId, state);
}

function recordSuccess(providerId: string): void {
  const state = circuits.get(providerId);
  if (state && state.failures > 0) {
    state.failures = Math.max(0, state.failures - 1);
    circuits.set(providerId, state);
  }
}

function checkRateLimit(providerId: string): boolean {
  const now = Date.now();
  let bucket = rateLimits.get(providerId);
  
  if (!bucket) {
    bucket = { tokens: DEFAULT_RATE_LIMIT, lastRefill: now };
    rateLimits.set(providerId, bucket);
  }
  
  // Refill tokens
  const timeSinceRefill = now - bucket.lastRefill;
  if (timeSinceRefill >= REFILL_INTERVAL_MS) {
    bucket.tokens = DEFAULT_RATE_LIMIT;
    bucket.lastRefill = now;
  }
  
  if (bucket.tokens <= 0) {
    console.warn(`[runtime] Rate limit exceeded for ${providerId} (0 tokens)`);
    return false;
  }
  
  bucket.tokens -= 1;
  return true;
}

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function wrapCall<T>(
  providerId: string,
  fn: () => Promise<T>,
  options: CallOptions = {}
): Promise<T> {
  const meta = getProviderMeta(providerId);
  const {
    ttlMs = meta?.ttlMs || 3600_000,
    timeoutMs = parseInt(import.meta.env.VITE_PROVIDER_GLOBAL_TIMEOUT_MS || "12000"),
    retries = 1,
  } = options;
  
  const cacheKey = getCacheKey(providerId, JSON.stringify(fn.toString().slice(0, 100)));
  
  // Check cache
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[runtime] Cache HIT for ${providerId}`);
    return cached;
  }
  
  // Check circuit breaker
  if (!checkCircuit(providerId)) {
    throw new Error(`Circuit breaker open for ${providerId}`);
  }
  
  // Check rate limit
  if (!checkRateLimit(providerId)) {
    throw new Error(`Rate limit exceeded for ${providerId}`);
  }
  
  // Check policy gates
  const policyCheck = await ensureAllowed(providerId);
  if (!policyCheck.allowed) {
    throw new Error(`Provider ${providerId} gated by policy: ${policyCheck.reason}`);
  }
  
  // Check quotas and budgets
  const spendCheck = await checkSpend(providerId, meta?.unitCost || 0.001);
  if (!spendCheck.allowed) {
    throw new Error(`Provider ${providerId} blocked: ${spendCheck.reason}`);
  }
  
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
      
      const latencyMs = Date.now() - startTime;
      
      // Success
      recordSuccess(providerId);
      await recordCall(providerId, true, latencyMs);
      
      // Cache result
      setCache(cacheKey, result, ttlMs);
      
      console.log(`[runtime] ${providerId} completed in ${latencyMs}ms`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      const latencyMs = Date.now() - startTime;
      
      console.error(`[runtime] ${providerId} attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < retries) {
        // Exponential backoff with jitter
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        const jitter = Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffMs + jitter));
      } else {
        // Final failure
        recordFailure(providerId);
        await recordCall(providerId, false, latencyMs);
      }
    }
  }
  
  throw lastError || new Error(`Provider ${providerId} failed after ${retries + 1} attempts`);
}

export function createSyntheticFinding(
  providerId: string,
  reason: string,
  severity: "info" | "low" = "info"
): Finding {
  const meta = getProviderMeta(providerId);
  
  return {
    id: `${providerId}_synthetic_${Date.now()}`,
    type: "identity" as const,
    title: `${meta?.title || providerId} - ${reason}`,
    description: `Provider not available: ${reason}`,
    severity,
    confidence: 0,
    provider: meta?.title || providerId,
    providerCategory: "System",
    evidence: [
      { key: "Status", value: reason },
      { key: "Provider", value: providerId },
    ],
    impact: "No data retrieved from this provider",
    remediation: [],
    tags: ["synthetic", "system"],
    observedAt: new Date().toISOString(),
  };
}

export function getCircuitStatus(): Record<string, { open: boolean; failures: number; cooldownUntil?: number }> {
  const status: Record<string, any> = {};
  
  circuits.forEach((state, providerId) => {
    status[providerId] = {
      open: state.cooldownUntil > Date.now(),
      failures: state.failures,
      cooldownUntil: state.cooldownUntil > Date.now() ? state.cooldownUntil : undefined,
    };
  });
  
  return status;
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
