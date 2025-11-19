/**
 * Production-grade error handling for Edge Functions
 * Provides structured error responses, safe error logging, and helper utilities
 */

export interface StructuredError {
  error: string;
  message?: string;
  code?: string;
  details?: any;
}

export class EdgeFunctionError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

// Predefined error responses
export const ERROR_RESPONSES = {
  // Client errors (400-499)
  INVALID_REQUEST: (details?: string) => new EdgeFunctionError(
    'invalid_request',
    details || 'Invalid request format or parameters',
    400,
    details
  ),
  VALIDATION_ERROR: (details?: string) => new EdgeFunctionError(
    'validation_error',
    details || 'Input validation failed',
    400,
    details
  ),
  UNAUTHORIZED: (details?: string) => new EdgeFunctionError(
    'unauthorized',
    details || 'Authentication required',
    401,
    details
  ),
  FORBIDDEN: (details?: string) => new EdgeFunctionError(
    'forbidden',
    details || 'Insufficient permissions',
    403,
    details
  ),
  NOT_FOUND: (details?: string) => new EdgeFunctionError(
    'not_found',
    details || 'Resource not found',
    404,
    details
  ),
  RATE_LIMITED: (details?: string) => new EdgeFunctionError(
    'rate_limited',
    details || 'Too many requests, please try again later',
    429,
    details
  ),
  SUBSCRIPTION_REQUIRED: (details?: any) => new EdgeFunctionError(
    'subscription_required',
    'This feature requires a higher subscription tier',
    403,
    details
  ),
  QUOTA_EXCEEDED: (details?: any) => new EdgeFunctionError(
    'quota_exceeded',
    'Usage quota exceeded for your plan',
    429,
    details
  ),
  
  // Server errors (500-599)
  INTERNAL_ERROR: (details?: string) => new EdgeFunctionError(
    'internal_error',
    'An internal error occurred',
    500,
    details
  ),
  BAD_GATEWAY: (details?: string) => new EdgeFunctionError(
    'bad_gateway',
    'External service unavailable',
    502,
    details
  ),
  TIMEOUT: (details?: string) => new EdgeFunctionError(
    'timeout',
    'Request timed out',
    504,
    details
  ),
  
  // Business logic errors
  NO_PROVIDERS_AVAILABLE: (details?: any) => new EdgeFunctionError(
    'no_providers_available_for_tier',
    'No scan providers available for your subscription tier',
    400,
    details
  ),
  PROVIDER_ERROR: (provider: string, details?: string) => new EdgeFunctionError(
    'provider_error',
    `Provider ${provider} returned an error`,
    502,
    { provider, details }
  ),
  WORKER_UNREACHABLE: (worker: string, details?: string) => new EdgeFunctionError(
    'worker_unreachable',
    `Cannot reach ${worker} worker`,
    502,
    { worker, details }
  ),
};

/**
 * Sanitize data for logging - redact sensitive information
 */
export function sanitizeForLog(data: any): any {
  if (!data) return data;
  
  const sensitiveKeys = [
    'password', 'token', 'api_key', 'apikey', 'secret', 
    'authorization', 'auth', 'key', 'credentials'
  ];
  
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Redact sensitive keys
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
      // Redact email addresses
      else if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
        const parts = value.split('@');
        if (parts.length === 2) {
          sanitized[key] = `${parts[0].substring(0, 1)}***@${parts[1]}`;
        } else {
          sanitized[key] = value;
        }
      }
      // Redact phone numbers (basic pattern)
      else if (typeof value === 'string' && /^\+?[\d\s\-()]{10,}$/.test(value)) {
        sanitized[key] = `***${value.slice(-4)}`;
      }
      // Recursively sanitize nested objects
      else if (typeof value === 'object') {
        sanitized[key] = sanitize(value);
      }
      else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  return sanitize(data);
}

/**
 * Safe fetch with timeout and retry logic
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 20000,
  maxRetries: number = 1
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (timeout) errors
      if (error.name === 'AbortError') {
        throw ERROR_RESPONSES.TIMEOUT(`Request to ${url} timed out after ${timeoutMs}ms`);
      }
      
      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff with jitter)
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw ERROR_RESPONSES.BAD_GATEWAY(`Failed to reach ${url}: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Safe OSINT worker call with validation and error handling
 */
export async function safeWorkerCall(
  workerUrl: string,
  workerName: string,
  payload: any,
  authToken?: string,
  timeoutMs: number = 20000
): Promise<any> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log(`[safeWorkerCall] Calling ${workerName} at ${workerUrl}`);
    console.log(`[safeWorkerCall] Payload:`, sanitizeForLog(payload));
    
    const response = await safeFetch(
      workerUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
      timeoutMs,
      1 // One retry
    );
    
    console.log(`[safeWorkerCall] ${workerName} responded with status ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[safeWorkerCall] ${workerName} error response:`, sanitizeForLog(errorText));
      throw ERROR_RESPONSES.PROVIDER_ERROR(workerName, `HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Basic validation - ensure we got some kind of response
    if (!data) {
      throw ERROR_RESPONSES.PROVIDER_ERROR(workerName, 'Empty response from worker');
    }
    
    console.log(`[safeWorkerCall] ${workerName} returned data (keys):`, Object.keys(data));
    return data;
    
  } catch (error: any) {
    if (error instanceof EdgeFunctionError) {
      throw error;
    }
    
    console.error(`[safeWorkerCall] ${workerName} error:`, sanitizeForLog(error));
    throw ERROR_RESPONSES.WORKER_UNREACHABLE(workerName, error.message);
  }
}

/**
 * Safe JSON parse that never crashes
 */
export function safeJsonParse<T = any>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('[safeJsonParse] Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: unknown,
  corsHeaders: Record<string, string> = {}
): Response {
  let structuredError: StructuredError;
  let status: number;
  
  if (error instanceof EdgeFunctionError) {
    structuredError = {
      error: error.code,
      message: error.message,
      code: error.code,
      details: error.details
    };
    status = error.status;
  } else if (error instanceof Error) {
    // Generic error - don't leak internal details
    console.error('[EdgeFunctionError]', sanitizeForLog({ message: error.message, stack: error.stack }));
    structuredError = {
      error: 'internal_error',
      message: 'An internal error occurred',
      code: 'internal_error'
    };
    status = 500;
  } else {
    console.error('[EdgeFunctionError]', sanitizeForLog(error));
    structuredError = {
      error: 'unknown_error',
      message: 'An unknown error occurred',
      code: 'unknown_error'
    };
    status = 500;
  }
  
  return new Response(
    JSON.stringify(structuredError),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Wrap an edge function handler with global error handling and timeout
 */
export function wrapHandler(
  handler: (req: Request) => Promise<Response>,
  options: {
    timeoutMs?: number;
    corsHeaders?: Record<string, string>;
    functionName?: string;
  } = {}
) {
  const { 
    timeoutMs = 30000, 
    corsHeaders = {}, 
    functionName = 'edge-function' 
  } = options;
  
  return async (req: Request): Promise<Response> => {
    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error(`[${functionName}] Function exceeded timeout of ${timeoutMs}ms`);
        controller.abort();
      }, timeoutMs);
      
      // Execute handler with timeout
      const handlerPromise = handler(req);
      const timeoutPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(ERROR_RESPONSES.TIMEOUT(`Function execution exceeded ${timeoutMs}ms`));
        });
      });
      
      const response = await Promise.race([handlerPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      
      return response;
      
    } catch (error: any) {
      console.error(`[${functionName}] Unhandled error:`, sanitizeForLog(error));
      return errorResponse(error, corsHeaders);
    }
  };
}

/**
 * Log error to system_errors table (fire and forget)
 */
export async function logSystemError(
  supabase: any,
  errorCode: string,
  errorMessage: string,
  context: {
    functionName?: string;
    workspaceId?: string;
    userId?: string;
    scanId?: string;
    provider?: string;
    severity?: 'info' | 'warn' | 'error' | 'critical';
    metadata?: any;
  } = {}
): Promise<void> {
  try {
    await supabase.rpc('log_system_error', {
      p_error_code: errorCode,
      p_error_message: errorMessage,
      p_function_name: context.functionName || null,
      p_workspace_id: context.workspaceId || null,
      p_user_id: context.userId || null,
      p_scan_id: context.scanId || null,
      p_provider: context.provider || null,
      p_severity: context.severity || 'error',
      p_metadata: sanitizeForLog(context.metadata || {})
    });
  } catch (error) {
    // Don't fail the main request if error logging fails
    console.error('[logSystemError] Failed to log error:', sanitizeForLog(error));
  }
}
