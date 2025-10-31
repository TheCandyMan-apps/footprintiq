import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';
import { getApiContext, hasScope } from '../../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const ctx = await getApiContext(req);
    if (!ctx || !hasScope(ctx, 'scan:write')) {
      return bad(401, 'unauthorized');
    }

    const { type, value, options = {} } = await req.json();
    if (!type || !value) return bad(400, 'missing_type_or_value');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create scan job
    const { data: job, error } = await supabase
      .from('background_jobs')
      .insert({
        job_type: 'api_scan',
        payload: {
          workspace_id: ctx.workspace_id,
          scan_type: type,
          scan_value: value,
          options,
        },
        priority: 5,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from('audit_log').insert({
      workspace_id: ctx.workspace_id,
      action: 'api.scan.created',
      target: job.id,
      meta: { type, api_key_id: ctx.key_id },
    });

    return ok({ job_id: job.id, status: 'pending' }, 202);
  } catch (error) {
    console.error('API scan error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
