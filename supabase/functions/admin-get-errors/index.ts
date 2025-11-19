import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, safeError } from '../_shared/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse(new Error('Missing authorization'), 401, 'AUTH_FAILED', corsHeaders);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(authError || new Error('Unauthorized'), 401, 'AUTH_FAILED', corsHeaders);
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return errorResponse(new Error('Admin access required'), 403, 'UNAUTHORIZED', corsHeaders);
    }

    const url = new URL(req.url);
    const functionName = url.searchParams.get('function_name');
    const severity = url.searchParams.get('severity');
    const workspaceId = url.searchParams.get('workspace_id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 20;

    let query = supabase
      .from('system_errors')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (functionName) query = query.eq('function_name', functionName);
    if (severity) query = query.eq('severity', severity);
    if (workspaceId) query = query.eq('workspace_id', workspaceId);

    const { data: errors, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('[admin-get-errors] Fetch error:', fetchError);
      return errorResponse(fetchError, 500, 'SERVER_ERROR', corsHeaders);
    }

    return new Response(JSON.stringify({ 
      errors, 
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = safeError(error);
    return errorResponse(error, 500, 'SERVER_ERROR', corsHeaders);
  }
});
