import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-results-token',
};

// Validation schema
const WebhookPayloadSchema = z.object({
  job_id: z.string().min(1, "job_id required"),
  batch_id: z.string().optional(),
  username: z.string().min(1, "username required"),
  status: z.enum(['completed', 'failed', 'queued', 'running']),
  summary: z.any().optional(),
  raw: z.any().optional(),
  user_id: z.string().optional(),
  workspace_id: z.string().optional()
});

// Note: Rate limiting now inline with custom limits per endpoint

function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...headers,
  };
}

interface WebhookPayload {
  job_id: string;
  batch_id?: string;
  username: string;
  status: 'completed' | 'failed' | 'queued' | 'running';
  summary?: any;
  raw?: any;
  user_id?: string;
  workspace_id?: string;
}

// UUID validation helper
const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(wrapHandler(async (req) => {
  const functionName = 'scan-results';
  
  try {
    const RESULTS_WEBHOOK_TOKEN = Deno.env.get('RESULTS_WEBHOOK_TOKEN')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Rate limiting (IP-based for webhooks) - increased for high-volume scan results
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    // Increased to 500 req/hour to handle large scan result sets
    const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
      p_identifier: clientIp,
      p_identifier_type: 'ip',
      p_endpoint: 'scan-results',
      p_max_requests: 500,
      p_window_seconds: 3600
    });

    if (!rateLimit?.allowed) {
      const error = new Error('Rate limit exceeded');
      (error as any).status = 429;
      (error as any).resetAt = rateLimit?.reset_at;
      throw error;
    }

    const webhookToken = req.headers.get('X-Results-Token');
    if (!webhookToken || webhookToken !== RESULTS_WEBHOOK_TOKEN) {
      console.warn(`[${functionName}] Invalid or missing X-Results-Token header`);
      throw ERROR_RESPONSES.UNAUTHORIZED('Invalid webhook token');
    }

    // Validate request body
    const body = await req.json();
    const payload = WebhookPayloadSchema.parse(body);
    
    if (!payload.job_id || !payload.username || !payload.status) {
      throw ERROR_RESPONSES.VALIDATION_ERROR('job_id, username, and status are required');
    }

    console.log(`[${functionName}] Webhook received:`, sanitizeForLog({
      job_id: payload.job_id,
      status: payload.status,
      username: payload.username,
      user_id: payload.user_id
    }));

    // Sanitize UUIDs before database insert - treat zero UUID as reserved
    const zeroUUID = '00000000-0000-0000-0000-000000000000';
    const safeUserId = payload.user_id && isUUID(payload.user_id) && payload.user_id !== zeroUUID 
      ? payload.user_id 
      : null;
    const safeWorkspaceId = payload.workspace_id && isUUID(payload.workspace_id) 
      ? payload.workspace_id 
      : null;
    
    if (payload.user_id === zeroUUID) {
      console.warn('[scan-results] Reserved zero UUID detected; storing user_id as null');
    } else if (payload.user_id && !safeUserId) {
      console.warn('[scan-results] Invalid user_id format in payload; storing as null');
    }
    if (payload.workspace_id && !safeWorkspaceId) {
      console.warn('[scan-results] Invalid workspace_id format in payload; storing as null');
    }

    // Store in legacy maigret_results table
    const { error: upsertError } = await supabase
      .from('maigret_results')
      .upsert({
        job_id: payload.job_id,
        batch_id: payload.batch_id || null,
        username: payload.username,
        status: payload.status,
        summary: payload.summary || {},
        raw: payload.raw || {},
        user_id: safeUserId,
        workspace_id: safeWorkspaceId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'job_id'
      });

    if (upsertError) {
      console.error(`[${functionName}] Legacy table upsert error:`, sanitizeForLog(upsertError));
      throw ERROR_RESPONSES.INTERNAL_ERROR(`Database operation failed: ${upsertError.message}`);
    }

    // Also store in new findings table for advanced pipeline compatibility
    // Extract individual findings from the raw data if available
    if (payload.raw && typeof payload.raw === 'object') {
      const findings = [];
      
      // Parse the raw data structure to extract findings
      if (Array.isArray(payload.raw)) {
        for (const item of payload.raw) {
          const siteName = item.site || item.sitename || 'Unknown';
          // Store evidence as array format for frontend compatibility
          const evidence = [
            { key: 'site', value: siteName },
            { key: 'url', value: item.url },
            { key: 'status', value: item.status }
          ];
          
          findings.push({
            scan_id: payload.job_id,
            provider: 'maigret',
            kind: 'profile',
            title: `Profile found on ${siteName}`,
            severity: item.status === 'found' ? 'medium' : 'low',
            site: siteName,
            url: item.url,
            status: item.status,
            evidence,
            meta: { username: payload.username, batch_id: payload.batch_id }
          });
        }
      } else if (payload.raw.sites) {
        // Handle object format with sites array
        for (const site of payload.raw.sites || []) {
          const siteName = site.site || site.sitename || 'Unknown';
          // Store evidence as array format for frontend compatibility
          const evidence = [
            { key: 'site', value: siteName },
            { key: 'url', value: site.url },
            { key: 'status', value: site.status }
          ];
          
          findings.push({
            scan_id: payload.job_id,
            provider: 'maigret',
            kind: 'profile',
            title: `Profile found on ${siteName}`,
            severity: site.status === 'found' ? 'medium' : 'low',
            site: siteName,
            url: site.url,
            status: site.status,
            evidence,
            meta: { username: payload.username, batch_id: payload.batch_id }
          });
        }
      }

      if (findings.length > 0) {
        const { error: findingsError } = await supabase
          .from('findings')
          .insert(findings);

        if (findingsError) {
          console.warn(`[${functionName}] Failed to insert findings (non-fatal):`, sanitizeForLog(findingsError));
        } else {
          console.log(`[${functionName}] Successfully stored ${findings.length} findings for job ${payload.job_id}`);
        }
      }
    }

    console.log(`[${functionName}] Successfully stored results for job ${payload.job_id}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
    );

  } catch (error: any) {
    console.error(`[${functionName}] Error:`, sanitizeForLog(error));
    throw error;
  }
}, { timeoutMs: 30000, corsHeaders, functionName: 'scan-results' }));
