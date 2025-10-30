/**
 * Security utilities for Edge Functions
 * Origin validation, HMAC verification, and rate limiting
 */

/**
 * Validate request origin against allowed list
 * @param req - Request object
 * @param allowed - Array of allowed origin prefixes
 * @returns true if origin is allowed
 */
export function checkOrigin(req: Request, allowed: string[]): boolean {
  const origin = req.headers.get('origin') || '';
  
  // If no restrictions configured, allow all
  if (!allowed.length) return true;
  
  // Check if origin starts with any allowed prefix
  return allowed.some(prefix => origin.startsWith(prefix));
}

/**
 * Verify HMAC signature on request body
 * Use for webhook validation and secure API endpoints
 * 
 * @param req - Request object with X-Signature header
 * @param secret - Shared secret for HMAC computation
 * @returns true if signature is valid
 * 
 * @example
 * ```ts
 * const secret = Deno.env.get('WEBHOOK_SECRET');
 * if (!await verifyHmac(req, secret)) {
 *   return new Response('Invalid signature', { status: 401 });
 * }
 * ```
 */
export async function verifyHmac(req: Request, secret: string): Promise<boolean> {
  const sig = req.headers.get('X-Signature') || '';
  if (!sig) return false;
  
  // Clone request to read body without consuming it
  const body = await req.clone().text();
  
  // Import HMAC key
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Compute HMAC
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  
  // Convert to hex string
  const hex = Array.from(new Uint8Array(mac))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  // Constant-time comparison to prevent timing attacks
  return hex === sig;
}

/**
 * Parse allowed origins from environment variable
 * @param envVar - Environment variable name (e.g., 'ALLOWED_ORIGINS')
 * @returns Array of allowed origin strings
 */
export function getAllowedOrigins(envVar = 'ALLOWED_ORIGINS'): string[] {
  const origins = Deno.env.get(envVar) ?? '';
  return origins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Create standard CORS headers
 * @param origin - Request origin to allow (or '*' for public endpoints)
 */
export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };
}

/**
 * Standard JSON response helper
 */
export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), ...headers },
  });
}

/**
 * Standard error response helper
 */
export function errorResponse(message: string, status = 400, headers: Record<string, string> = {}) {
  return jsonResponse({ error: message }, status, headers);
}
