import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid_json' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = body?.token;
  const expected = Deno.env.get('RESULTS_WEBHOOK_TOKEN');

  if (!expected || token !== expected) {
    console.error('[gosearch-results] Unauthorized: token mismatch');
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const scanId = body.scan_id;
  const workspaceId = body.workspace_id;
  const username = body.username;
  const results = Array.isArray(body.results) ? body.results : [];
  const error = body.error;
  const durationMs = body.duration_ms;

  console.log('[gosearch-results] Received webhook:', {
    scanId,
    workspaceId,
    username,
    resultsCount: results.length,
    error,
    durationMs
  });

  const now = new Date().toISOString();

  // Log started event
  await supabaseAdmin.from('scan_events').insert({
    scan_id: scanId,
    provider: 'gosearch',
    stage: 'started',
    status: 'success',
    created_at: now,
    metadata: { async: true }
  });

  if (error) {
    console.error('[gosearch-results] GoSearch reported error:', error);
    
    await supabaseAdmin.from('scan_events').insert({
      scan_id: scanId,
      provider: 'gosearch',
      stage: 'failed',
      status: 'failed',
      error_message: String(error).slice(0, 500),
      created_at: now,
      metadata: { async: true }
    });

    await supabaseAdmin
      .from('scans')
      .update({ gosearch_pending: false })
      .eq('id', scanId);

    return new Response(
      JSON.stringify({ ok: true, error_logged: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Convert GoSearch results to UFM findings
  const findings = results.map((r: any) => ({
    id: crypto.randomUUID(),
    scan_id: scanId,
    workspace_id: workspaceId,
    provider: 'gosearch',
    kind: 'presence.hit',
    title: r.site || r.platform || 'Unknown Platform',
    confidence: 0.7,
    evidence: [
      { key: 'site', value: r.site || r.platform },
      { key: 'url', value: r.url }
    ].concat(
      r.profile ? [{ key: 'profile', value: r.profile }] : []
    ),
    meta: { username, async: true },
    created_at: now
  }));

  console.log('[gosearch-results] Inserting findings:', findings.length);

  if (findings.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('findings')
      .insert(findings);
    
    if (insertError) {
      console.error('[gosearch-results] Error inserting findings:', insertError);
    }
  }

  // Log completed event
  await supabaseAdmin.from('scan_events').insert({
    scan_id: scanId,
    provider: 'gosearch',
    stage: 'completed',
    status: 'success',
    duration_ms: durationMs || null,
    created_at: now,
    metadata: { async: true, count: findings.length }
  });

  // Clear pending flag
  await supabaseAdmin
    .from('scans')
    .update({ gosearch_pending: false })
    .eq('id', scanId);

  console.log('[gosearch-results] ✅ Successfully processed GoSearch results');

  return new Response(
    JSON.stringify({ ok: true, inserted: findings.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
