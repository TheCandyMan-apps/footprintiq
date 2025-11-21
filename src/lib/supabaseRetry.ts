/**
 * Retry wrapper for Supabase edge function invocations
 * Provides automatic retry with exponential backoff for transient failures
 */

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 2,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (!error) return false;
    
    const status = error?.status || error?.code;
    
    // Don't retry client errors (4xx) except 429 (rate limit)
    if (status >= 400 && status < 500 && status !== 429) {
      return false;
    }
    
    // Retry on server errors (5xx), network errors, or rate limits
    return true;
  }
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Invoke a Supabase edge function with automatic retry
 * 
 * @example
 * ```typescript
 * const result = await invokeWithRetry(() =>
 *   supabase.functions.invoke('my-function', { body: { foo: 'bar' } })
 * );
 * ```
 */
export async function invokeWithRetry<T = any>(
  fn: () => Promise<any>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Check for function-level errors (not HTTP errors)
      if (result.error) {
        lastError = result.error;
        
        // If it's not retryable, return immediately
        if (!opts.shouldRetry(result.error)) {
          console.log('[invokeWithRetry] Non-retryable error, returning immediately');
          return result;
        }
        
        // If we have attempts left, retry
        if (attempt < opts.maxAttempts) {
          const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
          console.warn(
            `[invokeWithRetry] Attempt ${attempt}/${opts.maxAttempts} failed, retrying in ${Math.round(delay)}ms`,
            { error: result.error?.message || result.error }
          );
          await sleep(delay);
          continue;
        }
      }
      
      // Success or final attempt
      return result;
      
    } catch (err) {
      lastError = err;
      
      // Check if retryable
      if (!opts.shouldRetry(err)) {
        console.log('[invokeWithRetry] Non-retryable error, throwing');
        throw err;
      }
      
      // If we have attempts left, retry
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
        console.warn(
          `[invokeWithRetry] Attempt ${attempt}/${opts.maxAttempts} threw error, retrying in ${Math.round(delay)}ms`,
          { error: err }
        );
        await sleep(delay);
        continue;
      }
      
      // Final attempt failed, throw
      throw err;
    }
  }
  
  // Should never reach here, but TypeScript needs it
  return { data: null, error: lastError };
}

/**
 * Create a retry wrapper with custom options
 * 
 * @example
 * ```typescript
 * const criticalInvoke = createRetryWrapper({ maxAttempts: 3, baseDelay: 2000 });
 * const result = await criticalInvoke(() =>
 *   supabase.functions.invoke('critical-function', { body: data })
 * );
 * ```
 */
export function createRetryWrapper(options: RetryOptions) {
  return <T = any>(fn: () => Promise<any>) => invokeWithRetry<T>(fn, options);
}
