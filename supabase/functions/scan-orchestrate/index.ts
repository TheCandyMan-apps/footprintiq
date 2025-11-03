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

    // Check workspace limits and consent
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, plan, settings')
      .eq('id', workspaceId)
      .single();

    if (!workspace) {
      return bad(404, 'workspace_not_found');
    }

    // Check consent for sensitive sources
    if (options.includeDating || options.includeNsfw || options.includeDarkweb) {
      const { data: consent } = await supabase
        .from('sensitive_consents')
        .select('categories')
        .eq('workspace_id', workspaceId)
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

    // Build provider list
    const standardProviders = ['hibp', 'intelx', 'dehashed', 'hunter', 'urlscan'];
    const apifyProviders = ['apify-social', 'apify-osint'];
    const darkwebProviders = ['apify-darkweb'];

    let providers = options.providers || standardProviders;

    // Add Apify actors if selected
    if (options.providers) {
      // Validate all provider names against whitelist
      const invalidProviders = options.providers.filter(p => !ALLOWED_PROVIDERS.has(p));
      if (invalidProviders.length > 0) {
        console.error('[orchestrate] Invalid providers:', invalidProviders);
        return bad(400, `Invalid providers: ${invalidProviders.join(', ')}`);
      }
      // User explicitly selected providers, use their selection
      providers = options.providers;
    } else {
      // Default behavior: include standard providers
      providers = standardProviders;
    }

    if (options.includeDating || options.includeNsfw) {
      providers.push('username-extended');
    }

    if (options.includeDarkweb && workspace.plan !== 'free') {
      providers = [...providers, ...darkwebProviders];
    }

    // Create execution queue
    const queue = createQueue({ concurrency: 7, retries: 3 });
    const allFindings: UFMFinding[] = [];

    // Execute providers in parallel
    const tasks = providers.map(provider => async () => {
      const cacheKey = `scan:${provider}:${type}:${value}`;
      
      try {
        return await withCache(
          cacheKey,
          async () => {
            // Call respective provider function
            const { data, error } = await supabase.functions.invoke('provider-proxy', {
              body: { provider, target: value, type }
            });

            if (error) throw error;
            return data.findings || [];
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

    // Deduplicate and sort
    const uniqueFindings = deduplicateFindings(allFindings);
    const sortedFindings = sortFindings(uniqueFindings);

    // Persist findings
    if (sortedFindings.length > 0) {
      await supabase.from('findings').insert(
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

    // Bill the scan (idempotent)
    await supabase.functions.invoke('billing/metering/report-scan', {
      body: { workspace_id: workspaceId, count: 1 }
    });

    const tookMs = Date.now() - startTime;

    console.log(`[orchestrate] Completed in ${tookMs}ms: ${sortedFindings.length} findings`);

    return ok({
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
