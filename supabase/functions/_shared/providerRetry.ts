/**
 * Per-provider retry utility for scan orchestration
 * Provides retry with backoff at the individual provider level
 */

export interface ProviderRetryOptions {
  maxAttempts?: number;
  delays?: number[]; // Explicit delays: [2000, 4000, 6000]
  timeoutMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<Omit<ProviderRetryOptions, 'onRetry'>> = {
  maxAttempts: 2,
  delays: [2000, 4000], // 2s, 4s
  timeoutMs: 25000, // 25s per provider (leaves headroom for multiple providers)
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const message = (error?.message || String(error)).toLowerCase();
  const status = error?.status || error?.code;
  
  // Network/timeout errors
  if (error.name === 'AbortError') return true;
  if (message.includes('timeout')) return true;
  if (message.includes('network')) return true;
  if (message.includes('econnrefused')) return true;
  if (message.includes('fetch failed')) return true;
  if (message.includes('socket hang up')) return true;
  
  // HTTP status codes
  if (status) {
    // Retry on 5xx server errors and 429 rate limit
    if (status >= 500 || status === 429) return true;
    // Do NOT retry on 4xx client errors (except 429)
    if (status >= 400 && status < 500) return false;
  }
  
  // Default to non-retryable for unknown errors
  return false;
}

/**
 * Execute a provider call with retry logic
 */
export async function withProviderRetry<T>(
  providerId: string,
  fn: () => Promise<T>,
  options: ProviderRetryOptions = {}
): Promise<{ data: T | null; error: any; attempts: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);
    
    try {
      // Wrap function execution with timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => 
            reject(new Error(`Provider ${providerId} timed out after ${opts.timeoutMs}ms`))
          );
        })
      ]);
      
      clearTimeout(timeoutId);
      
      if (attempt > 1) {
        console.log(`[ProviderRetry] ${providerId} succeeded on attempt ${attempt}`);
      }
      
      return { data: result, error: null, attempts: attempt };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      const retryable = isRetryableError(error);
      
      console.warn(
        `[ProviderRetry] ${providerId} attempt ${attempt}/${opts.maxAttempts} failed:`,
        error?.message || error,
        retryable ? '(retryable)' : '(non-retryable)'
      );
      
      // If not retryable or last attempt, stop
      if (!retryable || attempt >= opts.maxAttempts) {
        break;
      }
      
      // Get delay for this attempt
      const delay = opts.delays[attempt - 1] || opts.delays[opts.delays.length - 1];
      
      opts.onRetry?.(attempt, error);
      
      console.log(`[ProviderRetry] ${providerId} waiting ${delay}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { data: null, error: lastError, attempts: opts.maxAttempts };
}

/**
 * Create a finding for provider errors (for graceful degradation)
 */
export function createProviderErrorFinding(
  providerId: string,
  error: any,
  target: string
): any {
  const now = new Date().toISOString();
  const message = error?.message || String(error);
  const isTimeout = message.toLowerCase().includes('timeout');
  
  return {
    provider: providerId,
    kind: isTimeout ? 'provider.timeout' : 'provider.error',
    severity: 'warning' as const,
    confidence: 0.5,
    observedAt: now,
    evidence: [
      { key: 'error', value: message.slice(0, 200) },
      { key: 'target', value: target },
      { key: 'retried', value: 'true' },
    ],
    meta: {
      error_type: isTimeout ? 'timeout' : 'error',
      timestamp: now,
    }
  };
}

/**
 * Create a finding for unconfigured providers
 */
export function createUnconfiguredFinding(
  providerId: string,
  requiredConfig: string
): any {
  const now = new Date().toISOString();
  
  return {
    provider: providerId,
    kind: 'provider.unconfigured',
    severity: 'info' as const,
    confidence: 1.0,
    observedAt: now,
    evidence: [
      { key: 'message', value: `${providerId} API key not configured` },
      { key: 'config_required', value: requiredConfig },
    ],
    meta: {
      unconfigured: true,
      timestamp: now,
    }
  };
}
