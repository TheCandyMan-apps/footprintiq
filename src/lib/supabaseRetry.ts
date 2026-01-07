/**
 * Retry wrapper for Supabase edge function invocations
 * Provides automatic retry with exponential backoff for transient failures
 */

// Error types for better classification
export type ScanErrorType = 
  | 'network_error' 
  | 'timeout' 
  | 'rate_limit' 
  | 'auth_error' 
  | 'server_error' 
  | 'client_error'
  | 'provider_unconfigured'
  | 'unknown';

export interface ClassifiedError {
  type: ScanErrorType;
  message: string;
  retryable: boolean;
  code?: number;
  provider?: string;
}

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeoutMs?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any, delay: number) => void;
  context?: { scanId?: string; operation?: string };
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'context'>> = {
  maxAttempts: 3,
  baseDelay: 1500, // 1.5 seconds
  maxDelay: 8000,  // 8 seconds
  timeoutMs: 55000, // 55 seconds (below Supabase 60s limit)
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (!error) return false;
    
    const status = error?.status || error?.code;
    const message = error?.message?.toLowerCase() || '';
    
    // Network/timeout errors - always retry
    if (message.includes('timeout') || message.includes('network') || 
        message.includes('fetch failed') || message.includes('econnrefused') ||
        message.includes('aborted')) {
      return true;
    }
    
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
 * Classify an error for better handling
 */
export function classifyError(error: any): ClassifiedError {
  if (!error) {
    return { type: 'unknown', message: 'Unknown error', retryable: false };
  }

  const status = error?.status || error?.code;
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  // Check for timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('aborted') || 
      error?.name === 'AbortError') {
    return { 
      type: 'timeout', 
      message: 'Request timed out. The scan is taking longer than expected.',
      retryable: true,
      code: status
    };
  }

  // Check for network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed') ||
      lowerMessage.includes('econnrefused') || lowerMessage.includes('dns')) {
    return {
      type: 'network_error',
      message: 'Connection issue. Please check your network and try again.',
      retryable: true,
      code: status
    };
  }

  // Check for rate limiting
  if (status === 429 || lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return {
      type: 'rate_limit',
      message: 'Too many requests. Please wait a moment before trying again.',
      retryable: true,
      code: 429
    };
  }

  // Check for auth errors
  if (status === 401 || status === 403 || lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('forbidden') || lowerMessage.includes('token')) {
    return {
      type: 'auth_error',
      message: 'Authentication required. Please log in again.',
      retryable: false,
      code: status
    };
  }

  // Check for provider configuration issues
  if (lowerMessage.includes('unconfigured') || lowerMessage.includes('not configured') ||
      lowerMessage.includes('api key')) {
    return {
      type: 'provider_unconfigured',
      message: 'Some providers are not configured. Contact support for assistance.',
      retryable: false,
      code: status
    };
  }

  // Server errors (5xx)
  if (status >= 500) {
    return {
      type: 'server_error',
      message: 'Server error. Our team has been notified. Please try again.',
      retryable: true,
      code: status
    };
  }

  // Client errors (4xx)
  if (status >= 400 && status < 500) {
    return {
      type: 'client_error',
      message: message || 'Invalid request. Please check your input.',
      retryable: false,
      code: status
    };
  }

  return { 
    type: 'unknown', 
    message: message || 'An unexpected error occurred.',
    retryable: false,
    code: status
  };
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
): Promise<{ data: T | null; error: any; classified?: ClassifiedError }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  const startTime = Date.now();
  
  // Context for logging
  const ctx = opts.context || {};
  const logPrefix = ctx.scanId ? `[Retry:${ctx.scanId}]` : '[invokeWithRetry]';
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    // Check if we've exceeded total timeout
    const elapsed = Date.now() - startTime;
    if (elapsed > opts.timeoutMs) {
      console.error(`${logPrefix} Total timeout exceeded after ${elapsed}ms`);
      const timeoutError = { message: 'Operation timed out', name: 'TimeoutError' };
      return { 
        data: null, 
        error: timeoutError,
        classified: classifyError(timeoutError)
      };
    }
    
    try {
      // Create timeout for this attempt
      const attemptTimeout = Math.min(
        opts.timeoutMs - elapsed,
        30000 // Max 30s per attempt
      );
      
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Attempt timeout')), attemptTimeout)
        )
      ]) as any;
      
      // Check for function-level errors (not HTTP errors)
      if (result.error) {
        lastError = result.error;
        const classified = classifyError(result.error);
        
        // If it's not retryable, return immediately
        if (!classified.retryable || !opts.shouldRetry(result.error)) {
          console.log(`${logPrefix} Non-retryable error: ${classified.type}`);
          return { ...result, classified };
        }
        
        // If we have attempts left, retry
        if (attempt < opts.maxAttempts) {
          const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
          console.warn(
            `${logPrefix} Attempt ${attempt}/${opts.maxAttempts} failed (${classified.type}), retrying in ${Math.round(delay)}ms`,
            { error: result.error?.message || result.error, operation: ctx.operation }
          );
          
          // Call onRetry callback
          opts.onRetry?.(attempt, result.error, delay);
          
          await sleep(delay);
          continue;
        }
        
        // Final attempt failed
        return { ...result, classified };
      }
      
      // Success
      if (attempt > 1) {
        console.log(`${logPrefix} Succeeded on attempt ${attempt}/${opts.maxAttempts}`);
      }
      return result;
      
    } catch (err) {
      lastError = err;
      const classified = classifyError(err);
      
      // Check if retryable
      if (!classified.retryable || !opts.shouldRetry(err)) {
        console.log(`${logPrefix} Non-retryable exception: ${classified.type}`);
        return { data: null, error: err, classified };
      }
      
      // If we have attempts left, retry
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
        console.warn(
          `${logPrefix} Attempt ${attempt}/${opts.maxAttempts} threw (${classified.type}), retrying in ${Math.round(delay)}ms`,
          { error: (err as Error).message, operation: ctx.operation }
        );
        
        // Call onRetry callback
        opts.onRetry?.(attempt, err, delay);
        
        await sleep(delay);
        continue;
      }
      
      // Final attempt failed
      return { data: null, error: err, classified };
    }
  }
  
  // Should never reach here, but TypeScript needs it
  return { 
    data: null, 
    error: lastError,
    classified: classifyError(lastError)
  };
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

/**
 * Pre-configured wrapper for scan operations (higher retry count)
 */
export const scanInvoke = createRetryWrapper({
  maxAttempts: 3,
  baseDelay: 2000,
  maxDelay: 10000,
  timeoutMs: 55000,
});

/**
 * Get user-friendly error message from classified error
 */
export function getUserFriendlyMessage(classified: ClassifiedError): string {
  switch (classified.type) {
    case 'timeout':
      return 'The scan is taking longer than expected. Results will appear when ready.';
    case 'network_error':
      return 'Connection issue. Please check your network and try again.';
    case 'rate_limit':
      return 'Too many scans. Please wait a few minutes before trying again.';
    case 'auth_error':
      return 'Your session has expired. Please log in again.';
    case 'server_error':
      return 'Our servers are busy. Please try again in a moment.';
    case 'provider_unconfigured':
      return 'Some scan providers are not configured. Results may be partial.';
    case 'client_error':
      return classified.message || 'Please check your input and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
