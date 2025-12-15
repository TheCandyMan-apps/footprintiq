import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DeleteScanSchema = z.object({
  scanId: z.string().uuid("Invalid scan ID format").optional(),
  scanIds: z.array(z.string().uuid()).optional(),
  force: z.boolean().optional(),
  selectAll: z.boolean().optional(),
  filters: z.object({
    status: z.string().optional(),
    searchTerm: z.string().optional()
  }).optional()
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
    const { scanId, scanIds, force = false, selectAll, filters } = DeleteScanSchema.parse(body);

    const userIsAdmin = await isAdmin(supabase, user.id);
    if (!userIsAdmin) {
      throw ERROR_RESPONSES.FORBIDDEN('Admin access required');
    }

    // Handle bulk delete with selectAll
    if (selectAll) {
      console.log(`[${functionName}] Bulk delete with selectAll:`, sanitizeForLog({ filters, userId: user.id, force }));
      
      let query = supabase.from('scans').select('id');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.searchTerm) {
        query = query.or(`username.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%,id.ilike.%${filters.searchTerm}%`);
      }
      
      const { data: scansToDelete, error: fetchError } = await query;
      
      if (fetchError) {
        console.error(`[${functionName}] Failed to fetch scans:`, sanitizeForLog(fetchError));
        throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to fetch scans');
      }
      
      const idsToDelete = scansToDelete?.map(s => s.id) || [];
      console.log(`[${functionName}] Found ${idsToDelete.length} scans to delete`);
      
      if (idsToDelete.length > 0) {
        await supabase.from('scan_events').delete().in('scan_id', idsToDelete);
        await supabase.from('scan_progress').delete().in('scan_id', idsToDelete);
        await supabase.from('findings').delete().in('scan_id', idsToDelete);
        
        const { error: deleteError } = await supabase
          .from('scans')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error(`[${functionName}] Failed to bulk delete:`, sanitizeForLog(deleteError));
          throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to delete scans');
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `Deleted ${idsToDelete.length} scans`, deleted: idsToDelete.length }),
        { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    // Handle bulk delete with scanIds array
    if (scanIds && scanIds.length > 0) {
      console.log(`[${functionName}] Bulk delete ${scanIds.length} scans`);
      
      await supabase.from('scan_events').delete().in('scan_id', scanIds);
      await supabase.from('scan_progress').delete().in('scan_id', scanIds);
      await supabase.from('findings').delete().in('scan_id', scanIds);
      
      const { error: deleteError } = await supabase
        .from('scans')
        .delete()
        .in('id', scanIds);
      
      if (deleteError) {
        console.error(`[${functionName}] Failed to bulk delete:`, sanitizeForLog(deleteError));
        throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to delete scans');
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `Deleted ${scanIds.length} scans`, deleted: scanIds.length }),
        { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    // Single scan delete
    if (!scanId) {
      throw ERROR_RESPONSES.INVALID_REQUEST('scanId or scanIds required');
    }

    console.log(`[${functionName}] Deleting scan:`, sanitizeForLog({ scanId, userId: user.id, force }));

    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id, user_id, workspace_id, status, created_at')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      throw ERROR_RESPONSES.NOT_FOUND('Scan not found');
    }

    if (!force) {
      const scanAge = Date.now() - new Date(scan.created_at).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      if (scan.status === 'completed' && scanAge < thirtyDaysMs) {
        throw ERROR_RESPONSES.FORBIDDEN('Completed scans can only be deleted after 30 days');
      }

      if (scan.status === 'pending' || scan.status === 'running') {
        throw ERROR_RESPONSES.FORBIDDEN('Cannot delete running scans. Cancel them first.');
      }
    }

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
      JSON.stringify({ success: true, message: 'Scan deleted successfully', scanId }),
      { status: 200, headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error(`[${functionName}] Error:`, sanitizeForLog(error));
    throw error;
  }
}, { timeoutMs: 30000, corsHeaders, functionName: 'delete-scan' }));
