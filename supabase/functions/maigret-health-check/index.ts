const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
};

const H = (c: any) => ({
  'Access-Control-Allow-Origin': c['Access-Control-Allow-Origin'],
  'Access-Control-Allow-Headers': c['Access-Control-Allow-Headers']
});

const J = (d: any, s = 200) => new Response(
  JSON.stringify(d),
  { status: s, headers: { 'Content-Type': 'application/json', ...H(corsHeaders) } }
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: H(corsHeaders) });
  if (req.method !== 'GET') return J({ error: 'Method Not Allowed' }, 405);

  const base = Deno.env.get('MAIGRET_WORKER_URL');
  if (!base) return J({ error: 'Missing env MAIGRET_WORKER_URL' }, 500);

  const candidates = ['/healthz', '/health', '/ping'];
  const tried: any[] = [];

  console.log(`[health-check] Trying endpoints on: ${base}`);

  for (const p of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      console.log(`[health-check] Attempting: ${base}${p}`);
      const r = await fetch(`${base}${p}`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const body = await r.text().catch(() => '');
      const entry = { path: p, status: r.status, ok: r.ok, body: body.slice(0, 300) };
      tried.push(entry);

      console.log(`[health-check] ${p} → ${r.status} ${r.ok ? 'OK' : 'FAIL'}`);

      if (r.ok) {
        return J({ ok: true, path: p, status: r.status, body, tried }, 200);
      }
    } catch (e: any) {
      const entry = { path: p, error: e.name === 'AbortError' ? 'timeout' : String(e) };
      tried.push(entry);
      console.error(`[health-check] ${p} failed:`, e);
    }
  }

  console.error('[health-check] All endpoints failed');
  return J({
    status: 'unreachable',
    message: 'No health endpoint responded OK',
    tried
  }, 503);
});
