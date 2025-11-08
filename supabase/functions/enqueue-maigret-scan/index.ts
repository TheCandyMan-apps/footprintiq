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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const WORKER_URL = Deno.env.get('VITE_MAIGRET_API_URL') ?? '';
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN') ?? '';
    const RESULTS_WEBHOOK_TOKEN = Deno.env.get('RESULTS_WEBHOOK_TOKEN') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

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
    const { data: entitlement } = await supabaseUser
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
    const { count: todayCount } = await supabaseUser
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

    // Estimate provider count based on scan mode
    const estimatedProviders = all_sites ? 500 : 100;

    // Create job record
    const { data: job, error: jobError } = await supabaseUser
      .from('scan_jobs')
      .insert({
        username: username.trim(),
        tags: tags?.trim() || null,
        all_sites: all_sites,
        artifacts: finalArtifacts,
        status: 'running',
        started_at: new Date().toISOString(),
        requested_by: user.id,
        plan,
        providers_total: estimatedProviders,
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

    // Decide mode: webhook for premium long runs
    const useWebhook = plan === 'premium' && (all_sites || finalArtifacts.length > 0);

    if (useWebhook) {
      // Webhook mode - worker will push results to our webhook
      const callbackUrl = new URL('/functions/v1/results-webhook', req.url);
      const url = new URL(`${WORKER_URL}/scan/${encodeURIComponent(username.trim())}`);
      if (tags?.trim()) url.searchParams.set('tags', tags.trim());
      if (all_sites) url.searchParams.set('all_sites', 'true');
      url.searchParams.set('callback', callbackUrl.toString());
      url.searchParams.set('job_id', job.id);

      const resp = await fetch(url, {
        headers: { 'X-Worker-Token': WORKER_TOKEN }
      });

      if (!resp.ok) {
        await supabaseUser
          .from('scan_jobs')
          .update({
            status: 'error',
            error: `Worker ${resp.status}`,
            finished_at: new Date().toISOString()
          })
          .eq('id', job.id);

        return new Response(
          JSON.stringify({ jobId: job.id, status: 'error' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`Webhook mode started for job ${job.id}`);
      return new Response(
        JSON.stringify({ jobId: job.id, status: 'queued_webhook' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Streaming mode (Standard) with timeout and retry
    const url = new URL(`${WORKER_URL}/scan/${encodeURIComponent(username.trim())}`);
    if (tags?.trim()) url.searchParams.set('tags', tags.trim());
    if (all_sites) url.searchParams.set('all_sites', 'true');

    // Retry logic with exponential backoff
    let resp: Response | null = null;
    let lastError: any;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        console.log(`[Attempt ${attempt}] Calling Maigret worker: ${url.toString()}`);
        console.log(`Worker token configured: ${WORKER_TOKEN ? 'YES' : 'NO'}`);
        
        resp = await fetch(url, {
          headers: { 'X-Worker-Token': WORKER_TOKEN },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Worker response: ${resp.status} ${resp.statusText}`);
        console.log(`Worker response has body: ${resp.body ? 'YES' : 'NO'}`);
        
        if (resp.ok) break; // Success
        
        // Check if retryable
        if (resp.status >= 400 && resp.status < 500 && resp.status !== 429) {
          // 4xx client errors (except rate limit) - don't retry
          lastError = new Error(`Worker error ${resp.status}`);
          break;
        }
        
        lastError = new Error(`Worker error ${resp.status}`);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!resp || !resp.ok || !resp.body) {
      const errorMsg = lastError?.message || `Worker ${resp?.status || 'unreachable'}`;
      await supabaseUser
        .from('scan_jobs')
        .update({
          status: 'error',
          error: errorMsg,
          finished_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ jobId: job.id, status: 'error', error: errorMsg }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let lineNo = 0;
    let inserted = 0;
    let normalized = 0;
    const partialResults: any[] = [];
    let providersCompleted = 0;

    // Helper function to broadcast progress updates
    const broadcastProgress = async (provider: string, status: 'loading' | 'success' | 'failed', message?: string, resultCount?: number) => {
      try {
        await supabaseAdmin.channel(`scan_progress_${job.id}`).send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            provider,
            status,
            message,
            resultCount,
            creditsUsed: providersCompleted, // Approximate credits as provider count
          },
        });
      } catch (error) {
        console.error('Failed to broadcast progress:', error);
      }
    };

    // Add timeout for streaming phase
    const streamTimeout = setTimeout(() => {
      reader.cancel();
      console.error('Stream timeout - no data received from worker');
    }, config.timeout * 1000);

    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;

          let json: any;
          try {
            json = JSON.parse(line);
          } catch {
            continue;
          }

          lineNo++;
          const { error: e1 } = await supabaseAdmin
            .from('scan_results')
            .insert({ job_id: job.id, line_no: lineNo, ndjson: json });

          if (!e1) inserted++;

          if (json?.site) {
            const { error: e2 } = await supabaseAdmin
              .from('scan_findings')
              .upsert({
                job_id: job.id,
                site: json.site,
                url: json.url ?? null,
                status: json.status ?? null,
                raw: json
              });

            if (!e2) {
              normalized++;
              providersCompleted++;
              partialResults.push({ site: json.site, url: json.url, status: json.status });
              
              // Broadcast provider completion
              const providerStatus = json.url ? 'success' : 'failed';
              await broadcastProgress(
                json.site,
                providerStatus,
                json.url ? 'Profile found' : 'No profile found',
                normalized
              );
              
              // Save partial results every 5 providers
              if (providersCompleted % 5 === 0) {
                await supabaseAdmin
                  .from('scan_jobs')
                  .update({
                    partial_results: partialResults,
                    providers_completed: providersCompleted,
                    last_provider_update: new Date().toISOString(),
                  })
                  .eq('id', job.id);
              }
            }
          }
        }
      }
      
      clearTimeout(streamTimeout);
    } catch (e) {
      clearTimeout(streamTimeout);
      console.error('Stream error:', e);
      
      // Broadcast scan failure
      await supabaseAdmin.channel(`scan_progress_${job.id}`).send({
        type: 'broadcast',
        event: 'scan_failed',
        payload: {
          error: String(e),
          providersCompleted,
        },
      });
      
      // Save partial results on error
      const status = providersCompleted > 0 ? 'partial' : 'error';
      await supabaseUser
        .from('scan_jobs')
        .update({
          status,
          error: `stream ${String(e)}`,
          partial_results: partialResults,
          providers_completed: providersCompleted,
          finished_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ 
          jobId: job.id, 
          status, 
          providersCompleted,
          error: String(e)
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if worker returned empty response
    if (providersCompleted === 0) {
      console.warn(`Worker returned empty response for job ${job.id}`);
      
      await supabaseUser
        .from('scan_jobs')
        .update({ 
          status: 'error',
          error: 'Worker returned no results - possible configuration or network issue',
          finished_at: new Date().toISOString(),
        })
        .eq('id', job.id);
        
      return new Response(
        JSON.stringify({
          jobId: job.id,
          status: 'error',
          error: 'Worker returned no results'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabaseUser
      .from('scan_jobs')
      .update({ 
        status: 'finished', 
        finished_at: new Date().toISOString(),
        partial_results: partialResults,
        providers_completed: providersCompleted,
      })
      .eq('id', job.id);

    // Broadcast scan completion
    await supabaseAdmin.channel(`scan_progress_${job.id}`).send({
      type: 'broadcast',
      event: 'scan_complete',
      payload: {
        status: 'completed',
        totalProviders: providersCompleted,
        creditsUsed: providersCompleted,
        message: 'Scan completed successfully',
      },
    });

    console.log(`Streaming mode completed for job ${job.id}: lines=${lineNo}, inserted=${inserted}, normalized=${normalized}, providers=${providersCompleted}`);

    return new Response(
      JSON.stringify({
        jobId: job.id,
        status: 'finished',
        linesParsed: lineNo,
        rowsInserted: inserted,
        findingsUpserted: normalized,
        providersCompleted
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
