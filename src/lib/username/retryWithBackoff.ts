export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 * Only retries on transient errors (timeouts, 5xx, network errors)
 * Does NOT retry on 4xx client errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable || attempt >= opts.maxAttempts) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      opts.onRetry(attempt, error);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Determine if an error is retryable
 * Retries: timeouts, 5xx, network errors
 * Does NOT retry: 4xx client errors
 */
function isRetryableError(error: any): boolean {
  // Network/timeout errors
  if (error.name === 'AbortError') return true;
  if (error.message?.includes('timeout')) return true;
  if (error.message?.includes('network')) return true;
  if (error.message?.includes('ECONNREFUSED')) return true;
  
  // HTTP status codes
  if (error.status) {
    const status = error.status;
    // Retry on 5xx server errors and 429 rate limit
    if (status >= 500 || status === 429) return true;
    // Do NOT retry on 4xx client errors (except 429)
    if (status >= 400 && status < 500) return false;
  }
  
  // Default to non-retryable for unknown errors
  return false;
}
