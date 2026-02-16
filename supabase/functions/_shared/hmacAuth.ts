/**
 * HMAC-SHA256 signature verification for n8n webhook callbacks.
 *
 * Signature scheme:
 *   message  = "${x-fpiq-ts}.${rawBody}"
 *   expected = HMAC-SHA256(N8N_WEBHOOK_HMAC_SECRET, message) → hex
 *   compare  = x-fpiq-sig === expected
 *   reject if |Date.now()/1000 - x-fpiq-ts| > 300
 */

const MAX_CLOCK_DRIFT_SECONDS = 300; // 5 minutes

/** Constant-time string comparison to prevent timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) {
    diff |= aBuf[i] ^ bBuf[i];
  }
  return diff === 0;
}

/** Convert ArrayBuffer to lowercase hex string. */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type HmacErrorCode = 'AUTH_MISSING' | 'AUTH_HMAC_SECRET_MISSING' | 'AUTH_HMAC_BAD_TS' | 'AUTH_HMAC_MISMATCH';

export interface HmacResult {
  authenticated: boolean;
  /** Machine-readable error code for 401 responses */
  code?: HmacErrorCode;
  /** Detailed reason – log server-side only, never send to client */
  internalReason?: string;
}

/**
 * Verify HMAC-SHA256 signature from x-fpiq-ts / x-fpiq-sig headers.
 * Returns `{ authenticated: true }` on success, or `{ authenticated: false, error }` on failure.
 *
 * Only call this when both headers are present – the caller decides whether
 * to fall back to other auth methods when the headers are absent.
 */
/**
 * Generate HMAC-SHA256 signing headers for outbound requests.
 * Returns `{ 'x-fpiq-ts': string, 'x-fpiq-sig': string }` or `{}` if secret is not configured.
 */
export async function signFpiqHmac(body: string): Promise<Record<string, string>> {
  const secret = Deno.env.get('N8N_WEBHOOK_HMAC_SECRET');
  if (!secret) return {};

  const ts = String(Math.floor(Date.now() / 1000));
  const message = `${ts}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const sig = bufToHex(signatureBuffer);

  return { 'x-fpiq-ts': ts, 'x-fpiq-sig': sig };
}

/**
 * Verify HMAC-SHA256 signature from x-fpiq-ts / x-fpiq-sig headers.
 * Returns `{ authenticated: true }` on success, or `{ authenticated: false, error }` on failure.
 *
 * Only call this when both headers are present – the caller decides whether
 * to fall back to other auth methods when the headers are absent.
 */
export async function verifyFpiqHmac(
  rawBody: string,
  headers: Headers,
): Promise<HmacResult> {
  const ts = headers.get('x-fpiq-ts');
  const sig = headers.get('x-fpiq-sig');

  if (!ts || !sig) {
    return { authenticated: false, code: 'AUTH_MISSING', internalReason: 'Missing HMAC headers (x-fpiq-ts / x-fpiq-sig)' };
  }

  // Check secret is configured
  const secret = Deno.env.get('N8N_WEBHOOK_HMAC_SECRET');
  if (!secret) {
    return { authenticated: false, code: 'AUTH_HMAC_SECRET_MISSING', internalReason: 'N8N_WEBHOOK_HMAC_SECRET env var not set' };
  }

  // Check timestamp drift
  const tsNum = Number(ts);
  if (isNaN(tsNum)) {
    return { authenticated: false, code: 'AUTH_HMAC_BAD_TS', internalReason: `Invalid timestamp value: "${ts}"` };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsNum) > MAX_CLOCK_DRIFT_SECONDS) {
    return { authenticated: false, code: 'AUTH_HMAC_BAD_TS', internalReason: `Timestamp drift ${Math.abs(nowSeconds - tsNum)}s exceeds ${MAX_CLOCK_DRIFT_SECONDS}s limit` };
  }

  // Compute expected signature
  const message = `${ts}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expectedSig = bufToHex(signatureBuffer);

  // Constant-time comparison
  if (!timingSafeEqual(sig.toLowerCase(), expectedSig)) {
    return { authenticated: false, code: 'AUTH_HMAC_MISMATCH', internalReason: 'Signature does not match expected HMAC-SHA256 value' };
  }

  return { authenticated: true };
}
