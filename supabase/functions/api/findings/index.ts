import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';
import { getApiContext, hasScope } from '../../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'GET') return bad(405, 'method_not_allowed');

  try {
    const ctx = await getApiContext(req);
    if (!ctx || !hasScope(ctx, 'findings:read')) {
      return bad(401, 'unauthorized');
    }

    const url = new URL(req.url);
    const since = url.searchParams.get('since');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let query = supabase
      .from('scans')
      .select('id, entity, entity_type, created_at, findings')
      .eq('workspace_id', ctx.workspace_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Log audit
    await supabase.from('audit_log').insert({
      workspace_id: ctx.workspace_id,
      action: 'api.findings.read',
      meta: { count: data?.length || 0, api_key_id: ctx.key_id },
    });

    return ok({
      findings: data || [],
      total: count || 0,
      limit,
      offset,
      has_more: (data?.length || 0) === limit,
    });
  } catch (error) {
    console.error('API findings error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
