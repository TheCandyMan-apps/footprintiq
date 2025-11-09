export interface RetryOptions {
  maxAttempts?: number;
  delays?: number[]; // Custom delays in milliseconds [2000, 4000, 6000]
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> & { onRetry?: (attempt: number, error: any) => void } = {
  maxAttempts: 3,
  delays: [2000, 4000, 6000], // 2s, 4s, 6s
};

/**
 * Retry a function with exponential backoff
 * Only retries on transient errors (timeouts, 5xx, network errors)
 * Does NOT retry on 4xx client errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: { scanId?: string; providerId?: string }
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 1) {
        console.log(
          `[Retry Success]${context?.scanId ? ` Scan ${context.scanId}:` : ''}` +
          `${context?.providerId ? ` Provider ${context.providerId}` : ''} succeeded on attempt ${attempt}`
        );
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      
      // Enhanced logging
      console.error(
        `[Retry Attempt ${attempt}/${opts.maxAttempts}]` +
        `${context?.scanId ? ` Scan ${context.scanId}:` : ''}` +
        `${context?.providerId ? ` Provider ${context.providerId}` : ''} failed` +
        ` - ${error.message || 'Unknown error'}` +
        (isRetryable ? ' (retryable)' : ' (non-retryable)')
      );
      
      if (!isRetryable || attempt >= opts.maxAttempts) {
        console.error(
          `[Retry Failed]${context?.scanId ? ` Scan ${context.scanId}:` : ''}` +
          `${context?.providerId ? ` Provider ${context.providerId}` : ''} exhausted all ${opts.maxAttempts} attempts`
        );
        throw error;
      }
      
      // Get delay for this attempt (0-indexed array)
      const delay = opts.delays[attempt - 1] || opts.delays[opts.delays.length - 1];
      
      // Call onRetry callback if provided
      opts.onRetry?.(attempt, error);
      
      console.log(
        `[Retry Delay]${context?.scanId ? ` Scan ${context.scanId}:` : ''}` +
        `${context?.providerId ? ` Provider ${context.providerId}` : ''} waiting ${delay}ms before retry ${attempt + 1}`
      );
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Determine if an error is retryable
 * Retries: timeouts, 5xx, network errors, 429
 * Does NOT retry: 4xx client errors (except 429)
 */
function isRetryableError(error: any): boolean {
  // Network/timeout errors
  if (error.name === 'AbortError') return true;
  if (error.message?.toLowerCase().includes('timeout')) return true;
  if (error.message?.toLowerCase().includes('network')) return true;
  if (error.message?.toLowerCase().includes('econnrefused')) return true;
  if (error.message?.toLowerCase().includes('fetch failed')) return true;
  
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
