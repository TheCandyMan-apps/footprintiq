/**
 * Spamhaus Enrich Edge Function
 * Server-side only endpoint for Spamhaus threat intelligence
 * 
 * POST { inputType: 'ip' | 'domain', inputValue: string, scanId?: string }
 * Returns SpamhausSignal or error
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { spamhausClient } from '../_shared/spamhaus/client.ts';
import { validateInput } from '../_shared/spamhaus/validation.ts';
import { checkSpamhausRateLimit } from '../_shared/spamhaus/rateLimiter.ts';
import type { SpamhausEnrichRequest, SpamhausResult } from '../_shared/spamhaus/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  let userId: string | null = null;
  let scanId: string | null = null;
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';
    
    // Parse request body
    const body: SpamhausEnrichRequest = await req.json();
    const { inputType, inputValue, scanId: requestScanId, skipCache } = body;
    scanId = requestScanId || null;
    
    console.log(`[spamhaus-enrich] Request: ${inputType}=${inputValue}, scanId=${scanId}`);
    
    // Validate input
    const validation = validateInput(inputType, inputValue);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'validation_error', message: validation.error },
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check rate limits
    const rateLimitIdentifier = userId || clientIp;
    const rateLimitType = userId ? 'user' : 'ip';
    const rateLimitResult = await checkSpamhausRateLimit(rateLimitIdentifier, rateLimitType);
    
    if (!rateLimitResult.allowed) {
      console.log(`[spamhaus-enrich] Rate limit exceeded for ${rateLimitType}:${rateLimitIdentifier}`);
      
      // Log rate limit event
      await logScanEvent(supabase, {
        scanId,
        provider: `spamhaus_${inputType}`,
        stage: 'failed',
        status: 'rate_limited',
        metadata: { 
          retryAfter: rateLimitResult.retryAfter,
          window: rateLimitResult.window,
        },
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            code: 'rate_limited', 
            message: 'Spamhaus query rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
          },
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }
    
    // Log start event
    await logScanEvent(supabase, {
      scanId,
      provider: `spamhaus_${inputType}`,
      stage: 'started',
      status: 'running',
      metadata: { inputType, userId, clientIp: clientIp.slice(0, 20) },
    });
    
    // Execute lookup based on input type
    let result: SpamhausResult;
    
    if (inputType === 'ip') {
      result = await spamhausClient.lookupIp(inputValue, skipCache);
    } else if (inputType === 'domain') {
      result = await spamhausClient.lookupDomain(inputValue, skipCache);
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'validation_error', message: 'Invalid input type' },
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const durationMs = Date.now() - startTime;
    
    // Log completion/failure event
    if (result.success) {
      await logScanEvent(supabase, {
        scanId,
        provider: `spamhaus_${inputType}`,
        stage: 'complete',
        status: 'success',
        durationMs,
        metadata: { 
          verdict: result.data.verdict,
          categoryCount: result.data.categories.length,
          cacheHit: result.data.cacheHit,
        },
      });
      
      console.log(`[spamhaus-enrich] Success: verdict=${result.data.verdict}, cacheHit=${result.data.cacheHit}, duration=${durationMs}ms`);
    } else {
      await logScanEvent(supabase, {
        scanId,
        provider: `spamhaus_${inputType}`,
        stage: 'failed',
        status: 'failed',
        durationMs,
        metadata: { 
          errorCode: result.error.code,
          errorMessage: result.error.message,
        },
      });
      
      console.log(`[spamhaus-enrich] Failed: ${result.error.code} - ${result.error.message}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : getStatusCode(result.error.code),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('[spamhaus-enrich] Unhandled error:', error);
    
    const durationMs = Date.now() - startTime;
    
    // Try to log error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await logScanEvent(supabase, {
        scanId,
        provider: 'spamhaus_unknown',
        stage: 'failed',
        status: 'failed',
        durationMs,
        metadata: { 
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch {
      // Ignore logging errors
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: { 
          code: 'api_error', 
          message: 'Internal server error processing Spamhaus request',
        },
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Log scan event to database
 */
async function logScanEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  event: {
    scanId: string | null;
    provider: string;
    stage: 'started' | 'complete' | 'failed';
    status: 'running' | 'success' | 'failed' | 'rate_limited';
    durationMs?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from('scan_events').insert({
      scan_id: event.scanId,
      provider: event.provider,
      stage: event.stage,
      status: event.status,
      duration_ms: event.durationMs,
      metadata: event.metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[spamhaus-enrich] Failed to log scan event:', error);
  }
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCode(errorCode: string): number {
  switch (errorCode) {
    case 'validation_error':
      return 400;
    case 'auth_failed':
      return 401;
    case 'rate_limited':
      return 429;
    case 'not_found':
      return 404;
    case 'not_configured':
      return 503;
    case 'timeout':
      return 504;
    default:
      return 500;
  }
}
