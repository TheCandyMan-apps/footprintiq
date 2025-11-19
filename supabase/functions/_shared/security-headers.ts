/**
 * Security Headers for Edge Functions
 * Implements defense-in-depth security measures
 */

export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://byuzgvauaeldjqxlrjci.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Merge security headers with response headers
 */
export function addSecurityHeaders(headers: HeadersInit = {}): HeadersInit {
  return {
    ...securityHeaders,
    ...headers,
  };
}

/**
 * Create a secure JSON response
 */
export function secureJsonResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: HeadersInit = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: addSecurityHeaders({
      'Content-Type': 'application/json',
      ...additionalHeaders,
    }),
  });
}
