import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  username: string;
  tags?: string;
  all_sites?: boolean;
  artifacts?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ScanRequest = await req.json();
    const { username, tags, all_sites = false, artifacts = [] } = body;

    if (!username || username.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create user entitlement
    const { data: entitlement } = await supabaseClient
      .from('user_entitlements')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const plan = entitlement?.plan || 'standard';

    // Define plan limits
    const PLAN_CONFIG = {
      standard: {
        timeout: parseInt(Deno.env.get('PUBLIC_STANDARD_SCAN_TIMEOUT_SECS') || '600'),
        dailyJobs: parseInt(Deno.env.get('PUBLIC_STANDARD_SCAN_DAILY_JOBS') || '30'),
        allowArtifacts: false,
        defaultAllSites: false,
      },
      premium: {
        timeout: parseInt(Deno.env.get('PUBLIC_PREMIUM_SCAN_TIMEOUT_SECS') || '1800'),
        dailyJobs: parseInt(Deno.env.get('PUBLIC_PREMIUM_SCAN_DAILY_JOBS') || '200'),
        allowArtifacts: true,
        defaultAllSites: true,
      },
    };

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];

    // Check daily job limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabaseClient
      .from('scan_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by', user.id)
      .gte('created_at', today.toISOString());

    if (todayCount && todayCount >= config.dailyJobs) {
      return new Response(
        JSON.stringify({ error: `Daily job limit reached (${config.dailyJobs})` }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate artifacts for plan
    const finalArtifacts = config.allowArtifacts ? artifacts : [];

    // Create job record
    const { data: job, error: jobError } = await supabaseClient
      .from('scan_jobs')
      .insert({
        username: username.trim(),
        tags: tags?.trim() || null,
        all_sites: all_sites,
        artifacts: finalArtifacts,
        status: 'queued',
        requested_by: user.id,
        plan,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Job creation error:', jobError);
      return new Response(JSON.stringify({ error: 'Failed to create job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Start processing immediately
    processJob(job.id, username, all_sites, finalArtifacts, config.timeout, supabaseClient);

    return new Response(JSON.stringify({ job_id: job.id, status: 'queued' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processJob(
  jobId: string,
  username: string,
  allSites: boolean,
  artifacts: string[],
  timeoutSecs: number,
  supabaseClient: any
) {
  try {
    // Update job status to running
    await supabaseClient
      .from('scan_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId);

    const workerUrl = Deno.env.get('VITE_MAIGRET_API_URL');
    const workerToken = Deno.env.get('WORKER_TOKEN');

    if (!workerUrl || !workerToken) {
      throw new Error('Worker configuration missing');
    }

    // Call Maigret Worker with authentication
    const workerEndpoint = `${workerUrl}/scan/${encodeURIComponent(username)}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutSecs * 1000);

    const resp = await fetch(workerEndpoint, {
      headers: {
        'X-Worker-Token': workerToken,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`Worker returned ${resp.status}: ${resp.statusText}`);
    }

    // Stream NDJSON results
    if (!resp.body) throw new Error('No response body from Maigret worker');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lineNo = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (!line) continue;

        try {
          const json = JSON.parse(line);
          lineNo++;

          // Insert raw entry
          await supabaseClient.from('scan_results').insert({
            job_id: jobId,
            line_no: lineNo,
            ndjson: json,
          });

          // Normalized findings
          if (json.site) {
            await supabaseClient.from('scan_findings').upsert({
              job_id: jobId,
              site: json.site,
              url: json.url ?? null,
              status: json.status ?? null,
              raw: json,
            });

            // Update cache
            await supabaseClient.from('username_site_cache').upsert({
              username,
              site: json.site,
              last_status: json.status,
              last_url: json.url ?? null,
              last_seen: new Date().toISOString(),
              raw: json,
            });
          }
        } catch (err) {
          console.error('Parse error:', err, 'Line:', line);
        }
      }
    }

    // Mark job as finished
    await supabaseClient
      .from('scan_jobs')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', jobId);
  } catch (error) {
    console.error('Job processing error:', error);
    await supabaseClient
      .from('scan_jobs')
      .update({
        status: 'error',
        error: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}
