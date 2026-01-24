/**
 * Turnstile Verification Edge Function
 * Lightweight endpoint to verify Cloudflare Turnstile tokens before signup
 * 
 * POST /functions/v1/turnstile-verify
 * Body: { turnstile_token: string }
 * Returns: { ok: boolean, error?: string }
 */

import { verifyTurnstileToken, getClientIP } from '../_shared/turnstile.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const token = body.turnstile_token;

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing turnstile_token in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP for additional verification
    const clientIP = getClientIP(req);

    // Verify token with Cloudflare
    const result = await verifyTurnstileToken(token, clientIP);

    console.log('[turnstile-verify] Verification result:', { ok: result.ok });

    return new Response(
      JSON.stringify({ ok: result.ok, error: result.error }),
      { 
        status: result.ok ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (err) {
    console.error('[turnstile-verify] Error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Verification service error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
