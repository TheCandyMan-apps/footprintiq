import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/secure.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APIFY_TOKEN = Deno.env.get('APIFY_API_TOKEN') ?? '';

type Json = Record<string, any> | any[] | string | number | boolean | null;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

// Normalizers for 3 actors
function normalizeSocialFinder(raw: any) {
  const items = Array.isArray(raw) ? raw : [raw];
  const out: any[] = [];
  for (const r of items) {
    const accs = Array.isArray(r?.accounts_found) ? r.accounts_found : [];
    for (const a of accs) {
      out.push({
        provider: 'apify:social-media-finder-pro',
        kind: 'profile.presence',
        severity: 'info',
        confidence: 0.7,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'platform', value: a?.site },
          { key: 'username', value: a?.username ?? r?.username },
          { key: 'url', value: a?.url },
        ].filter(e => e.value),
        meta: { site: a?.site, url: a?.url },
      });
    }
  }
  return out;
}

function normalizeOsintScraper(raw: any) {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.map((i) => ({
    provider: 'apify:osint-scraper',
    kind: 'paste.leak',
    severity: 'medium',
    confidence: 0.65,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'keyword', value: i?.keyword },
      { key: 'url', value: i?.url },
    ].filter(e => e.value),
    meta: { url: i?.url, keyword: i?.keyword },
  }));
}

function normalizeDarkWeb(raw: any) {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.map((i) => ({
    provider: 'apify:darkweb-scraper',
    kind: 'darkweb.reference',
    severity: 'high',
    confidence: 0.6,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'url', value: i?.url },
    ].filter(e => e.value),
    meta: { url: i?.url, links: i?.links ?? [] },
  }));
}

function normalizerFor(actorSlug: string) {
  if (actorSlug.includes('social-media-finder-pro')) return normalizeSocialFinder;
  if (actorSlug.includes('osint-scraper')) return normalizeOsintScraper;
  if (actorSlug.includes('darkweb-scraper')) return normalizeDarkWeb;
  return (raw: any) => (Array.isArray(raw) ? raw : [raw]);
}

async function startApifyRun(actorSlug: string, input: Json) {
  if (!APIFY_TOKEN) return { ok: false, reason: 'APIFY_DISABLED' };
  const res = await fetch(`https://api.apify.com/v2/acts/${actorSlug}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) return { ok: false, reason: `APIFY_START_FAILED:${res.status}` };
  return { ok: true, run: await res.json() };
}

async function getRun(runId: string) {
  const r = await fetch(`https://api.apify.com/v2/runs/${runId}?token=${APIFY_TOKEN}`);
  return { ok: r.ok, body: await r.json(), status: r.status };
}

async function getDatasetItems(datasetId: string) {
  const r = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`, {
    headers: { accept: 'application/json' },
  });
  if (!r.ok) return { ok: false, status: r.status };
  return { ok: true, items: await r.json() };
}

async function pollForDataset(runId: string, timeoutMs = 60_000, intervalMs = 2_000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const { ok, body } = await getRun(runId);
    if (!ok) break;
    const status = String(body?.data?.status || '');
    if (status === 'SUCCEEDED') return { status, datasetId: body?.data?.defaultDatasetId as string };
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) return { status, datasetId: null };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: 'TIMEOUT', datasetId: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED' });

    const admin = adminClient();
    const authHeader = req.headers.get('authorization') || '';
    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) return jsonResponse(401, { error: 'UNAUTHENTICATED' });

    const { workspaceId, actorSlug, payload } = await req.json();

    if (!workspaceId || !actorSlug) {
      return jsonResponse(400, { error: 'workspaceId and actorSlug are required' });
    }

    // Check membership
    const { data: membership } = await admin
      .from('workspace_members')
      .select('workspace_id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return jsonResponse(403, { error: 'NOT_A_MEMBER' });

    // Get workspace tier and balance
    const { data: workspace } = await admin
      .from('workspaces')
      .select('subscription_tier')
      .eq('id', workspaceId)
      .single();

    const { data: credits } = await admin
      .from('credit_ledger')
      .select('delta')
      .eq('workspace_id', workspaceId);

    const balance = (credits ?? []).reduce((s, r) => s + (r.delta ?? 0), 0);
    const tier = workspace?.subscription_tier ?? 'free';

    const costMap: Record<string, number> = {
      'xtech/social-media-finder-pro': 3,
      'epctex/osint-scraper': 2,
      'epctex/darkweb-scraper': 5,
    };
    const actorKey = Object.keys(costMap).find((k) => actorSlug.includes(k)) ?? 'xtech/social-media-finder-pro';
    const cost = costMap[actorKey];
    let debited = 0;

    // Gate on credits for non-premium tiers
    if (!['pro', 'enterprise'].includes(tier.toLowerCase())) {
      if (balance < cost) {
        return jsonResponse(402, { error: 'INSUFFICIENT_CREDITS', required: cost, balance });
      }
      const { data: spent } = await admin.rpc('spend_credits', {
        _workspace_id: workspaceId,
        _cost: cost,
        _reason: 'apify-run',
        _meta: { actorSlug },
      });
      if (!spent) {
        return jsonResponse(402, { error: 'INSUFFICIENT_CREDITS', required: cost, balance });
      }
      debited = cost;
    }

    // Create task record
    const { data: task } = await admin
      .from('apify_tasks')
      .insert({
        workspace_id: workspaceId,
        actor_slug: actorSlug,
        input: payload ?? {},
        cost_credits: cost,
        created_by: user.id,
      })
      .select('id')
      .single();

    const taskId = task?.id;

    if (!APIFY_TOKEN) {
      await admin.from('apify_tasks').update({ status: 'failed', finished_at: new Date() }).eq('id', taskId);
      return jsonResponse(200, { findings: [], notice: 'APIFY_DISABLED', taskId, debited });
    }

    const started = await startApifyRun(actorSlug, payload ?? {});
    if (!started.ok) {
      await admin.from('apify_tasks').update({ status: 'failed', finished_at: new Date() }).eq('id', taskId);
      return jsonResponse(200, { findings: [], notice: started.reason, taskId, debited });
    }

    const runId = String(started.run?.data?.id);
    await admin.from('apify_tasks').update({ status: 'running', task_id: runId }).eq('id', taskId);

    console.log(`[apify-run] Polling run ${runId}...`);
    const { status, datasetId } = await pollForDataset(runId);
    
    if (status !== 'SUCCEEDED' || !datasetId) {
      await admin.from('apify_tasks').update({ status: 'failed', finished_at: new Date() }).eq('id', taskId);
      return jsonResponse(200, { findings: [], notice: `RUN_${status}`, taskId, debited });
    }

    const ds = await getDatasetItems(datasetId);
    if (!ds.ok) {
      await admin.from('apify_tasks').update({ status: 'failed', finished_at: new Date() }).eq('id', taskId);
      return jsonResponse(200, { findings: [], notice: `DATASET_${ds.status}`, taskId, debited });
    }

    const normalize = normalizerFor(actorSlug);
    const findings = normalize(ds.items ?? []);
    
    await admin.from('apify_results').insert({
      task_id: taskId,
      result: { actorSlug, rawCount: (ds.items ?? []).length, findings },
    });
    
    await admin.from('apify_tasks').update({ status: 'succeeded', finished_at: new Date() }).eq('id', taskId);

    console.log(`[apify-run] Success: ${findings.length} findings`);
    return jsonResponse(200, { findings, taskId, debited });
  } catch (e) {
    console.error('[apify-run] Error:', e);
    return jsonResponse(500, { error: String(e?.message ?? e) });
  }
});
