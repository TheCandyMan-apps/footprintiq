import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { createQueue } from '../_shared/queue.ts';
import { withCache } from '../_shared/cache.ts';
import { deduplicateFindings, sortFindings, type UFMFinding } from '../_shared/normalize.ts';

// Validation schema for scan requests
const ScanRequestSchema = z.object({
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
    ).max(20, 'too many providers specified').optional()
  }).optional()
});

// Whitelist of allowed provider names
const ALLOWED_PROVIDERS = new Set([
  'hibp', 'intelx', 'dehashed', 'hunter', 'urlscan',
  'apify-social', 'apify-osint', 'apify-darkweb',
  'username-extended', 'predicta', 'facecheck',
  'fullcontact', 'pipl', 'clearbit', 'shodan'
]);

interface ScanRequest {
  type: 'email' | 'username' | 'domain' | 'phone';
  value: string;
  workspaceId: string;
  options?: {
    includeDarkweb?: boolean;
    includeDating?: boolean;
    includeNsfw?: boolean;
    providers?: string[];
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
      console.error('[orchestrate] Validation failed:', errors);
      return bad(400, `Invalid request: ${errors}`);
    }

    const { type, value, workspaceId, options = {} } = parseResult.data;

    // Verify user is a member of the workspace
    const { data: membership, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      console.error('[orchestrate] Unauthorized workspace access:', user.id, workspaceId);
      return bad(403, 'not_workspace_member');
    }

    console.log(`[orchestrate] Scanning ${type}:${value} for workspace ${workspaceId}`);

    // Use service role for workspace operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check credits before scan
    const creditsRequired = options.includeDarkweb ? 10 : (options.includeDating || options.includeNsfw ? 5 : 1);
    const { data: creditsCheck } = await supabaseService
      .rpc('get_credits_balance', { _workspace_id: workspaceId });
    
    const currentBalance = creditsCheck || 0;
    if (currentBalance < creditsRequired) {
      return bad(402, `Insufficient credits. Required: ${creditsRequired}, Balance: ${currentBalance}`);
    }

    const { data: workspace, error: workspaceError } = await supabaseService
      .from('workspaces')
      .select('id, subscription_tier, settings')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error('[orchestrate] Workspace query error:', workspaceError);
      return bad(404, 'workspace_not_found');
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

    // Create scan record with pending status
    let scanId: string | null = null;
    try {
      // Map request type to DB enum with fallback
      const scanTypeDb =
        type === 'username' ? 'username'
        : type === 'domain' ? 'domain'
        : type === 'phone' ? 'phone'
        : 'personal_details';

      const { data: scan, error: scanError } = await supabaseService
        .from('scans')
        .insert({
          user_id: user.id,
          scan_type: scanTypeDb as any,
          email: type === 'email' ? value : null,
          username: type === 'username' ? value : null,
          phone: type === 'phone' ? value : null,
          status: 'pending',
          provider_counts: {}
        } as any)
        .select('id')
        .single();
      if (scanError) {
        console.warn('[orchestrate] Failed to create scan record:', scanError);
      } else {
        scanId = (scan as any).id;
      }
    } catch (e) {
      console.warn('[orchestrate] Exception creating scan record:', e);
    }

    // Build provider list - only use providers backed by dedicated functions
    const SUPPORTED_FUNCTION_PROVIDERS = new Set(['hibp','dehashed','fullcontact','clearbit','shodan','pipl','intelx']);
    const defaultProvidersByType: Record<ScanRequest['type'], string[]> = {
      email: ['hibp','dehashed','fullcontact','pipl','clearbit'],
      domain: ['shodan','clearbit','fullcontact'],
      username: ['dehashed','pipl','intelx'],
      phone: ['pipl']
    };

    let providers = options.providers ?? defaultProvidersByType[type];

    // If user explicitly selected providers, validate, otherwise use defaults by type
    if (options.providers) {
      // Validate all provider names against whitelist
      const invalidProviders = options.providers.filter(p => !ALLOWED_PROVIDERS.has(p));
      if (invalidProviders.length > 0) {
        console.error('[orchestrate] Invalid providers:', invalidProviders);
        return bad(400, `Invalid providers: ${invalidProviders.join(', ')}`);
      }
      providers = options.providers;
    } else {
      providers = defaultProvidersByType[type];
    }

    // Filter out providers that are not supported via dedicated functions
    const unsupported = providers.filter(p => !SUPPORTED_FUNCTION_PROVIDERS.has(p));
    if (unsupported.length) {
      console.warn('[orchestrate] Dropping unsupported providers:', unsupported);
    }
    providers = providers.filter(p => SUPPORTED_FUNCTION_PROVIDERS.has(p));

    // Enforce provider compatibility with scan type
    const providerTypeSupport: Record<string, Array<ScanRequest['type']>> = {
      hibp: ['email'],
      dehashed: ['email', 'username'],
      fullcontact: ['email', 'domain'],
      clearbit: ['email', 'domain'],
      shodan: ['domain'],
      pipl: ['email', 'phone', 'username'],
      intelx: ['email', 'username', 'domain'],
    };
    const incompatible = providers.filter(p => !(providerTypeSupport[p]?.includes(type)));
    if (incompatible.length) {
      console.warn('[orchestrate] Dropping type-incompatible providers:', incompatible);
    }
    providers = providers.filter(p => providerTypeSupport[p]?.includes(type));

    // Note: Advanced sources (dating/nsfw/darkweb) rely on providers not yet supported directly.
    // We intentionally skip adding them here until proxy support is stable.

    // Create execution queue
    const queue = createQueue({ concurrency: 7, retries: 3 });
    const allFindings: UFMFinding[] = [];

    // Execute providers in parallel
    const tasks = providers.map(provider => async () => {
      const cacheKey = `scan:${provider}:${type}:${value}`;
      
      console.log(`[orchestrate] Calling provider: ${provider} for ${type}:${value}`);
      
      try {
        return await withCache(
          cacheKey,
          async () => {
            // Call provider through the unified proxy to avoid missing function deployments
            const { data, error } = await supabase.functions.invoke('provider-proxy', {
              body: { provider, target: value, type }
            });

            if (error) {
              console.error(`[orchestrate] Provider ${provider} error:`, error);
              throw error;
            }
            
            const findings = data?.findings || [];
            console.log(`[orchestrate] Provider ${provider} returned ${findings.length} findings`);
            return findings;
          },
          { ttlSeconds: 86400 }
        );
      } catch (error) {
        console.error(`[orchestrate] Provider ${provider} failed:`, error);
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

    // === Premium Apify actors (if enabled in options) ===
    const premium = body.options?.premium;
    if (premium && (premium.socialMediaFinder || premium.osintScraper || premium.darkwebScraper)) {
      console.log('[orchestrate] Running premium Apify actors...');
      
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

    // Persist findings
    if (sortedFindings.length > 0) {
      await supabaseService.from('findings').insert(
        sortedFindings.map(f => ({
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

      await supabaseService
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
    }

    // Deduct credits for the scan
    const { error: creditsError } = await supabaseService
      .from('credits_ledger')
      .insert({
        workspace_id: workspaceId,
        delta: -creditsRequired,
        reason: 'scan',
        ref_id: scanId || null
      });

    if (creditsError) {
      console.error('[orchestrate] Failed to deduct credits:', creditsError);
    }

    const tookMs = Date.now() - startTime;

    console.log(`[orchestrate] Completed in ${tookMs}ms: ${sortedFindings.length} findings`);

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
