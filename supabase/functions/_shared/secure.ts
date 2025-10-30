/**
 * Security utilities for Edge Functions
 * Origin validation, HMAC verification, and rate limiting
 */

/**
 * Check if request origin is allowed
 * Reads from ALLOWED_ORIGINS env var (comma-separated)
 */
export function allowedOrigin(req: Request): boolean {
  const list = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("origin") ?? "";
  
  // If no restrictions configured, allow all
  if (!list.length) return true;
  
  // Check if origin starts with any allowed prefix
  return list.some(prefix => origin.startsWith(prefix));
}

/**
 * Legacy function for backwards compatibility
 */
export function checkOrigin(req: Request, allowed: string[]): boolean {
  const origin = req.headers.get('origin') || '';
  if (!allowed.length) return true;
  return allowed.some(prefix => origin.startsWith(prefix));
}

/**
 * Verify HMAC signature on request body
 * Alias for hmacVerify for consistency
 */
export async function hmacVerify(req: Request, secret: string): Promise<boolean> {
  const sig = req.headers.get("X-Signature") || "";
  if (!sig) return false;
  
  const body = await req.clone().text();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === sig;
}

/**
 * Legacy function name for backwards compatibility
 */
export async function verifyHmac(req: Request, secret: string): Promise<boolean> {
  return hmacVerify(req, secret);
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

/**
 * Quick success response helper
 */
export const ok = (data: unknown, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });

/**
 * Quick error response helper
 */
export const bad = (status: number, message: string) => 
  ok({ error: message }, status);
