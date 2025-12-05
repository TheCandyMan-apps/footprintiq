import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const CancelScanSchema = z.object({
  scanId: z.string().uuid("Invalid scan ID format").optional(),
  scanIds: z.array(z.string().uuid("Invalid scan ID format")).optional(),
}).refine(data => data.scanId || (data.scanIds && data.scanIds.length > 0), {
  message: "Either scanId or scanIds must be provided"
});

// Security helpers
async function validateAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return data?.role === 'admin';
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  try {
    const { data: rateLimit, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: userId,
      p_identifier_type: 'user',
      p_endpoint: endpoint,
      p_max_requests: 20,
      p_window_seconds: 60
    });

    // Fail-open: if RPC doesn't exist or fails, allow the request
    if (error) {
      console.log('[cancel-scan] Rate limit check failed (allowing request):', error.message);
      return;
    }

    // Only block if we got a valid response saying not allowed
    if (rateLimit && rateLimit.allowed === false) {
      const err = new Error('Rate limit exceeded');
      (err as any).status = 429;
      (err as any).resetAt = rateLimit?.reset_at;
      throw err;
    }
  } catch (err: any) {
    // Re-throw rate limit errors
    if (err.status === 429) {
      throw err;
    }
    // Otherwise fail-open
    console.log('[cancel-scan] Rate limit check exception (allowing request):', err.message);
  }
}

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

Deno.serve(wrapHandler(async (req) => {
  const functionName = 'cancel-scan';
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authentication
    const user = await validateAuth(req, supabase);
    const userId = user.id;

    // Rate limiting
    try {
      await checkRateLimit(supabase, userId, 'cancel-scan');
    } catch (rateLimitError: any) {
      if (rateLimitError.status === 429) {
        console.log('[cancel-scan] Rate limit exceeded for user:', userId);
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait before trying again.',
            resetAt: rateLimitError.resetAt,
          }),
          { status: 429, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
        );
      }
      throw rateLimitError;
    }

    // Validate request body
    const body = await req.json();
    const { scanId, scanIds } = CancelScanSchema.parse(body);

    const userIsAdmin = await isAdmin(supabase, user.id);
    
    // Handle bulk cancellation
    if (scanIds && scanIds.length > 0) {
      if (!userIsAdmin) {
        throw ERROR_RESPONSES.FORBIDDEN('Bulk cancellation requires admin access');
      }

      console.log(`[${functionName}] Bulk cancelling ${scanIds.length} scans`);
      
      const results = await Promise.allSettled(
        scanIds.map(async (id) => {
          const { error } = await supabase
            .from('scans')
            .update({
              status: 'cancelled',
              completed_at: new Date().toISOString()
            })
            .eq('id', id);
          
          if (!error) {
            await supabase.from('scan_progress')
              .update({ status: 'cancelled' })
              .eq('scan_id', id);
          }
          
          return { scanId: id, success: !error, error };
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Cancelled ${successful} scans. ${failed} failed.`,
          results: results.map((r, i) => ({
            scanId: scanIds[i],
            success: r.status === 'fulfilled'
          }))
        }),
        { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    // Single scan cancellation
    if (!scanId) {
      throw ERROR_RESPONSES.INVALID_REQUEST('scanId is required for single cancellation');
    }

    console.log(`[${functionName}] Cancelling scan:`, sanitizeForLog({ scanId, userId: user.id }));

    // Check scans table first (created by scan-orchestrate)
    const { data: scanRecord, error: scanError } = await supabase
      .from('scans')
      .select('id, user_id, status')
      .eq('id', scanId)
      .maybeSingle();

    if (scanRecord) {
      // Check if already in terminal state - return friendly response for completed scans
      if (scanRecord.status === 'completed') {
        console.log('[cancel-scan] Scan already completed');
        return new Response(
          JSON.stringify({ 
            message: 'Scan already completed',
            status: 'completed',
            scanId
          }),
          { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
        );
      }
      
      if (scanRecord.status === 'failed' || scanRecord.status === 'cancelled') {
        console.log('[cancel-scan] Scan already terminal:', scanRecord.status);
        return new Response(
          JSON.stringify({ 
            error: `Scan already ${scanRecord.status}`,
            status: scanRecord.status,
            message: `Cannot cancel a ${scanRecord.status} scan`
          }),
          { status: 400, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
        );
      }

      // Verify user owns the scan (unless admin)
      if (!userIsAdmin && scanRecord.user_id !== user.id) {
        throw ERROR_RESPONSES.FORBIDDEN('Unauthorized to cancel this scan');
      }

      // Cancel the scan in both scans and scan_progress tables
      const { error: updateError } = await supabase
        .from('scans')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', scanId);

      if (updateError) {
        console.error(`[${functionName}] Failed to cancel scan:`, sanitizeForLog(updateError));
        throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to cancel scan');
      }

      // Also update scan_progress to keep tables in sync
      await supabase
        .from('scan_progress')
        .update({
          status: 'cancelled'
        })
        .eq('scan_id', scanId);

      // Broadcast cancellation
      await supabase.channel(`scan_progress:${scanId}`).send({
        type: 'broadcast',
        event: 'scan_cancelled',
        payload: { scanId, cancelledAt: new Date().toISOString() }
      });

      console.log('[cancel-scan] Scan cancelled successfully in both tables');
      return new Response(
        JSON.stringify({ 
          message: 'Scan cancelled successfully',
          scanId,
          status: 'cancelled'
        }),
        { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

      // Fallback: Try legacy scan_jobs table
      console.log(`[${functionName}] Not in scans table, checking legacy scan_jobs...`);
      const { data: scan, error: jobError } = await supabase
      .from('scan_jobs')
      .select('*, workspace:workspaces!inner(id, owner_id)')
      .eq('id', scanId)
      .maybeSingle();

      // If not in scan_jobs, check maigret_results
      if (!scan) {
        console.log(`[${functionName}] Not found in scans or scan_jobs, checking maigret_results...`);
        
        const { data: maigretResult, error: maigretError } = await supabase
          .from('maigret_results')
          .select('*')
          .eq('job_id', scanId)
          .maybeSingle();

        if (!maigretResult) {
          console.error(`[${functionName}] Scan not found in any table:`, sanitizeForLog({ scanError, jobError, maigretError }));
          throw ERROR_RESPONSES.NOT_FOUND('This scan does not exist or failed to start');
        }

        // Check if already in terminal state
        if (maigretResult.status === 'completed' || maigretResult.status === 'failed') {
          console.log(`[${functionName}] Simple pipeline scan already terminal:`, maigretResult.status);
          return new Response(
            JSON.stringify({ 
              message: `Scan already ${maigretResult.status}`,
              status: maigretResult.status,
              scanId
            }),
            { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
          );
        }

      // Cancel Simple pipeline scan
      const { error: updateError } = await supabase
        .from('maigret_results')
        .update({
          status: 'failed',
          raw: {
            ...maigretResult.raw,
            cancelled_by_user: true,
            cancelled_at: new Date().toISOString()
          }
        })
        .eq('job_id', scanId);

        if (updateError) {
          console.error(`[${functionName}] Failed to cancel Simple pipeline scan:`, sanitizeForLog(updateError));
          throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to cancel scan');
        }

      console.log('[cancel-scan] Successfully cancelled Simple pipeline scan:', scanId);

      return new Response(
        JSON.stringify({
          success: true,
          scanId,
          status: 'canceled',
          message: 'Username scan cancelled',
          pipeline: 'simple'
        }),
        { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    // Continue with Advanced pipeline cancellation logic...
    // At this point, scan is guaranteed to be non-null (from scan_jobs table)
    if (!scan) {
      throw new Error('Unexpected: scan should be non-null here');
    }

    // Check if user has permission to cancel (owner or workspace member)
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', scan.workspace_id)
      .eq('user_id', user.id)
      .single();

      if (!membership && scan.workspace.owner_id !== user.id) {
        throw ERROR_RESPONSES.FORBIDDEN('Unauthorized to cancel this scan');
      }

    // Check if scan is in a terminal state
    const terminalStates = ['finished', 'error', 'canceled'];
    if (terminalStates.includes(scan.status)) {
      console.log('[cancel-scan] Scan already in terminal state:', scan.status);
      return new Response(
        JSON.stringify({ 
          error: `Scan already ${scan.status}`,
          status: scan.status 
        }),
        { status: 400, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    // Calculate partial credit refund based on progress
    let creditRefund = 0;
    
    // Get credits spent on this scan from ledger
    const { data: ledgerEntries } = await supabase
      .from('credits_ledger')
      .select('delta')
      .eq('workspace_id', scan.workspace_id)
      .contains('meta', { scan_id: scanId });
    
    const totalCost = ledgerEntries 
      ? Math.abs(ledgerEntries.reduce((sum, entry) => sum + (entry.delta || 0), 0))
      : 0;
    
    console.log('[cancel-scan] Total cost from ledger:', totalCost, 'Current status:', scan.status);
    
    if (totalCost > 0 && scan.status === 'running') {
      // Get scan progress from results
      const { data: results, error: resultsError } = await supabase
        .from('scan_results')
        .select('*')
        .eq('job_id', scanId);

      if (!resultsError && results && results.length > 0) {
        // Estimate 50% refund for partial completion
        creditRefund = Math.floor(totalCost * 0.5);
        console.log('[cancel-scan] Partial completion - 50% refund:', creditRefund, 'credits');
      } else {
        // If no results yet, refund full amount
        creditRefund = totalCost;
        console.log('[cancel-scan] No progress - Full refund:', creditRefund, 'credits');
      }
    }

    // Update scan status to canceled (valid DB status)
    const { error: updateError } = await supabase
      .from('scan_jobs')
      .update({
        status: 'canceled',
        error: 'Cancelled by user',
        finished_at: new Date().toISOString()
      })
      .eq('id', scanId);
    
    console.log('[cancel-scan] Updated scan status to canceled');

    if (updateError) {
      console.error(`[${functionName}] Failed to update scan status:`, sanitizeForLog(updateError));
      throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to cancel scan');
    }

    // Process credit refund if any
    if (creditRefund > 0 && scan.workspace_id) {
      const { error: creditError } = await supabase
        .from('credits_ledger')
        .insert({
          workspace_id: scan.workspace_id,
          delta: creditRefund,
          reason: 'scan_cancelled',
          meta: {
            scan_id: scanId,
            cancelled_by: user.id,
            cancelled_at: new Date().toISOString(),
            original_cost: totalCost,
            refund_amount: creditRefund,
          },
        });

      if (creditError) {
        console.error('[cancel-scan] Failed to refund credits:', creditError);
      } else {
        console.log('[cancel-scan] Refunded', creditRefund, 'credits to workspace:', scan.workspace_id);
      }
    } else {
      console.log('[cancel-scan] No credit refund needed. totalCost:', totalCost, 'status:', scan.status);
    }

    // Broadcast cancellation event via Supabase Realtime to both channel patterns
    try {
      const maigretChannel = supabase.channel(`scan_progress_${scanId}`);
      await maigretChannel.subscribe();
      await maigretChannel.send({
        type: 'broadcast',
        event: 'scan_cancelled',
        payload: {
          scanId,
          cancelledBy: user.id,
          cancelledAt: new Date().toISOString(),
          creditRefund,
          message: 'Scan cancelled by user',
        },
      });

      const orchestratorChannel = supabase.channel(`scan_progress:${scanId}`);
      await orchestratorChannel.subscribe();
      await orchestratorChannel.send({
        type: 'broadcast',
        event: 'scan_cancelled',
        payload: {
          scanId,
          cancelledBy: user.id,
          cancelledAt: new Date().toISOString(),
          creditRefund,
          message: 'Scan cancelled by user',
        },
      });
    } catch (broadcastError) {
      console.error('[cancel-scan] Failed to broadcast cancellation:', broadcastError);
      // Don't fail the cancellation if broadcast fails
    }

    console.log(`[${functionName}] Successfully cancelled scan:`, sanitizeForLog({ scanId }));

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        status: 'canceled',
        creditRefund,
        message: creditRefund > 0 
          ? `Scan cancelled. ${creditRefund} credits refunded.`
          : 'Scan cancelled.',
      }),
      { 
        status: 200, 
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
      }
    );
  } catch (error: any) {
    console.error(`[${functionName}] Error:`, sanitizeForLog(error));
    throw error;
  }
}, { timeoutMs: 10000, corsHeaders, functionName: 'cancel-scan' }));
