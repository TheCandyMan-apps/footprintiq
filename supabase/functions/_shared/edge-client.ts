/**
 * Edge Function Client Wrapper
 * Standardizes error handling, response shape, and logging for edge function calls
 * 
 * Usage in edge functions:
 *   import { handleRequest, EdgeError } from '../_shared/edge-client.ts';
 */

import { getCorsHeaders, securityHeaders } from './security-headers.ts';

// Standard response shape for all edge function responses
export interface EdgeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    durationMs?: number;
  };
}

// Custom error class for edge functions
export class EdgeError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EdgeError';
  }
}

// Common error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Structured logging helper
 */
export function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, unknown>
): void {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

/**
 * Create a standardized JSON response
 */
export function createResponse<T>(
  response: EdgeResponse<T>,
  status: number,
  requestOrigin?: string | null
): Response {
  const corsHeaders = getCorsHeaders(requestOrigin);
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      ...corsHeaders,
      ...securityHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  requestId: string,
  startTime: number,
  requestOrigin?: string | null
): Response {
  const response: EdgeResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    },
  };
  
  return createResponse(response, 200, requestOrigin);
}

/**
 * Create an error response
 */
export function errorResponse(
  error: EdgeError | Error,
  requestId: string,
  startTime: number,
  requestOrigin?: string | null
): Response {
  const isEdgeError = error instanceof EdgeError;
  
  const response: EdgeResponse = {
    success: false,
    error: {
      code: isEdgeError ? error.code : ErrorCodes.INTERNAL_ERROR,
      message: error.message,
      details: isEdgeError ? error.details : undefined,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    },
  };
  
  const status = isEdgeError ? error.status : 500;
  
  // Log errors
  log('error', 'Request failed', {
    requestId,
    code: response.error?.code,
    message: error.message,
    status,
  });
  
  return createResponse(response, status, requestOrigin);
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

/**
 * Main request handler wrapper
 * Provides consistent error handling, logging, and response formatting
 * 
 * @example
 * Deno.serve(handleRequest(async (req, ctx) => {
 *   const { userId } = await req.json();
 *   if (!userId) throw new EdgeError('VALIDATION_ERROR', 'userId required', 400);
 *   return { user: await getUser(userId) };
 * }));
 */
export function handleRequest<T>(
  handler: (req: Request, ctx: { requestId: string }) => Promise<T>
) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const origin = req.headers.get('origin');
    
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    
    // Log incoming request
    log('info', 'Request received', {
      requestId,
      method: req.method,
      url: req.url,
    });
    
    try {
      const result = await handler(req, { requestId });
      
      log('info', 'Request completed', {
        requestId,
        durationMs: Date.now() - startTime,
      });
      
      return successResponse(result, requestId, startTime, origin);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error : new Error(String(error)),
        requestId,
        startTime,
        origin
      );
    }
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[]
): void {
  const missing = fields.filter(field => body[field] === undefined || body[field] === null);
  
  if (missing.length > 0) {
    throw new EdgeError(
      ErrorCodes.VALIDATION_ERROR,
      `Missing required fields: ${missing.join(', ')}`,
      400
    );
  }
}
