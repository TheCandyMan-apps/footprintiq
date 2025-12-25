import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { wrapHandler, sanitizeForLog, ERROR_RESPONSES } from '../_shared/errorHandler.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ListScansSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(50),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled', 'timeout']).optional(),
  workspaceId: z.string().uuid().optional(),
  searchTerm: z.string().optional()
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
  const functionName = 'admin-list-scans';
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const user = await validateAuth(req, supabase);
    const userIsAdmin = await isAdmin(supabase, user.id);

    if (!userIsAdmin) {
      throw ERROR_RESPONSES.FORBIDDEN('Admin access required');
    }

    const body = await req.json();
    const { page, pageSize, status, workspaceId, searchTerm } = ListScansSchema.parse(body);

    console.log(`[${functionName}] Listing scans:`, sanitizeForLog({ page, pageSize, status, workspaceId, searchTerm }));

    // Build query
    let query = supabase
      .from('scans')
      .select(`
        id,
        scan_type,
        username,
        email,
        phone,
        status,
        created_at,
        completed_at,
        workspace_id,
        user_id,
        workspaces(name)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    if (searchTerm) {
      query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
    }

    const offset = (page - 1) * pageSize;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: scans, error: scansError, count } = await query;

    if (scansError) {
      console.error(`[${functionName}] Failed to list scans:`, sanitizeForLog(scansError));
      throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to list scans');
    }

    // Get findings count for each scan - aggregate from all result tables
    const enrichedScans = await Promise.all(
      (scans || []).map(async (scan: any) => {
        // Count from all result tables in parallel
        const [
          { count: findingsCount },
          { count: socialProfilesCount },
          { count: dataSourcesCount }
        ] = await Promise.all([
          supabase
            .from('findings')
            .select('*', { count: 'exact', head: true })
            .eq('scan_id', scan.id),
          supabase
            .from('social_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('scan_id', scan.id),
          supabase
            .from('data_sources')
            .select('*', { count: 'exact', head: true })
            .eq('scan_id', scan.id)
        ]);

        const totalFindingsCount = (findingsCount || 0) + (socialProfilesCount || 0) + (dataSourcesCount || 0);

        return {
          ...scan,
          findingsCount: totalFindingsCount,
          findingsBreakdown: {
            findings: findingsCount || 0,
            socialProfiles: socialProfilesCount || 0,
            dataSources: dataSourcesCount || 0
          },
          workspaceName: scan.workspaces?.name,
          userEmail: scan.user_id,
          userName: null
        };
      })
    );

    console.log(`[${functionName}] Found ${enrichedScans.length} scans`);

    return new Response(
      JSON.stringify({
        scans: enrichedScans,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
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
}, { timeoutMs: 20000, corsHeaders, functionName: 'admin-list-scans' }));
