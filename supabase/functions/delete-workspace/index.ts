import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DeleteWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID format")
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
  const functionName = 'delete-workspace';
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const user = await validateAuth(req, supabase);
    const body = await req.json();
    const { workspaceId } = DeleteWorkspaceSchema.parse(body);

    console.log(`[${functionName}] Deleting workspace:`, sanitizeForLog({ workspaceId, userId: user.id }));

    // Verify ownership
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, owner_id, name')
      .eq('id', workspaceId)
      .single();

    if (wsError || !workspace) {
      throw ERROR_RESPONSES.NOT_FOUND('Workspace not found');
    }

    if (workspace.owner_id !== user.id) {
      throw ERROR_RESPONSES.FORBIDDEN('Only workspace owners can delete workspaces');
    }

    console.log(`[${functionName}] Verified ownership, cascading delete...`);

    // Get all scans for this workspace
    const { data: scans } = await supabase
      .from('scans')
      .select('id')
      .eq('workspace_id', workspaceId);

    const scanIds = scans?.map(s => s.id) || [];

    // Delete cascade in order (most dependent first)
    if (scanIds.length > 0) {
      // 1. Delete scan_events
      await supabase.from('scan_events').delete().in('scan_id', scanIds);
      console.log(`[${functionName}] Deleted scan_events`);

      // 2. Delete scan_progress
      await supabase.from('scan_progress').delete().in('scan_id', scanIds);
      console.log(`[${functionName}] Deleted scan_progress`);

      // 3. Delete findings
      await supabase.from('findings').delete().in('scan_id', scanIds);
      console.log(`[${functionName}] Deleted findings`);

      // 4. Delete scans
      await supabase.from('scans').delete().eq('workspace_id', workspaceId);
      console.log(`[${functionName}] Deleted scans`);
    }

    // 5. Delete workspace_members
    await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId);
    console.log(`[${functionName}] Deleted workspace_members`);

    // 6. Delete credits_ledger
    await supabase.from('credits_ledger').delete().eq('workspace_id', workspaceId);
    console.log(`[${functionName}] Deleted credits_ledger`);

    // 7. Delete audit_log
    await supabase.from('audit_log').delete().eq('workspace_id', workspaceId);
    console.log(`[${functionName}] Deleted audit_log`);

    // 8. Delete monitoring_schedules
    await supabase.from('monitoring_schedules').delete().eq('workspace_id', workspaceId);
    console.log(`[${functionName}] Deleted monitoring_schedules`);

    // 9. Finally delete the workspace
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (deleteError) {
      console.error(`[${functionName}] Failed to delete workspace:`, sanitizeForLog(deleteError));
      throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to delete workspace');
    }

    console.log(`[${functionName}] Successfully deleted workspace:`, workspace.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workspace deleted successfully',
        workspaceId
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
}, { timeoutMs: 30000, corsHeaders, functionName: 'delete-workspace' }));
