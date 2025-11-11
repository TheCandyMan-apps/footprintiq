const C = { allowOrigins:'*', allowMethods:'GET,OPTIONS', allowHeaders:'content-type' }
const H = (c:any)=>({'Access-Control-Allow-Origin':c.allowOrigins,'Access-Control-Allow-Methods':c.allowMethods,'Access-Control-Allow-Headers':c.allowHeaders})
const J = (d:any,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json',...H(C)}})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: H(C) })
  if (req.method !== 'GET') return J({ error:'Method Not Allowed' },405)

  const base = env('MAIGRET_WORKER_URL')
  const overrideHealth = Deno.env.get('MAIGRET_WORKER_HEALTH_PATH')?.trim()
  const scanPath = Deno.env.get('MAIGRET_WORKER_SCAN_PATH')?.trim() || '/scan'
  const tried:any[] = []

  async function probe(path:string, method:'GET'|'OPTIONS'='GET') {
    const url = `${base}${path}`
    try {
      const r = await fetch(url, { method })
      const body = await r.text().catch(()=> '')
      const rec = { method, path, status:r.status, ok:r.ok, body: body.slice(0,300) }
      tried.push(rec)
      return r.ok ? rec : null
    } catch (e:any) {
      tried.push({ method, path, error:String(e) })
      return null
    }
  }

  // If override provided, try it first
  if (overrideHealth) {
    const hit = await probe(overrideHealth.startsWith('/') ? overrideHealth : `/${overrideHealth}`, 'GET')
    if (hit) return J({ ok:true, type:'override', hit, tried })
  }

  // Try common health endpoints
  for (const p of ['/healthz','/health','/ping']) {
    const hit = await probe(p, 'GET')
    if (hit) return J({ ok:true, type:'health', hit, tried })
  }

  // Finally, try OPTIONS on the scan path (reachability)
  const scanHit = await probe(scanPath.startsWith('/') ? scanPath : `/${scanPath}`, 'OPTIONS')
  if (scanHit) return J({ ok:true, type:'scan-options', hit:scanHit, tried })

  return J({ status:'unreachable', message:'No health endpoint responded OK', workerUrl: base, tried }, 503)
})

function env(n:string){ const v=Deno.env.get(n); if(!v) throw new Error(`Missing env ${n}`); return v }
