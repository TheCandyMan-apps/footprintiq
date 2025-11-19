/**
 * CSRF Token Validation Middleware for Edge Functions
 */

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate CSRF token from request headers
 * Should be used for sensitive operations (account changes, payments, exports)
 */
export function validateCSRFToken(req: Request): CSRFValidationResult {
  const csrfToken = req.headers.get('X-CSRF-Token');
  
  if (!csrfToken) {
    return {
      valid: false,
      error: 'CSRF token missing',
    };
  }
  
  // Basic token format validation (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(csrfToken)) {
    return {
      valid: false,
      error: 'Invalid CSRF token format',
    };
  }
  
  // In production, you would validate against stored tokens
  // For now, we accept any valid UUID format
  return { valid: true };
}

/**
 * CSRF protection middleware for sensitive operations
 */
export function requireCSRF(req: Request): Response | null {
  const validation = validateCSRFToken(req);
  
  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        error: 'CSRF validation failed',
        message: validation.error,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return null;
}
