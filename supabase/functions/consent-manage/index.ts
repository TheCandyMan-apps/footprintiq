import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return bad(401, 'unauthorized');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) return bad(401, 'unauthorized');

    // GET - retrieve consent
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const workspaceId = url.searchParams.get('workspace_id');

      if (!workspaceId) return bad(400, 'workspace_id required');

      const { data, error } = await supabase
        .from('sensitive_consents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .order('noted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[consent/manage] GET error:', error);
        return bad(500, error.message);
      }

      return ok({ consent: data || null });
    }

    // POST - grant consent
    if (req.method === 'POST') {
      const { workspace_id, categories } = await req.json();

      if (!workspace_id || !Array.isArray(categories) || categories.length === 0) {
        return bad(400, 'workspace_id and categories[] required');
      }

      // Validate categories
      const validCategories = ['dating', 'nsfw', 'darkweb'];
      if (!categories.every(c => validCategories.includes(c))) {
        return bad(400, `Invalid categories. Must be one of: ${validCategories.join(', ')}`);
      }

      // Check workspace membership
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspace_id)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        return bad(403, 'not_a_workspace_member');
      }

      // Insert consent
      const { data, error } = await supabase
        .from('sensitive_consents')
        .insert({
          workspace_id,
          user_id: user.id,
          categories,
        })
        .select()
        .single();

      if (error) {
        console.error('[consent/manage] POST error:', error);
        return bad(500, error.message);
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'consent_granted',
        resource_type: 'sensitive_sources',
        resource_id: workspace_id,
        metadata: { categories },
      });

      console.log(`[consent/manage] Consent granted: ${categories.join(', ')} for workspace ${workspace_id}`);

      return ok({ consent: data });
    }

    // DELETE - revoke consent
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const workspaceId = url.searchParams.get('workspace_id');

      if (!workspaceId) return bad(400, 'workspace_id required');

      const { error } = await supabase
        .from('sensitive_consents')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[consent/manage] DELETE error:', error);
        return bad(500, error.message);
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'consent_revoked',
        resource_type: 'sensitive_sources',
        resource_id: workspaceId,
      });

      console.log(`[consent/manage] Consent revoked for workspace ${workspaceId}`);

      return ok({ success: true });
    }

    return bad(405, 'method_not_allowed');

  } catch (error) {
    console.error('[consent/manage] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
