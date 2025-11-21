import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CleanupSchema = z.object({
  timeoutMinutes: z.number().min(1).max(60).optional().default(2),
});

/**
 * Cleanup Stuck Scans - Automated timeout service
 * Marks scans as 'timeout' or 'failed' if they've been pending for > timeoutMinutes
 * Runs every minute via pg_cron (default timeout: 2 minutes)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication - Admin only or system cron
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      // Allow unauthenticated requests from cron (internal system)
      const cronSecret = req.headers.get('x-cron-secret');
      if (cronSecret !== Deno.env.get('CRON_SECRET')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
        );
      }
      console.log('[cleanup-stuck-scans] System cron execution');
    } else {
      const userId = authResult.context.userId;

      // Verify admin role for manual invocations
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        console.error('[cleanup-stuck-scans] Non-admin access attempt:', userId);
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
        );
      }

      // Rate limiting for manual admin invocations - 20 requests/hour
      const rateLimitResult = await checkRateLimit(userId, 'user', 'cleanup-stuck-scans', {
        maxRequests: 20,
        windowSeconds: 3600
      });
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            resetAt: rateLimitResult.resetAt 
          }),
          { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
        );
      }

      console.log('[cleanup-stuck-scans] Admin manual execution by:', userId);
    }

    // Parse request body for timeout parameter
    let timeoutMinutes = 2;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        const validated = CleanupSchema.parse(body);
        timeoutMinutes = validated.timeoutMinutes;
      } catch (e) {
        console.warn('[cleanup-stuck-scans] Invalid body, using default timeout:', e);
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`[cleanup-stuck-scans] Starting cleanup (timeout: ${timeoutMinutes} minutes)...`);

    // Find and mark stuck scans as timeout
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();
    
    const { data: stuckScans, error: queryError } = await supabase
      .from('scans')
      .select('id, workspace_id, user_id, scan_type, created_at')
      .eq('status', 'pending')
      .lt('created_at', cutoffTime)
      .limit(100);

    if (queryError) {
      console.error('[cleanup-stuck-scans] Query error:', queryError);
      throw queryError;
    }

    if (!stuckScans || stuckScans.length === 0) {
      console.log('[cleanup-stuck-scans] No stuck scans found');
      return new Response(
        JSON.stringify({ 
          message: 'Cleanup complete',
          timeoutCount: 0,
          timeoutMinutes
        }),
        { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    console.log(`[cleanup-stuck-scans] Found ${stuckScans.length} stuck scans`);
    let timeoutCount = 0;
    const errors: string[] = [];

    for (const scan of stuckScans) {
      try {
        const stuckDuration = Math.floor((Date.now() - new Date(scan.created_at).getTime()) / 60000);
        
        // Mark as timeout or failed
        const status = stuckDuration > 10 ? 'failed' : 'timeout';
        const { error: updateError } = await supabase
          .from('scans')
          .update({
            status,
            completed_at: new Date().toISOString()
          })
          .eq('id', scan.id);

        if (updateError) {
          console.error(`[cleanup-stuck-scans] Failed to mark scan ${scan.id}:`, updateError);
          errors.push(`${scan.id}: ${updateError.message}`);
        } else {
          console.log(`[cleanup-stuck-scans] Marked scan ${scan.id} as ${status} (${stuckDuration}m)`);
          timeoutCount++;

          // Log to scan_events for tracking
          await supabase.from('scan_events').insert({
            scan_id: scan.id,
            provider: 'system',
            stage: 'cleanup',
            status: status,
            error_message: `Scan automatically marked as ${status} after ${stuckDuration} minutes`,
            metadata: { stuckDuration, timeoutMinutes, scanType: scan.scan_type }
          });

          // Log to system_errors for tracking
          await supabase.from('system_errors').insert({
            error_code: status === 'timeout' ? 'SCAN_TIMEOUT_AUTO' : 'SCAN_FAILED_AUTO',
            error_message: `Scan automatically marked as ${status} after ${stuckDuration} minutes`,
            function_name: 'cleanup-stuck-scans',
            scan_id: scan.id,
            workspace_id: scan.workspace_id,
            user_id: scan.user_id,
            severity: 'warn',
            metadata: { stuckDuration, timeoutMinutes, scanType: scan.scan_type }
          });
        }
      } catch (scanError) {
        console.error(`[cleanup-stuck-scans] Error processing scan ${scan.id}:`, scanError);
        errors.push(`${scan.id}: ${scanError instanceof Error ? scanError.message : 'Unknown error'}`);
      }
    }

    console.log(`[cleanup-stuck-scans] Cleanup complete. Timed out: ${timeoutCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup complete',
        timeoutCount,
        timeoutMinutes,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error) {
    console.error('[cleanup-stuck-scans] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
      }
    );
  }
});
