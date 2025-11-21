import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { createQueue } from '../_shared/queue.ts';
import { withCache, cacheDelete } from '../_shared/cache.ts';
import { deduplicateFindings, sortFindings, type UFMFinding } from '../_shared/normalize.ts';
import { getPlan } from '../_shared/tiers.ts';
import { filterProvidersForPlan } from '../_shared/quotas.ts';
import { safeFetch, errorResponse, ERROR_RESPONSES, logSystemError } from '../_shared/errorHandler.ts';
import { authenticateRequest } from '../_shared/auth-utils.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';
import { IMPLEMENTED_PROVIDERS } from '../_shared/providerRegistry.ts';
import { sanitizeProviderData, sanitizeError } from '../_shared/sanitizeProviderResult.ts';
import { isProviderDisabled } from '../_shared/providerKillSwitch.ts';

/**
 * Normalize confidence values to 0-1 range for database storage.
 * Handles both 0-100 percentage values, already-normalized 0-1 values, 
 * and string confidence levels like "high", "medium", "low".
 * Provides defensive clamping and sensible defaults.
 */
function normalizeConfidence(value: number | string | undefined | null): number {
  // Handle missing/invalid values with sensible default
  if (value == null) {
    console.warn('[orchestrate] Missing confidence value, defaulting to 0.7');
    return 0.7;
  }
  
  // Handle string confidence levels (e.g., from Sherlock)
  if (typeof value === 'string') {
    const stringValue = value.toLowerCase();
    const stringMap: Record<string, number> = {
      'high': 0.9,
      'medium': 0.6,
      'low': 0.3,
    };
    
    if (stringMap[stringValue] !== undefined) {
      console.log(`[orchestrate] Mapped string confidence "${value}" to ${stringMap[stringValue]}`);
      return stringMap[stringValue];
    }
    
    // Try to parse as number if not a known string
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      value = parsed;
    } else {
      console.warn(`[orchestrate] Unknown string confidence "${value}", defaulting to 0.5`);
      return 0.5;
    }
  }
  
  // Handle NaN
  if (Number.isNaN(value)) {
    console.warn('[orchestrate] NaN confidence value, defaulting to 0.7');
    return 0.7;
  }
  
  let normalized = value as number;
  
  // If value is in 0-100 range (percentage), scale to 0-1
  if (normalized > 1) {
    console.log(`[orchestrate] Scaling confidence from ${normalized} to ${normalized / 100}`);
    normalized = normalized / 100;
  }
  
  // Defensive clamping to satisfy database CHECK constraint
  if (normalized < 0) {
    console.warn(`[orchestrate] Negative confidence ${value}, clamping to 0`);
    normalized = 0;
  }
  if (normalized > 1) {
    console.warn(`[orchestrate] Confidence ${value} exceeds 1, clamping to 1`);
    normalized = 1;
  }
  
  return normalized;
}

// Validation schema for scan requests
const ScanRequestSchema = z.object({
  scanId: z.string().uuid('invalid scan ID format').optional(),
  type: z.enum(['email', 'username', 'domain', 'phone'], {
    errorMap: () => ({ message: 'type must be email, username, domain, or phone' })
  }),
  value: z.string().trim().min(1, 'value cannot be empty').max(255, 'value too long'),
  workspaceId: z.string().uuid('invalid workspace ID format'),
  options: z.object({
    includeDarkweb: z.boolean().optional(),
    includeDating: z.boolean().optional(),
    includeNsfw: z.boolean().optional(),
    noCache: z.boolean().optional(),
    artifacts: z.array(z.string()).optional(),
    providers: z.array(
      z.string().regex(/^[a-z0-9-]+$/, 'invalid provider name format')
    ).max(20, 'too many providers specified').optional(),
    premium: z.object({
      socialMediaFinder: z.boolean().optional(),
      osintScraper: z.boolean().optional(),
      osintKeywords: z.array(z.string()).optional(),
      darkwebScraper: z.boolean().optional(),
      darkwebUrls: z.array(z.string()).optional(),
      darkwebSearch: z.string().optional(),
      darkwebDepth: z.number().optional(),
      darkwebPages: z.number().optional()
    }).optional()
  }).optional()
});

// Provider validation now uses the centralized registry

interface ScanRequest {
  scanId?: string;
  type: 'email' | 'username' | 'domain' | 'phone';
  value: string;
  workspaceId: string;
  options?: {
    includeDarkweb?: boolean;
    includeDating?: boolean;
    includeNsfw?: boolean;
    noCache?: boolean;
    artifacts?: string[];
    providers?: string[];
    premium?: {
      socialMediaFinder?: boolean;
      osintScraper?: boolean;
      osintKeywords?: string[];
      darkwebScraper?: boolean;
      darkwebUrls?: string[];
      darkwebSearch?: string;
      darkwebDepth?: number;
      darkwebPages?: number;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  // Authenticate user via JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return bad(401, 'missing_authorization_header');
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  try {
    // Use anon key for RLS-protected operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return bad(401, 'invalid_or_expired_token');
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const parseResult = ScanRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('[orchestrate] ❌ Validation failed:', {
        errors,
        receivedFields: Object.keys(rawBody),
        expectedFields: ['type', 'value', 'workspaceId'],
        receivedBody: rawBody
      });
      return bad(400, `Invalid request: ${errors}`);
    }

    const { scanId: providedScanId, type, value, workspaceId, options = {} } = parseResult.data;

    // Enhanced logging for username scans with provider info
    const requestedProviders = options.providers || [];
    console.log(`[orchestrate] Scanning ${type}:${value} for workspace ${workspaceId}`, {
      scanId: providedScanId,
      providers: requestedProviders.length > 0 ? requestedProviders : 'all-default',
      includeDarkweb: options.includeDarkweb,
      includeDating: options.includeDating,
      includeNsfw: options.includeNsfw
    });
    console.log('[orchestrate] Providers requested:', options.providers);

    // Use service role for workspace operations (initialize BEFORE any usage)
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is a member of the workspace
    const { data: membership, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      console.error('[orchestrate] Unauthorized workspace access:', {
        userId: user.id,
        workspaceId,
        memberError,
        membership
      });
      
      // Check if user is the workspace owner but not a member (data integrity issue)
      const { data: workspace } = await supabaseService
        .from('workspaces')
        .select('owner_id, name')
        .eq('id', workspaceId)
        .single();
        
      if (workspace?.owner_id === user.id) {
        console.error('[orchestrate] CRITICAL: Owner is not a workspace member!', {
          workspaceId,
          workspaceName: workspace.name,
          ownerId: user.id
        });
        return bad(500, 'data_integrity_error_owner_not_member_contact_support');
      }
      
      return bad(403, 'not_workspace_member_check_permissions');
    }

    // Get workspace with quota info
    const { data: workspace, error: workspaceError } = await supabaseService
      .from('workspaces')
      .select('id, subscription_tier, settings, plan, scans_used_monthly, scan_limit_monthly')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error('[orchestrate] Workspace query error:', {
        error: workspaceError,
        message: workspaceError?.message,
        details: workspaceError?.details,
        hint: workspaceError?.hint,
        code: workspaceError?.code
      });
      return bad(404, 'workspace_not_found');
    }

    // Helper to get default quota based on tier
    const getDefaultQuota = (tier: string): number | null => {
      switch (tier) {
        case 'free': return 10;
        case 'pro': return 100;
        case 'premium': return null; // unlimited
        case 'business': return null; // unlimited
        case 'enterprise': return null; // unlimited
        default: return 10;
      }
    };

    // Check monthly scan quota BEFORE checking credits (with fallbacks)
    const scanLimit = workspace.scan_limit_monthly ?? getDefaultQuota(workspace.subscription_tier || workspace.plan || 'free');
    const scansUsed = workspace.scans_used_monthly ?? 0;
    
    if (scanLimit !== null && scansUsed >= scanLimit) {
      console.log(`[orchestrate] Monthly scan limit reached: ${scansUsed}/${scanLimit}`);
      return bad(403, `Monthly scan limit reached (${scansUsed}/${scanLimit}). Upgrade your plan for more scans.`);
    }

    // Check credits before scan (bypass for premium/enterprise users)
    const premiumTiers = ['premium', 'pro', 'business', 'enterprise'];
    const userTier = (workspace.subscription_tier || workspace.plan || 'free').toLowerCase();
    const isPremium = premiumTiers.includes(userTier);
    
    // Calculate credits required (will be 0 for premium users)
    const creditsRequired = isPremium ? 0 : (options.includeDarkweb ? 10 : (options.includeDating || options.includeNsfw ? 5 : 1));
    
    if (!isPremium) {
      const { data: creditsCheck } = await supabaseService
        .rpc('get_credits_balance', { _workspace_id: workspaceId });
      
      const currentBalance = creditsCheck || 0;
      if (currentBalance < creditsRequired) {
        console.log(`[orchestrate] Insufficient credits: required=${creditsRequired}, balance=${currentBalance}`);
        return bad(402, `Insufficient credits. Required: ${creditsRequired}, Balance: ${currentBalance}. Purchase credits or upgrade to a premium plan for unlimited scans.`);
      }
      console.log(`[orchestrate] Credits check passed: required=${creditsRequired}, balance=${currentBalance}`);
    } else {
      console.log(`[orchestrate] Premium plan detected (${userTier}), bypassing credit check`);
    }

    // Check consent for sensitive sources
    if (options.includeDating || options.includeNsfw || options.includeDarkweb) {
      const { data: consent } = await supabaseService
        .from('sensitive_consents')
        .select('categories')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      const allowedCategories = consent?.categories || [];
      
      if (options.includeDating && !allowedCategories.includes('dating')) {
        return bad(403, 'dating_consent_required');
      }
      if (options.includeNsfw && !allowedCategories.includes('nsfw')) {
        return bad(403, 'nsfw_consent_required');
      }
      if (options.includeDarkweb && !allowedCategories.includes('darkweb')) {
        return bad(403, 'darkweb_consent_required');
      }
    }

    // Use provided scanId or generate a new one
    const scanId = providedScanId || crypto.randomUUID();
    console.log(`[orchestrate] Using scanId: ${scanId}`);
    
    // Create scan record - this MUST succeed before proceeding
    const scanTypeDb =
      type === 'username' ? 'username'
      : type === 'domain' ? 'domain'
      : type === 'phone' ? 'phone'
      : 'personal_details';

    const { error: scanError } = await supabaseService
      .from('scans')
      .upsert({
        id: scanId,
        user_id: user.id,
        workspace_id: workspaceId,
        scan_type: scanTypeDb as any,
        email: type === 'email' ? value : null,
        username: type === 'username' ? value : null,
        phone: type === 'phone' ? value : null,
        status: 'pending',
        provider_counts: {}
      } as any, {
        onConflict: 'id'
      });
    
    if (scanError) {
      console.error('[orchestrate] CRITICAL: Failed to create scan record:', scanError);
      return bad(500, `Failed to create scan record: ${scanError.message}. Please try again or contact support.`);
    }

    // Log scan lifecycle event: creation
    try {
      await supabaseService.from('scan_events').insert({
        scan_id: scanId,
        provider: 'system',
        stage: 'created',
        status: 'success',
        metadata: { type, value_length: value.length, workspaceId }
      });
    } catch (err) {
      console.error('[orchestrate] Failed to log lifecycle event (created):', err);
    }

    // Increment scans_used_monthly after successful scan creation
    const { error: updateError } = await supabaseService
      .from('workspaces')
      .update({
        scans_used_monthly: scansUsed + 1
      })
      .eq('id', workspaceId);

    if (updateError) {
      console.error('[orchestrate] Failed to increment scan counter:', updateError);
      // Don't fail the scan for this, but log it for monitoring
    } else {
      console.log(`[orchestrate] Incremented scan counter: ${scansUsed + 1}/${scanLimit || 'unlimited'}`);
    }

    // Helper function to update progress in database
    const updateProgress = async (payload: {
      status: string;
      total_providers?: number;
      completed_providers?: number;
      current_provider?: string;
      current_providers?: string[];
      findings_count?: number;
      message: string;
      error?: boolean;
    }) => {
      try {
        await supabaseService
          .from('scan_progress')
          .upsert({
            scan_id: scanId,
            ...payload,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'scan_id'
          });
      } catch (err) {
        console.error('[orchestrate] Failed to update progress:', err);
      }
    };

    // Build provider list with tier enforcement
    const plan = getPlan(workspace.plan || workspace.subscription_tier);
    const DEFAULT_PROVIDERS_BY_TIER: Record<ScanRequest['type'], string[]> = {
      email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
      username: plan.allowedProviders.filter(p => 
        ['maigret', 'sherlock', 'gosearch'].includes(p)
      ),
      domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
      phone: ['fullcontact']
    };

    let providers = options.providers && options.providers.length > 0 
      ? options.providers 
      : DEFAULT_PROVIDERS_BY_TIER[type];

    // Normalize legacy provider names (whatsmyname -> sherlock)
    providers = providers.map(p => p === 'whatsmyname' ? 'sherlock' : p);
    console.log('[orchestrate] Providers after normalization:', providers);

    // Split into known and unknown providers using the registry
    const knownProviders = providers.filter(p => IMPLEMENTED_PROVIDERS.has(p));
    const unknownProviders = providers.filter(p => !IMPLEMENTED_PROVIDERS.has(p));
    
    if (unknownProviders.length > 0) {
      console.warn('[orchestrate] Unknown providers skipped:', unknownProviders);
    }
    
    // Use only known providers for execution
    providers = knownProviders;

    // Enforce provider compatibility with scan type
    const providerTypeSupport: Record<string, Array<ScanRequest['type']>> = {
      hibp: ['email'],
      dehashed: ['email', 'username'],
      fullcontact: ['email', 'phone', 'domain'],
      clearbit: ['email', 'domain'],
      shodan: ['domain'],
      virustotal: ['domain'],
      securitytrails: ['domain'],
      urlscan: ['domain'],
      censys: ['domain'],
      binaryedge: ['domain'],
      otx: ['domain'],
      maigret: ['username'],
      sherlock: ['username'],
      whatsmyname: ['username'], // Legacy alias
      gosearch: ['username'],
      holehe: ['email'],
      'apify-social': ['username'],
      'apify-osint': ['email', 'username'],
      'apify-darkweb': ['email', 'username'],
    };
    
    const incompatible = providers.filter(p => !(providerTypeSupport[p]?.includes(type)));
    if (incompatible.length) {
      console.warn('[orchestrate] Dropping type-incompatible providers:', incompatible);
    }
    providers = providers.filter(p => providerTypeSupport[p]?.includes(type));
    console.log('[orchestrate] Providers after type compatibility filter:', providers);

    // ✅ Now update scan record with provider counts after providers are finalized
    try {
      const initialProviderCounts = providers.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
      
      await supabaseService
        .from('scans')
        .update({ provider_counts: initialProviderCounts })
        .eq('id', scanId);
        
      console.log('[orchestrate] Updated scan with provider_counts:', initialProviderCounts);
    } catch (e) {
      console.warn('[orchestrate] Failed to update provider_counts:', e);
    }

    // Ensure we always have at least one provider (will be tier-filtered after allFindings is declared)
    if (providers.length === 0) {
      console.warn('[orchestrate] No compatible providers, using defaults');
      providers = DEFAULT_PROVIDERS_BY_TIER[type];
    }

    // Note: Advanced sources (dating/nsfw/darkweb) rely on providers not yet supported directly.
    // We intentionally skip adding them here until proxy support is stable.

    // CRITICAL: Filter requested providers by tier allowance BEFORE creating queue
    const { allowed: allowedProviders, blocked } = filterProvidersForPlan(
      workspace.plan || workspace.subscription_tier,
      providers
    );

    // Create execution queue
    const queue = createQueue({ concurrency: 7, retries: 3 });
    const allFindings: UFMFinding[] = [];
    
    if (blocked.length > 0) {
      console.warn('[orchestrate] Blocked providers for tier:', blocked);
      // Add informational finding about blocked providers
      const blockedFinding: UFMFinding = {
        provider: 'system',
        kind: 'tier_restriction',
        severity: 'info',
        confidence: 1.0,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'blocked_providers', value: blocked.join(', ') },
          { key: 'upgrade_required', value: plan.id === 'free' ? 'Pro or Business' : 'Business' },
          { key: 'message', value: `${blocked.join(', ')} requires ${plan.id === 'free' ? 'Pro or Business' : 'Business'} plan` }
        ]
      };
      allFindings.push(blockedFinding);
    }

    providers = allowedProviders;

    // Ensure we have at least one provider after tier filtering
    if (providers.length === 0) {
      console.error('[orchestrate] Critical: No providers available after tier filtering!');
      const errorData = {
        error: 'no_providers_available_for_tier',
        blockedProviders: blocked,
        allowedProviders: allowedProviders,
        currentPlan: workspace.plan || workspace.subscription_tier || 'free',
        message: 'The selected providers are not available on your current plan. Please select an allowed provider or upgrade your plan.'
      };
      return new Response(JSON.stringify(errorData), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" }
      });
    }

    // Update initial progress
    await updateProgress({
      status: 'started',
      total_providers: providers.length,
      completed_providers: 0,
      current_providers: providers.slice(0, 7),
      message: 'Starting scan...'
    });

    // Log scan lifecycle event: orchestration started
    try {
      await supabaseService.from('scan_events').insert({
        scan_id: scanId,
        provider: 'orchestrator',
        stage: 'started',
        status: 'running',
        metadata: { 
          total_providers: providers.length,
          providers: providers.join(',')
        }
      });
    } catch (err) {
      console.error('[orchestrate] Failed to log lifecycle event (started):', err);
    }

    let completedCount = 0;
    const PROVIDER_TIMEOUT_MS = 45000; // 45 second safety cap per provider

    // Helper to log scan events for observability
    const logEvent = async (event: {
      provider: string;
      stage: string;
      status?: string;
      duration_ms?: number;
      error_message?: string;
      metadata?: any;
    }) => {
      try {
        await supabaseService.from('scan_events').insert({
          scan_id: scanId,
          ...event,
          metadata: event.metadata || {}
        });
      } catch (err) {
        console.warn('[orchestrate] Failed to log event:', err);
      }
    };

    // Helper for provider timeout wrapper
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`timeout_${timeoutMs}ms`)), timeoutMs)
        )
      ]);
    };

    // Helper for retry-once wrapper for flaky providers
    const attemptWithRetry = async <T>(fn: () => Promise<T>, label: string): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        console.warn(`[orchestrate] ${label} failed, retrying once:`, err);
        return await fn();
      }
    };

    // Execute providers in parallel
    const tasks = providers.map((provider, index) => async () => {
      const providerStartTime = Date.now();
      
      // Check kill-switch first
      if (isProviderDisabled(provider)) {
        console.warn(`[orchestrate] Provider ${provider} is disabled via kill-switch`);
        await logEvent({
          provider,
          stage: 'skipped',
          status: 'disabled',
          duration_ms: 0,
          error_message: 'Provider disabled via DISABLED_PROVIDERS environment variable'
        });
        return [{
          provider,
          kind: 'provider.disabled',
          severity: 'info',
          confidence: 1.0,
          observedAt: new Date().toISOString(),
          evidence: [{ key: 'message', value: 'Provider temporarily disabled' }]
        }];
      }
      
      const cacheKey = `scan:${provider}:${type}:${value}`;
      const noCache = options?.noCache ?? false;
      
      if (noCache) {
        console.log(`[orchestrate] CACHE_BYPASS for ${provider}:${type}:${value}`);
        await cacheDelete(cacheKey);
      }
      
      console.log(`[orchestrate] Calling provider: ${provider} for ${type}:${value}`);
      
      // Log provider requested event
      await logEvent({
        provider,
        stage: 'requested',
        status: 'pending'
      });
      
      // Broadcast provider start
      const channel = supabaseService.channel(`scan_progress:${scanId}`);
      await channel.send({
        type: 'broadcast',
        event: 'provider_update',
        payload: {
          provider,
          status: 'loading',
          message: `Querying ${provider}...`,
          completedProviders: completedCount,
          totalProviders: providers.length
        }
      });

      // Log provider start event (legacy)
      try {
        await supabaseService.from('scan_provider_events').insert({
          scan_id: scanId,
          provider,
          event: 'start',
          message: `Starting ${provider}`,
          result_count: 0
        });
      } catch (e) {
        console.warn('[orchestrate] Failed to log start event:', e);
      }
      
      // Update provider start
      await updateProgress({
        status: 'processing',
        total_providers: providers.length,
        completed_providers: completedCount,
        current_provider: provider,
        current_providers: [provider],
        message: `Querying ${provider}...`
      });
      
      // Log provider started event
      await logEvent({
        provider,
        stage: 'started',
        status: 'running'
      });
      
      try {
        // Bypass cache if noCache option is set
        const executeProvider = async () => {
            let findings = [];
            
            // Maigret provider calls dedicated edge function
            if (provider === 'maigret') {
              try {
                const startTime = Date.now();
                console.log(`[orchestrate] Calling Maigret for username: "${value}"`);
                
                const { data, error } = await supabase.functions.invoke('providers-maigret', {
                  body: { usernames: [value], timeout: 60, workspaceId, scanId }
                });
                
                const elapsed = Date.now() - startTime;
                console.log(`[orchestrate] Maigret responded in ${elapsed}ms`);
                
                if (error) {
                  console.error(`[orchestrate] Maigret provider error:`, error);
                  // Return informational finding instead of throwing
                  return [{
                    type: 'info',
                    title: 'Maigret provider unavailable',
                    severity: 'info',
                    provider: 'maigret',
                    confidence: 1.0,
                    evidence: { message: 'Service temporarily unavailable' }
                  }];
                }
                
                findings = data?.findings || [];
                console.log(`[orchestrate] Maigret returned ${findings.length} findings for "${value}"`);
                
                // Log warning if 0 results
                if (findings.length === 0) {
                  console.warn(`[orchestrate] ⚠️ Maigret returned 0 findings for username: "${value}" (took ${elapsed}ms)`);
                  console.log(`[orchestrate] Raw Maigret response:`, JSON.stringify(data));
                }
              } catch (maigretError) {
                console.error(`[orchestrate] Maigret exception:`, maigretError);
                return [{
                  type: 'info',
                  title: 'Maigret provider unavailable',
                  severity: 'info',
                  provider: 'maigret',
                  confidence: 1.0,
                  evidence: { message: 'Service temporarily unavailable' }
                }];
              }
            } else {
              // Call other providers through the unified proxy
              const startTime = Date.now();
              console.log(`[orchestrate] Calling ${provider} for ${type}: "${value}"`);
              
              const { data, error } = await supabase.functions.invoke('provider-proxy', {
                body: { provider, target: value, type }
              });
              
              const elapsed = Date.now() - startTime;
              console.log(`[orchestrate] ${provider} responded in ${elapsed}ms`);

              if (error) {
                console.error(`[orchestrate] Provider ${provider} error:`, error);
                // Return informational finding instead of throwing to allow scan to continue
                return [{
                  type: 'info',
                  title: `${provider} provider unavailable`,
                  severity: 'info',
                  provider: provider,
                  confidence: 1.0,
                  evidence: { 
                    message: 'Service temporarily unavailable',
                    error: error.message || 'Unknown error'
                  }
                }];
              }
              
              findings = data?.findings || [];
              console.log(`[orchestrate] ${provider} returned ${findings.length} findings for "${value}"`);
              
              // Log warning if 0 results
              if (findings.length === 0) {
                console.warn(`[orchestrate] ⚠️ ${provider} returned 0 findings for ${type}: "${value}" (took ${elapsed}ms)`);
                console.log(`[orchestrate] Raw ${provider} response:`, JSON.stringify(data));
              }
            }
            
            return findings;
        };
        
        // Wrap with timeout and retry logic
        const executeWithSafety = async () => {
          const cachedOrFreshExecution = noCache 
            ? executeProvider
            : () => withCache(cacheKey, executeProvider, { ttlSeconds: 86400 });
          
          // Apply retry wrapper first, then timeout wrapper
          return await withTimeout(
            attemptWithRetry(cachedOrFreshExecution, `${provider}`),
            PROVIDER_TIMEOUT_MS,
            `${provider}`
          );
        };
        
        const result = await executeWithSafety();
        
        // Sanitize results before storing
        const sanitizedResult = result.map((finding: any) => ({
          ...finding,
          evidence: sanitizeProviderData(finding.evidence),
          meta: sanitizeProviderData(finding.meta)
        }));
        
        const providerDuration = Date.now() - providerStartTime;
        completedCount++;
        
        // Log provider completed event
        await logEvent({
          provider,
          stage: 'completed',
          status: 'success',
          duration_ms: providerDuration,
          metadata: { result_count: sanitizedResult.length }
        });
        
        // Broadcast provider success
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: 'success',
            message: `Completed ${provider}`,
            resultCount: sanitizedResult.length,
            completedProviders: completedCount,
            totalProviders: providers.length,
            findingsCount: allFindings.length + sanitizedResult.length
          }
        });

        // Log provider success event (legacy)
        try {
          await supabaseService.from('scan_provider_events').insert({
            scan_id: scanId,
            provider,
            event: 'success',
            message: `Completed with ${sanitizedResult.length} results`,
            result_count: sanitizedResult.length
          });
        } catch (e) {
          console.warn('[orchestrate] Failed to log success event:', e);
        }
        
        // Update provider completion
        await updateProgress({
          status: 'processing',
          total_providers: providers.length,
          completed_providers: completedCount,
          current_provider: provider,
          findings_count: allFindings.length + sanitizedResult.length,
          message: `Completed ${provider} (${completedCount}/${providers.length})`
        });
        
        return sanitizedResult;
      } catch (error) {
        const providerDuration = Date.now() - providerStartTime;
        console.error(`[orchestrate] Provider ${provider} failed:`, error);
        completedCount++;
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isTimeout = errorMessage.includes('timeout');
        const stage = isTimeout ? 'timeout' : 'failed';
        const status = isTimeout ? 'timeout' : 'failed';
        
        // Log provider failure/timeout event
        await logEvent({
          provider,
          stage,
          status,
          duration_ms: providerDuration,
          error_message: sanitizeError(error).message,
          metadata: { code: sanitizeError(error).code }
        });
        
        // Broadcast provider failure
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: 'failed',
            message: isTimeout ? `Timed out after ${PROVIDER_TIMEOUT_MS}ms` : `Failed: ${errorMessage}`,
            completedProviders: completedCount,
            totalProviders: providers.length
          }
        });

        // Log provider failed event (legacy)
        try {
          await supabaseService.from('scan_provider_events').insert({
            scan_id: scanId,
            provider,
            event: 'failed',
            message: errorMessage,
            result_count: 0,
            error: { message: errorMessage }
          });
        } catch (e) {
          console.warn('[orchestrate] Failed to log failed event:', e);
        }
        
        // Update provider error
        await updateProgress({
          status: 'processing',
          total_providers: providers.length,
          completed_providers: completedCount,
          current_provider: provider,
          error: true,
          message: isTimeout 
            ? `Timed out ${provider} (${completedCount}/${providers.length})`
            : `Failed ${provider} (${completedCount}/${providers.length})`
        });
        
        // Return informational finding about failure (provider-level fault isolation)
        return [{
          type: 'info',
          title: isTimeout ? `${provider} scan timed out` : `${provider} scan failed`,
          description: isTimeout 
            ? `Provider ${provider} exceeded ${PROVIDER_TIMEOUT_MS / 1000}s timeout`
            : `Provider ${provider} encountered an error and was skipped`,
          severity: 'info',
          provider: provider,
          kind: isTimeout ? 'provider.timeout' : 'provider.failed',
          confidence: 1.0,
          evidence: [{ 
            key: 'reason', 
            value: sanitizeError(error).message 
          }],
          observedAt: new Date().toISOString()
        }];
      }
    });

    const results = await queue.addAll(tasks);
    
    // Collect successful results
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allFindings.push(...result.value);
      }
    }

    // Update completion of standard providers
    await updateProgress({
      status: 'aggregating',
      total_providers: providers.length,
      completed_providers: providers.length,
      message: 'Processing findings...'
    });

    // === Premium Apify actors (if enabled in options) ===
    const premium = options?.premium;
    if (premium && (premium.socialMediaFinder || premium.osintScraper || premium.darkwebScraper)) {
      console.log('[orchestrate] Running premium Apify actors...');
      
      await updateProgress({
        status: 'premium',
        message: 'Running premium searches...'
      });
      
      const callApify = async (actorSlug: string, payload: any, label: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('apify-run', {
            body: {
              workspaceId,
              actorSlug,
              payload,
            },
          });
          
          if (error) {
            console.error(`[orchestrate] ${label} error:`, error);
            return;
          }
          
          if (data?.findings?.length) {
            allFindings.push(...data.findings);
            console.log(`[orchestrate] ${label}: ${data.findings.length} findings`);
          }
          
          if (data?.debited) {
            console.log(`[orchestrate] ${label}: ${data.debited} credits debited`);
          }
        } catch (e) {
          console.error(`[orchestrate] ${label} exception:`, e);
        }
      };

      // Social Media Finder
      if (premium.socialMediaFinder && value) {
        await callApify('xtech/social-media-finder-pro', { username: value }, 'apify:social-media-finder-pro');
      }
      
      // OSINT Scraper
      if (premium.osintScraper && premium.osintKeywords?.length) {
        await callApify('epctex/osint-scraper', {
          searchKeywords: premium.osintKeywords,
          codepad: true,
          githubgist: true,
          ideone: true,
          pastebin: true,
          pasteorg: true,
          textbin: true,
          proxy: { useApifyProxy: true },
        }, 'apify:osint-scraper');
      }
      
      // Dark Web Scraper
      if (premium.darkwebScraper && (premium.darkwebUrls?.length || premium.darkwebSearch)) {
        await callApify('epctex/darkweb-scraper', {
          startUrls: premium.darkwebUrls ?? [],
          search: premium.darkwebSearch ?? '',
          maxDepth: premium.darkwebDepth ?? 3,
          maxPages: premium.darkwebPages ?? 10,
        }, 'apify:darkweb-scraper');
      }
    }

    // Deduplicate and sort
    const uniqueFindings = deduplicateFindings(allFindings);
    const sortedFindings = sortFindings(uniqueFindings);

    // Add informational finding if no results
    if (sortedFindings.length === 0) {
      sortedFindings.push({
        provider: 'system',
        kind: 'info.no_hits',
        severity: 'info',
        confidence: 1,
        observedAt: new Date().toISOString(),
        evidence: [{ 
          key: 'message', 
          value: 'No results found across selected providers. Try different providers or premium sources.' 
        }],
      });
    }

    // Wrap finalization in try/catch/finally to ensure scan always completes
    try {
      // Persist findings (linked to scan_id)
      if (sortedFindings.length > 0 && scanId) {
        // Sanitize severity values to ensure DB constraint compliance
        const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
        const sanitizedFindings = sortedFindings.map(f => {
          let severity = f.severity;
          if (!VALID_SEVERITIES.includes(severity)) {
            console.warn(`[orchestrate] Invalid severity '${severity}' for finding, coercing to 'info'`, f);
            severity = 'info';
          }
          return {
            scan_id: scanId,
            workspace_id: workspaceId,
            provider: f.provider,
            kind: f.kind,
            severity: severity,
            confidence: normalizeConfidence(f.confidence),
            observed_at: f.observedAt,
            evidence: f.evidence,
            meta: f.meta || {},
          };
        });

        const { error: insertError } = await supabaseService.from('findings').insert(sanitizedFindings);
        
        if (insertError) {
          console.error(`[orchestrate] CRITICAL: Failed to persist findings:`, insertError);
          throw new Error(`Failed to persist findings: ${insertError.message}`);
        }
        
        console.log(`[orchestrate] Successfully persisted ${sortedFindings.length} findings for scan ${scanId}`);
      }

      // Update scan record with results, stats, and completed status
      if (scanId) {
        const highRiskCount = sortedFindings.filter(f => f.severity === 'high').length;
        const mediumRiskCount = sortedFindings.filter(f => f.severity === 'medium').length;
        const lowRiskCount = sortedFindings.filter(f => f.severity === 'low').length;
        const privacyScore = Math.max(0, Math.min(100, 100 - (highRiskCount * 10 + mediumRiskCount * 5 + lowRiskCount * 2)));
        
        // Calculate provider counts
        const providerCounts = sortedFindings.reduce((acc, f) => {
          acc[f.provider] = (acc[f.provider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log(`[orchestrate] UPDATING scans table for ${scanId} to completed with ${sortedFindings.length} findings`);
        
        const { data: updateResult, error: updateError } = await supabaseService
          .from('scans')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            high_risk_count: highRiskCount,
            medium_risk_count: mediumRiskCount,
            low_risk_count: lowRiskCount,
            privacy_score: privacyScore,
            total_sources_found: sortedFindings.length,
            provider_counts: providerCounts
          } as any)
          .eq('id', scanId)
          .select();
        
        if (updateError) {
          console.error('[orchestrate] CRITICAL: Failed to update scan status:', updateError);
          await logSystemError(
            supabaseService,
            'SCAN_UPDATE_FAILED',
            `Failed to update scans table: ${updateError.message}`,
            {
              functionName: 'scan-orchestrate',
              scanId,
              workspaceId,
              severity: 'error',
              metadata: { sortedFindingsCount: sortedFindings.length, providerCounts }
            }
          );
          throw updateError;
        }
        
        if (!updateResult || updateResult.length === 0) {
          const errorMsg = `Update returned 0 rows for scan ${scanId} - scan may not exist or RLS blocked update`;
          console.error(`[orchestrate] CRITICAL: ${errorMsg}`);
          await logSystemError(
            supabaseService,
            'SCAN_UPDATE_NO_ROWS',
            errorMsg,
            {
              functionName: 'scan-orchestrate',
              scanId,
              workspaceId,
              severity: 'critical',
              metadata: { sortedFindingsCount: sortedFindings.length, providerCounts }
            }
          );
          throw new Error(errorMsg);
        }
        
        console.log(`[orchestrate] ✓ Scan ${scanId} successfully updated to completed with ${sortedFindings.length} findings, ${Object.keys(providerCounts).length} providers`);
        
        // Trigger webhooks for scan completion
        try {
          const eventType = highRiskCount > 0 ? 'findings.critical' : 'scan.completed';
          await supabaseService.functions.invoke('webhook-delivery', {
            body: {
              action: 'trigger',
              eventType,
              eventId: scanId,
              payload: {
                scanId,
                type,
                value,
                status: 'completed',
                completedAt: new Date().toISOString(),
                findings: {
                  total: sortedFindings.length,
                  critical: highRiskCount,
                  high: mediumRiskCount,
                  medium: lowRiskCount,
                },
                privacyScore,
                topFindings: sortedFindings.slice(0, 5).map((f: any) => ({
                  title: f.title || 'No title',
                  severity: f.severity,
                  provider: f.provider,
                  category: f.category || 'Uncategorized',
                })),
              },
            },
          });
          console.log(`[orchestrate] Webhooks triggered for scan ${scanId}`);
        } catch (webhookError) {
          console.error('[orchestrate] Failed to trigger webhooks:', webhookError);
          // Don't fail the scan if webhooks fail
        }
      }
    } catch (finalizationError) {
      console.error('[orchestrate] CRITICAL: Finalization failed:', finalizationError);
      
      // Ensure scan is marked as error, not left pending
      if (scanId) {
        try {
          await supabaseService
            .from('scans')
            .update({
              status: 'error',
              completed_at: new Date().toISOString(),
              error_message: finalizationError instanceof Error ? finalizationError.message : 'Finalization failed'
            } as any)
            .eq('id', scanId);
          console.log(`[orchestrate] Scan ${scanId} marked as error due to finalization failure`);
        } catch (updateErr) {
          console.error('[orchestrate] Could not update scan to error state:', updateErr);
        }
      }
      
      throw finalizationError;
    } finally {
      // Always broadcast terminal event and update progress, regardless of success/failure
      if (scanId) {
        const providerCounts = sortedFindings.reduce((acc, f) => {
          acc[f.provider] = (acc[f.provider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        try {
          await updateProgress({
            status: 'completed',
            total_providers: providers.length,
            completed_providers: providers.length,
            findings_count: sortedFindings.length,
            message: `Scan complete: ${sortedFindings.length} findings from ${providers.length} providers`
          });
          
          // Broadcast final scan_complete event
          const completeChannel = supabaseService.channel(`scan_progress:${scanId}`);
          await completeChannel.send({
            type: 'broadcast',
            event: 'scan_complete',
            payload: {
              scanId,
              totalProviders: providers.length,
              findingsCount: sortedFindings.length,
              providerCounts,
              status: 'completed'
            }
          });
          
          console.log(`[orchestrate] Terminal broadcast sent for scan ${scanId}`);
        } catch (broadcastErr) {
          console.error('[orchestrate] Failed to send terminal broadcast:', broadcastErr);
        }

        // Auto-generate artifacts if requested
        if (options?.artifacts && Array.isArray(options.artifacts) && options.artifacts.length > 0) {
          console.log(`[orchestrate] Triggering artifact generation for scan ${scanId}`);
          try {
            supabaseService.functions.invoke('generate-export-artifacts', {
              body: { scanId, artifacts: options.artifacts }
            }).catch(artifactErr => {
              console.error('[orchestrate] Artifact generation failed (non-blocking):', artifactErr);
            });
          } catch (artifactErr) {
            console.error('[orchestrate] Failed to trigger artifact generation:', artifactErr);
          }
        }

        // Reconcile maigret_results status if needed
        try {
          const { data: maigretResult, error: fetchErr } = await supabaseService
            .from('maigret_results')
            .select('status')
            .eq('job_id', scanId)
            .maybeSingle();
          
          if (fetchErr) {
            console.error('[orchestrate] Error fetching maigret_results for reconciliation:', fetchErr);
          } else if (maigretResult) {
            console.log(`[orchestrate] Found maigret_results row with status: ${maigretResult.status}`);
            
            if (maigretResult.status === 'failed') {
              console.log(`[orchestrate] Reconciling maigret_results status from 'failed' to 'completed' for scan ${scanId}`);
              const { error: updateErr } = await supabaseService
                .from('maigret_results')
                .update({ status: 'completed' })
                .eq('job_id', scanId);
              
              if (updateErr) {
                console.error('[orchestrate] Failed to update maigret_results status:', updateErr);
              } else {
                console.log('[orchestrate] Successfully reconciled maigret_results status to completed');
              }
            } else {
              console.log(`[orchestrate] maigret_results status already '${maigretResult.status}', no reconciliation needed`);
            }
          } else {
            console.warn(`[orchestrate] No maigret_results row found for job_id: ${scanId}`);
          }
        } catch (reconcileErr) {
          console.error('[orchestrate] Failed to reconcile maigret_results status:', reconcileErr);
        }
      }
    }

    // Deduct credits for the scan (only if not premium)
    if (creditsRequired > 0) {
      const { error: creditsError } = await supabaseService
        .from('credits_ledger')
        .insert({
          workspace_id: workspaceId,
          delta: -creditsRequired,
          reason: 'darkweb_scan',
          ref_id: scanId || null
        });

      if (creditsError) {
        console.error('[orchestrate] Failed to deduct credits:', creditsError);
      } else {
        console.log(`[orchestrate] Deducted ${creditsRequired} credits for scan ${scanId}`);
      }
    } else {
      console.log(`[orchestrate] Premium user - no credits deducted for scan ${scanId}`);
    }

    const tookMs = Date.now() - startTime;

    // Check for timeout (> 5 minutes)
    if (tookMs > TIMEOUT_MS) {
      console.warn(`[orchestrate] ⚠️ Scan exceeded timeout: ${tookMs}ms > ${TIMEOUT_MS}ms`);
      
      // Mark scan as timeout
      await supabaseService
        .from('scans')
        .update({
          status: 'timeout',
          completed_at: new Date().toISOString()
        })
        .eq('id', scanId);
      
      // Log timeout to system_errors
      await supabaseService.from('system_errors').insert({
        error_code: 'SCAN_TIMEOUT',
        error_message: `Scan exceeded ${TIMEOUT_MS / 60000} minute timeout`,
        function_name: 'scan-orchestrate',
        scan_id: scanId,
        workspace_id: workspaceId,
        user_id: user.id,
        severity: 'warn',
        metadata: { durationMs: tookMs, timeoutMs: TIMEOUT_MS }
      });
      
      return bad(408, `Scan timed out after ${Math.floor(tookMs / 60000)} minutes`);
    }

    console.log(`[orchestrate] Completed in ${tookMs}ms: ${sortedFindings.length} findings`);

    // Update final completion
    await updateProgress({
      status: 'completed',
      total_providers: providers.length,
      completed_providers: providers.length,
      findings_count: sortedFindings.length,
      message: `Scan completed with ${sortedFindings.length} findings`,
      current_providers: []
    });

    return ok({
      scanId,
      counts: {
        total: sortedFindings.length,
        bySeverity: sortedFindings.reduce((acc, f) => {
          acc[f.severity] = (acc[f.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byProvider: sortedFindings.reduce((acc, f) => {
          acc[f.provider] = (acc[f.provider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      tookMs,
      findings: sortedFindings,
    });

  } catch (error) {
    console.error('[orchestrate] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
