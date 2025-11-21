import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DeleteScanSchema = z.object({
  scanId: z.string().uuid("Invalid scan ID format"),
  force: z.boolean().optional()
});

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
  const functionName = 'delete-scan';
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const user = await validateAuth(req, supabase);
    const body = await req.json();
    const { scanId, force = false } = DeleteScanSchema.parse(body);

    console.log(`[${functionName}] Deleting scan:`, sanitizeForLog({ scanId, userId: user.id, force }));

    // Get scan info
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id, user_id, workspace_id, status, created_at')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      throw ERROR_RESPONSES.NOT_FOUND('Scan not found');
    }

    const userIsAdmin = await isAdmin(supabase, user.id);

    // Check permissions
    if (!userIsAdmin && scan.user_id !== user.id) {
      throw ERROR_RESPONSES.FORBIDDEN('Unauthorized to delete this scan');
    }

    // Check deletion rules (unless admin with force flag)
    if (!force || !userIsAdmin) {
      const scanAge = Date.now() - new Date(scan.created_at).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      if (scan.status === 'completed' && scanAge < thirtyDaysMs) {
        throw ERROR_RESPONSES.FORBIDDEN('Completed scans can only be deleted after 30 days');
      }

      if (scan.status === 'pending' || scan.status === 'running') {
        throw ERROR_RESPONSES.FORBIDDEN('Cannot delete running scans. Cancel them first.');
      }
    }

    // Delete cascade
    await supabase.from('scan_events').delete().eq('scan_id', scanId);
    await supabase.from('scan_progress').delete().eq('scan_id', scanId);
    await supabase.from('findings').delete().eq('scan_id', scanId);

    const { error: deleteError } = await supabase
      .from('scans')
      .delete()
      .eq('id', scanId);

    if (deleteError) {
      console.error(`[${functionName}] Failed to delete scan:`, sanitizeForLog(deleteError));
      throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to delete scan');
    }

    console.log(`[${functionName}] Successfully deleted scan:`, scanId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scan deleted successfully',
        scanId
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
}, { timeoutMs: 15000, corsHeaders, functionName: 'delete-scan' }));
