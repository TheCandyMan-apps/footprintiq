/**
 * Security Headers for Edge Functions
 * Implements defense-in-depth security measures
 */

// Allowed origins for CORS - restrict to known domains only
const ALLOWED_ORIGINS = [
  'https://footprintiq.lovable.app',
  'https://preview--footprintiq.lovable.app',
  // Add production domain when deployed
];

export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection (legacy but still useful for older browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy - production-safe, no unsafe-eval
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind/styled-jsx
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://byuzgvauaeldjqxlrjci.supabase.co wss://byuzgvauaeldjqxlrjci.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
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
 * Get CORS headers with origin validation
 * Only allows requests from known domains
 */
export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  // Check if origin is in allowed list
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) 
    ? requestOrigin 
    : ALLOWED_ORIGINS[0]; // Default to primary domain
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

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
 * Create a secure JSON response with origin-validated CORS
 * @param data - Response payload
 * @param status - HTTP status code
 * @param additionalHeaders - Extra headers to merge
 * @param requestOrigin - Origin header from request (for CORS validation)
 */
export function secureJsonResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: HeadersInit = {},
  requestOrigin?: string | null
): Response {
  const corsHeaders = getCorsHeaders(requestOrigin);
  
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
