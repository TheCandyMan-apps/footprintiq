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
  additionalHeaders: HeadersInit = {},
  corsEnabled: boolean = true  // Default to true for most use cases
): Response {
  const corsHeaders: Record<string, string> = corsEnabled ? {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  } : {};
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...addSecurityHeaders({
        'Content-Type': 'application/json',
        ...additionalHeaders,
      }),
    },
  });
}
