/**
 * Spamhaus Enrich Edge Function
 * Server-side only endpoint for Spamhaus threat intelligence
 * 
 * POST { inputType: 'ip' | 'domain', inputValue: string, scanId?: string }
 * Returns SpamhausSignal or error
 * 
 * REQUIRES: Pro tier subscription
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { spamhausClient } from '../_shared/spamhaus/client.ts';
import { validateInput, normalizeIp, normalizeDomain } from '../_shared/spamhaus/validation.ts';
import { checkSpamhausRateLimit } from '../_shared/spamhaus/rateLimiter.ts';
import type { SpamhausEnrichRequest, SpamhausResult, SpamhausSignal } from '../_shared/spamhaus/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pro tier requirement
const PRO_REQUIRED_TIERS = ['pro', 'business', 'premium', 'enterprise'];

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  let userId: string | null = null;
  let scanId: string | null = null;
  let workspaceId: string | null = null;
  
  try {
    // Initialize Supabase client with service role (required for spamhaus_cache/audit)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseKey);
    
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'auth_required', message: 'Authentication required' },
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'auth_failed', message: 'Invalid authentication token' },
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    userId = user.id;
    
    // Get user's workspace and subscription tier
    const { data: workspaceData } = await supabase
      .from('workspace_members')
      .select('workspace_id, workspaces!inner(id, subscription_tier, plan)')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (!workspaceData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'no_workspace', message: 'No workspace found for user' },
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    workspaceId = workspaceData.workspace_id;
    // Handle both single object and array from join
    const workspaceInfo = Array.isArray(workspaceData.workspaces) 
      ? workspaceData.workspaces[0] 
      : workspaceData.workspaces;
    const userTier = (workspaceInfo?.subscription_tier || workspaceInfo?.plan || 'free').toLowerCase();
    
    // PRO TIER ENFORCEMENT
    if (!PRO_REQUIRED_TIERS.includes(userTier)) {
      console.log(`[spamhaus-enrich] Pro required, user tier: ${userTier}`);
      
      // Log the blocked attempt (does NOT consume credits)
      await logSpamhausAudit(supabase, {
        userId,
        scanId: null,
        inputType: 'unknown',
        inputValue: 'blocked',
        action: 'lookupIp',
        cacheHit: false,
        success: false,
        errorCode: 'PRO_REQUIRED',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            code: 'PRO_REQUIRED', 
            message: 'Spamhaus enrichment is a Pro feature',
          },
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';
    
    // Parse request body
    const body: SpamhausEnrichRequest = await req.json();
    const { inputType, inputValue, scanId: requestScanId, skipCache } = body;
    scanId = requestScanId || null;
    
    console.log(`[spamhaus-enrich] Request: ${inputType}=${inputValue}, scanId=${scanId}, tier=${userTier}`);
    
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
    
    // Normalize input for cache key
    const normalizedValue = inputType === 'ip' ? normalizeIp(inputValue) : normalizeDomain(inputValue);
    const cacheKey = `spamhaus:${inputType}:${normalizedValue}`;
    
    // Check spamhaus_cache first (unless skipCache)
    if (!skipCache) {
      const { data: cached } = await supabase
        .from('spamhaus_cache')
        .select('signal, expires_at')
        .eq('cache_key', cacheKey)
        .single();
      
      if (cached && new Date(cached.expires_at) > new Date()) {
        const signal = cached.signal as SpamhausSignal;
        signal.cacheHit = true;
        
        // Log cache hit
        await logSpamhausAudit(supabase, {
          userId,
          scanId,
          inputType,
          inputValue: normalizedValue,
          action: inputType === 'ip' ? 'lookupIp' : 'lookupDomain',
          cacheHit: true,
          success: true,
          statusCode: 200,
        });
        
        console.log(`[spamhaus-enrich] Cache hit for ${cacheKey}`);
        
        return new Response(
          JSON.stringify({ success: true, data: signal }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Check rate limits
    const rateLimitResult = await checkSpamhausRateLimit(userId!, 'user');
    
    if (!rateLimitResult.allowed) {
      console.log(`[spamhaus-enrich] Rate limit exceeded for user:${userId}`);
      
      await logSpamhausAudit(supabase, {
        userId,
        scanId,
        inputType,
        inputValue: normalizedValue,
        action: inputType === 'ip' ? 'lookupIp' : 'lookupDomain',
        cacheHit: false,
        success: false,
        errorCode: 'rate_limited',
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
    
    // Log start event to scan_events
    await logScanEvent(supabase, {
      scanId,
      provider: `spamhaus_${inputType}`,
      stage: 'started',
      status: 'running',
      metadata: { inputType, userId, workspaceId },
    });
    
    // Execute lookup based on input type
    let result: SpamhausResult;
    const action = inputType === 'ip' ? 'lookupIp' : 'lookupDomain';
    
    if (inputType === 'ip') {
      result = await spamhausClient.lookupIp(inputValue, true); // skipCache=true since we handle cache
    } else if (inputType === 'domain') {
      result = await spamhausClient.lookupDomain(inputValue, true);
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
    
    // Log completion/failure
    if (result.success) {
      // Store in spamhaus_cache (24h TTL)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('spamhaus_cache')
        .upsert({
          cache_key: cacheKey,
          input_type: inputType,
          input_value: normalizedValue,
          signal: result.data,
          expires_at: expiresAt,
        }, {
          onConflict: 'cache_key',
        });
      
      // Log to spamhaus_audit
      await logSpamhausAudit(supabase, {
        userId,
        scanId,
        inputType,
        inputValue: normalizedValue,
        action,
        cacheHit: false,
        success: true,
        statusCode: 200,
      });
      
      // Log to scan_events
      await logScanEvent(supabase, {
        scanId,
        provider: `spamhaus_${inputType}`,
        stage: 'complete',
        status: 'success',
        durationMs,
        metadata: { 
          verdict: result.data.verdict,
          categoryCount: result.data.categories.length,
          cacheHit: false,
        },
      });
      
      console.log(`[spamhaus-enrich] Success: verdict=${result.data.verdict}, duration=${durationMs}ms`);
    } else {
      // Log failure to spamhaus_audit
      await logSpamhausAudit(supabase, {
        userId,
        scanId,
        inputType,
        inputValue: normalizedValue,
        action,
        cacheHit: false,
        success: false,
        errorCode: result.error.code,
      });
      
      // Log to scan_events
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase: any = createClient(supabaseUrl, supabaseKey);
      
      await logSpamhausAudit(supabase, {
        userId,
        scanId,
        inputType: 'unknown',
        inputValue: 'error',
        action: 'lookupIp',
        cacheHit: false,
        success: false,
        errorCode: 'internal_error',
      });
      
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
 * Log to spamhaus_audit table
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logSpamhausAudit(
  supabase: any,
  audit: {
    userId: string | null;
    scanId: string | null;
    inputType: string;
    inputValue: string;
    action: 'lookupIp' | 'lookupDomain' | 'passiveDns' | 'contentReputation';
    cacheHit: boolean;
    success: boolean;
    statusCode?: number;
    errorCode?: string;
  }
): Promise<void> {
  try {
    await supabase.from('spamhaus_audit').insert({
      user_id: audit.userId,
      scan_id: audit.scanId,
      input_type: audit.inputType,
      input_value: audit.inputValue,
      action: audit.action,
      cache_hit: audit.cacheHit,
      success: audit.success,
      status_code: audit.statusCode,
      error_code: audit.errorCode,
    });
  } catch (error) {
    console.error('[spamhaus-enrich] Failed to log audit:', error);
  }
}

/**
 * Log scan event to database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logScanEvent(
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
    case 'auth_required':
      return 401;
    case 'PRO_REQUIRED':
    case 'no_workspace':
      return 403;
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
