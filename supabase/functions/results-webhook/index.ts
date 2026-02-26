import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const RESULTS_WEBHOOK_TOKEN = Deno.env.get('RESULTS_WEBHOOK_TOKEN') ?? '';

    // Validate token
    const token = req.headers.get('x-callback-token');
    if (token !== RESULTS_WEBHOOK_TOKEN) {
      console.error('Unauthorized webhook call - invalid token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get('job_id');
    const isFinal = url.searchParams.get('final') === 'true';

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'job_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const contentType = req.headers.get('content-type') ?? '';
    let lines: any[] = [];

    if (contentType.includes('application/json')) {
      const payload = await req.json();
      lines = Array.isArray(payload) ? payload : (payload?.lines ?? []);
    } else {
      // NDJSON text
      const text = await req.text();
      lines = text.split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean);
    }

    // Find current max line_no for continuity
    let lineNoBase = 0;
    const { data: existing } = await supabase
      .from('scan_results')
      .select('line_no')
      .eq('job_id', jobId)
      .order('line_no', { ascending: false })
      .limit(1);

    if (existing?.length) {
      lineNoBase = existing[0].line_no;
    }

    let inserted = 0;
    let normalized = 0;

    for (let i = 0; i < lines.length; i++) {
      const json = lines[i];
      const line_no = lineNoBase + i + 1;

      const { error: e1 } = await supabase
        .from('scan_results')
        .insert({ job_id: jobId, line_no, ndjson: json });

      if (!e1) inserted++;

      if (json?.site) {
        const { error: e2 } = await supabase
          .from('scan_findings')
          .upsert({
            job_id: jobId,
            site: json.site,
            url: json.url ?? null,
            status: json.status ?? null,
            raw: json,
          });

        if (!e2) normalized++;
      }
    }

    // Mark as finished if final batch
    if (isFinal) {
      await supabase
        .from('scan_jobs')
        .update({ status: 'finished', finished_at: new Date().toISOString() })
        .eq('id', jobId);
    }

    console.log(`Webhook processed: job=${jobId}, lines=${lines.length}, inserted=${inserted}, normalized=${normalized}, final=${isFinal}`);

    return new Response(
      JSON.stringify({
        jobId,
        received: lines.length,
        rowsInserted: inserted,
        findingsUpserted: normalized,
        final: isFinal,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
