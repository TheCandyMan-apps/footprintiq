/**
 * Generic error handling for edge functions
 * Prevents information leakage through verbose error messages
 */

export const ERROR_CODES = {
  AUTH_FAILED: 'Authentication failed',
  AUTH_MISSING: 'Authentication failed',
  AUTH_HMAC_BAD_TS: 'Authentication failed',
  AUTH_HMAC_MISMATCH: 'Authentication failed',
  AUTH_HMAC_SECRET_MISSING: 'Authentication failed',
  AUTH_KEY_INVALID: 'Authentication failed',
  INVALID_INPUT: 'Invalid request data',
  INVALID_API_KEY: 'Invalid or missing API key',
  RATE_LIMITED: 'Too many requests. Please try again later',
  WEBHOOK_VERIFICATION_FAILED: 'Webhook verification failed',
  SERVER_ERROR: 'An error occurred processing your request',
  NOT_FOUND: 'Resource not found',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Maps internal errors to safe user-facing messages
 * Logs detailed information server-side for debugging
 */
export function safeError(error: unknown, code: ErrorCode = 'SERVER_ERROR'): {
  message: string;
  code: string;
} {
  // Log detailed error server-side for debugging
  console.error('[INTERNAL ERROR]', {
    code,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Return generic message to client
  return {
    code,
    message: ERROR_CODES[code],
  };
}

/**
 * Creates a JSON error response with proper CORS headers
 */
export function errorResponse(
  error: unknown,
  status: number,
  code: ErrorCode = 'SERVER_ERROR',
  corsHeaders: Record<string, string> = {}
): Response {
  const safeErr = safeError(error, code);
  
  return new Response(
    JSON.stringify({ error: safeErr.message, code: safeErr.code }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
