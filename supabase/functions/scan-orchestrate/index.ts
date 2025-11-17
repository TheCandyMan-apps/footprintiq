import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { createQueue } from '../_shared/queue.ts';
import { withCache } from '../_shared/cache.ts';
import { deduplicateFindings, sortFindings, type UFMFinding } from '../_shared/normalize.ts';

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

// Whitelist of allowed provider names (only implemented ones in provider-proxy)
const ALLOWED_PROVIDERS = new Set([
  'hibp', 'dehashed', 'clearbit', 'fullcontact',
  'censys', 'binaryedge', 'otx', 'shodan', 'virustotal',
  'securitytrails', 'urlscan',
  'apify-social', 'apify-osint', 'apify-darkweb',
  'maigret',
  'whatsmyname',
  'holehe',
  'gosearch',
]);

interface ScanRequest {
  scanId?: string;
  type: 'email' | 'username' | 'domain' | 'phone';
  value: string;
  workspaceId: string;
  options?: {
    includeDarkweb?: boolean;
    includeDating?: boolean;
    includeNsfw?: boolean;
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
        case 'business': return null; // unlimited
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

    // Check credits before scan
    const creditsRequired = options.includeDarkweb ? 10 : (options.includeDating || options.includeNsfw ? 5 : 1);
    const { data: creditsCheck } = await supabaseService
      .rpc('get_credits_balance', { _workspace_id: workspaceId });
    
    const currentBalance = creditsCheck || 0;
    if (currentBalance < creditsRequired) {
      return bad(402, `Insufficient credits. Required: ${creditsRequired}, Balance: ${currentBalance}`);
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

    // Build provider list with sensible defaults
    const DEFAULT_PROVIDERS: Record<ScanRequest['type'], string[]> = {
      email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
      username: ['maigret', 'whatsmyname', 'gosearch'], // All username OSINT tools
      domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
      phone: ['fullcontact']
    };

    let providers = options.providers && options.providers.length > 0 
      ? options.providers 
      : DEFAULT_PROVIDERS[type];

    // If user explicitly selected providers, validate them
    if (options.providers && options.providers.length > 0) {
      const invalidProviders = options.providers.filter(p => !ALLOWED_PROVIDERS.has(p));
      if (invalidProviders.length > 0) {
        console.warn('[orchestrate] Invalid providers ignored:', invalidProviders);
        // Filter out invalid providers instead of failing
        providers = options.providers.filter(p => ALLOWED_PROVIDERS.has(p));
      }
    }

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
      whatsmyname: ['username'],
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

    // Ensure we always have at least one provider
    if (providers.length === 0) {
      console.warn('[orchestrate] No compatible providers, using defaults');
      providers = DEFAULT_PROVIDERS[type];
    }

    // Note: Advanced sources (dating/nsfw/darkweb) rely on providers not yet supported directly.
    // We intentionally skip adding them here until proxy support is stable.

    // Create execution queue
    const queue = createQueue({ concurrency: 7, retries: 3 });
    const allFindings: UFMFinding[] = [];

    // Update initial progress
    await updateProgress({
      status: 'started',
      total_providers: providers.length,
      completed_providers: 0,
      current_providers: providers.slice(0, 7),
      message: 'Starting scan...'
    });

    let completedCount = 0;

    // Execute providers in parallel
    const tasks = providers.map((provider, index) => async () => {
      const cacheKey = `scan:${provider}:${type}:${value}`;
      
      console.log(`[orchestrate] Calling provider: ${provider} for ${type}:${value}`);
      
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

      // Log provider start event
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
      
      try {
        const result = await withCache(
          cacheKey,
          async () => {
            let findings = [];
            
            // Maigret provider calls dedicated edge function
            if (provider === 'maigret') {
              try {
                const { data, error } = await supabase.functions.invoke('providers-maigret', {
                  body: { usernames: [value], timeout: 60 }
                });
                
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
                console.log(`[orchestrate] Maigret returned ${findings.length} findings`);
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
              const { data, error } = await supabase.functions.invoke('provider-proxy', {
                body: { provider, target: value, type }
              });

              if (error) {
                console.error(`[orchestrate] Provider ${provider} error:`, error);
                throw error;
              }
              
              findings = data?.findings || [];
              console.log(`[orchestrate] Provider ${provider} returned ${findings.length} findings`);
            }
            
            return findings;
          },
          { ttlSeconds: 86400 }
        );
        
        completedCount++;
        
        // Broadcast provider success
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: 'success',
            message: `Completed ${provider}`,
            resultCount: result.length,
            completedProviders: completedCount,
            totalProviders: providers.length,
            findingsCount: allFindings.length + result.length
          }
        });

        // Log provider success event
        try {
          await supabaseService.from('scan_provider_events').insert({
            scan_id: scanId,
            provider,
            event: 'success',
            message: `Completed with ${result.length} results`,
            result_count: result.length
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
          findings_count: allFindings.length + result.length,
          message: `Completed ${provider} (${completedCount}/${providers.length})`
        });
        
        return result;
      } catch (error) {
        console.error(`[orchestrate] Provider ${provider} failed:`, error);
        completedCount++;
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Broadcast provider failure
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status: 'failed',
            message: `Failed: ${errorMessage}`,
            completedProviders: completedCount,
            totalProviders: providers.length
          }
        });

        // Log provider failed event
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
          message: `Failed ${provider} (${completedCount}/${providers.length})`
        });
        
        return []; // Continue with other providers
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

    // Persist findings (linked to scan_id)
    if (sortedFindings.length > 0 && scanId) {
      await supabaseService.from('findings').insert(
        sortedFindings.map(f => ({
          scan_id: scanId,
          workspace_id: workspaceId,
          provider: f.provider,
          kind: f.kind,
          severity: f.severity,
          confidence: f.confidence,
          observed_at: f.observedAt,
          evidence: f.evidence,
          meta: f.meta || {},
        }))
      );
      console.log(`[orchestrate] Persisted ${sortedFindings.length} findings for scan ${scanId}`);
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

      const { error: updateError } = await supabaseService
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
        .eq('id', scanId);
      
      if (updateError) {
        console.error('[orchestrate] Failed to update scan status:', updateError);
      } else {
        console.log(`[orchestrate] Scan ${scanId} updated to completed with ${sortedFindings.length} findings`);
        
        // Broadcast scan completion
        const completeChannel = supabaseService.channel(`scan_progress:${scanId}`);
        await completeChannel.send({
          type: 'broadcast',
          event: 'scan_complete',
          payload: {
            scanId,
            findingsCount: sortedFindings.length,
            status: 'completed'
          }
        });
        
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
    }

    // Deduct credits for the scan
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
    }

    const tookMs = Date.now() - startTime;

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
