/**
 * Cloudflare Turnstile verification helper
 * Server-side validation for bot protection
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  ok: boolean;
  error?: string;
}

/**
 * Verify a Turnstile token with Cloudflare
 * @param token - The turnstile_token from client request body
 * @param ip - Optional client IP address for additional security
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<TurnstileVerifyResult> {
  const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET');
  
  // If no secret configured, bypass verification (allows gradual rollout)
  if (!secret) {
    console.log('[turnstile] No CLOUDFLARE_TURNSTILE_SECRET configured, bypassing verification');
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: 'Missing turnstile token' };
  }

  try {
    // Build form data
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip && ip !== 'unknown') {
      formData.append('remoteip', ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`[turnstile] Verification API error: ${response.status}`);
      return { ok: false, error: 'Verification service unavailable' };
    }

    const result = await response.json();

    // Log minimal info (no token data)
    console.log('[turnstile] Verification result:', { success: result.success });

    if (!result.success) {
      // Extract error codes if available
      const errorCodes = result['error-codes'] || [];
      console.warn('[turnstile] Verification failed:', errorCodes);
      return { 
        ok: false, 
        error: errorCodes.includes('timeout-or-duplicate') 
          ? 'Verification expired. Please refresh and try again.'
          : 'Verification failed. Please try again.' 
      };
    }

    return { ok: true };
  } catch (err) {
    console.error('[turnstile] Verification exception:', err);
    return { ok: false, error: 'Verification check failed' };
  }
}

/**
 * Check if user plan allows bypassing Turnstile
 * Pro and Business users bypass verification
 */
export async function shouldBypassTurnstile(userId: string | null): Promise<boolean> {
  // Unauthenticated users always require Turnstile
  if (!userId) {
    return false;
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check user_roles for subscription tier
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('subscription_tier, role')
      .eq('user_id', userId)
      .single();

    // Admins always bypass
    if (userRole?.role === 'admin') {
      return true;
    }

    // Check subscription tier
    const tier = (userRole?.subscription_tier || 'free').toLowerCase();
    const bypassTiers = ['pro', 'business', 'premium', 'enterprise', 'analyst'];
    
    if (bypassTiers.includes(tier)) {
      return true;
    }

    // Also check workspace subscription_tier
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (workspaceMember?.workspace_id) {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('subscription_tier, plan')
        .eq('id', workspaceMember.workspace_id)
        .single();

      const workspaceTier = (workspace?.subscription_tier || workspace?.plan || 'free').toLowerCase();
      if (bypassTiers.includes(workspaceTier)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('[turnstile] Error checking bypass eligibility:', err);
    // Fail open for tier check errors - still require turnstile
    return false;
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Standard error response for Turnstile failure
 */
export function turnstileErrorResponse(corsHeaders: Record<string, string>, message?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: 'turnstile_failed', 
      message: message || 'Verification failed. Please try again.' 
    }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Middleware function to enforce Turnstile for free tier users
 * Returns null if verification passes, or an error Response if it fails
 */
export async function enforceTurnstile(
  req: Request,
  body: { turnstile_token?: string },
  userId: string | null,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  // Check if user can bypass
  const canBypass = await shouldBypassTurnstile(userId);
  if (canBypass) {
    console.log('[turnstile] User bypasses verification (pro+ tier)');
    return null;
  }

  // Get client IP
  const clientIP = getClientIP(req);

  // Verify token
  const token = body.turnstile_token;
  if (!token) {
    console.warn('[turnstile] Missing token for free tier user');
    return turnstileErrorResponse(corsHeaders, 'Please complete the verification to continue.');
  }

  const result = await verifyTurnstileToken(token, clientIP);
  if (!result.ok) {
    console.warn('[turnstile] Verification failed');
    return turnstileErrorResponse(corsHeaders, result.error);
  }

  console.log('[turnstile] Verification passed');
  return null;
}
