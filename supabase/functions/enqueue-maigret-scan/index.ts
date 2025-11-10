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

    // Get user's workspace
    const { data: workspaceMember } = await supabaseUser
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!workspaceMember?.workspace_id) {
      return new Response(
        JSON.stringify({ error: 'No workspace found for user' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workspaceId = workspaceMember.workspace_id;

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
    const estimatedProviders = all_sites ? 400 : 100;

    // Create job record (use admin client to bypass RLS)
    const { data: job, error: jobError } = await supabaseAdmin
      .from('scan_jobs')
      .insert({
        username: username.trim(),
        tags: tags?.trim() || null,
        all_sites: all_sites,
        artifacts: finalArtifacts,
        status: 'running',
        started_at: new Date().toISOString(),
        requested_by: user.id,
        workspace_id: workspaceId,
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
        await supabaseAdmin
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

    // Health check first with detailed diagnostics
    console.log('=== Maigret Worker Configuration ===');
    console.log(`Worker URL: ${WORKER_URL}`);
    console.log(`Worker token configured: ${WORKER_TOKEN ? 'YES' : 'NO'}`);
    console.log(`Job ID: ${job.id}`);
    console.log(`Username: ${username}`);
    
    try {
      const healthUrl = `${WORKER_URL}/health`;
      console.log(`Checking health at: ${healthUrl}`);
      
      const healthCheck = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      console.log(`Health check response: ${healthCheck.status} ${healthCheck.statusText}`);
      console.log(`Health headers:`, Object.fromEntries(healthCheck.headers.entries()));
      
      if (!healthCheck.ok) {
        const healthBody = await healthCheck.text().catch(() => 'Unable to read body');
        console.error(`Health check body:`, healthBody);
        throw new Error(`Worker health check failed: ${healthCheck.status} - ${healthBody}`);
      }
      
      const healthBody = await healthCheck.text();
      console.log('Health check body:', healthBody);
      console.log('✓ Worker health check passed');
    } catch (healthError) {
      console.error('✗ Worker health check failed:', {
        name: healthError.name,
        message: healthError.message,
        stack: healthError.stack
      });
      
      await supabaseAdmin
        .from('scan_jobs')
        .update({
          status: 'error',
          error: `Maigret worker unavailable: ${healthError.message}`,
          finished_at: new Date().toISOString(),
        })
        .eq('id', job.id);
      
      return new Response(
        JSON.stringify({ 
          jobId: job.id, 
          status: 'error', 
          error: 'Username scan service is temporarily unavailable. Please try again later.',
          details: healthError.message
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Retry logic with exponential backoff and enhanced logging
    let resp: Response | null = null;
    let lastError: any;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        console.log(`[Attempt ${attempt}/3] Calling Maigret worker`);
        console.log(`  📍 URL: ${url.toString()}`);
        console.log(`  🔑 Token: ${WORKER_TOKEN ? 'Present (length=' + WORKER_TOKEN.length + ')' : 'MISSING'}`);
        console.log(`  📋 Job ID: ${job.id}`);
        console.log(`  👤 Username: ${username}`);
        console.log(`  📦 Plan: ${plan}`);
        console.log(`  ⏰ Timestamp: ${new Date().toISOString()}`);
        
        resp = await fetch(url, {
          headers: { 'X-Worker-Token': WORKER_TOKEN },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`✅ Worker response received (attempt ${attempt})`);
        console.log(`  📊 Status: ${resp.status} ${resp.statusText}`);
        console.log(`  📝 Headers:`, Object.fromEntries(resp.headers.entries()));
        console.log(`  📄 Content-Type: ${resp.headers.get('content-type')}`);
        console.log(`  📏 Content-Length: ${resp.headers.get('content-length')}`);
        console.log(`  💾 Has body: ${!!resp.body}`);
        console.log(`  🔍 Body readable: ${resp.body?.locked === false}`);
        
        if (resp.ok) {
          console.log(`✓ Scan request successful on attempt ${attempt}`);
          break; // Success
        }
        
        // Check if retryable
        if (resp.status >= 400 && resp.status < 500 && resp.status !== 429) {
          // 4xx client errors (except rate limit) - don't retry
          console.error(`✗ Non-retryable client error: ${resp.status}`);
          lastError = new Error(`Worker error ${resp.status}`);
          break;
        }
        
        console.warn(`⚠ Retryable error on attempt ${attempt}: ${resp.status}`);
        lastError = new Error(`Worker error ${resp.status}`);
      } catch (error: any) {
        lastError = error;
        console.error(`✗ Attempt ${attempt} failed:`, {
          error: error.message,
          name: error.name,
          isTimeout: error.name === 'AbortError'
        });
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`🔄 Retrying scan (attempt ${attempt + 1}/3)...`);
        } else {
          console.error(`✗ All retry attempts exhausted for job ${job.id}`);
        }
      }
    }

    if (!resp || !resp.ok) {
      const errorMsg = lastError?.message || `Worker ${resp?.status || 'unreachable'}`;
      console.error('Worker request failed:', {
        hasResponse: !!resp,
        status: resp?.status,
        statusText: resp?.statusText,
        error: errorMsg
      });
      
      await supabaseAdmin
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
    
    if (!resp.body) {
      console.error('✗ Worker returned empty body (no stream)', {
        status: resp.status,
        headers: Object.fromEntries(resp.headers.entries())
      });
      
      // Try to read any text that might be in the response
      const bodyText = await resp.text().catch(() => 'Unable to read');
      console.error('Response body text:', bodyText);
      
      await supabaseAdmin
        .from('scan_jobs')
        .update({
          status: 'error',
          error: 'Worker returned no stream - API may have changed or worker is misconfigured',
          finished_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ 
          jobId: job.id, 
          status: 'error', 
          error: 'Worker returned no data stream. Please contact support.'
        }),
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

    // Add timeout for streaming phase (60s for initial data)
    let hasReceivedData = false;
    const streamTimeout = setTimeout(() => {
      if (!hasReceivedData) {
        reader.cancel();
        console.error('❌ Stream timeout - no data received from worker after 60s');
        throw new Error('Timeout - no data received from worker');
      }
    }, 60000); // 60 second timeout for first data

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
          hasReceivedData = true; // Mark that we've received data
          
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
      await supabaseAdmin
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
      console.error('❌ CRITICAL: Worker stream completed but ZERO providers returned data');
      console.error('📊 Empty Response Diagnostics:', {
        jobId: job.id,
        username,
        workerUrl: WORKER_URL,
        linesProcessed: lineNo,
        rowsInserted: inserted,
        plan,
        timestamp: new Date().toISOString()
      });
      console.error('⚠️  Possible causes:');
      console.error('  1. Worker configuration issue (Maigret not properly installed)');
      console.error('  2. Worker missing environment variables or API keys');
      console.error('  3. All target sites blocking/rate-limiting the worker');
      console.error('  4. Worker needs updating/redeployment');
      console.error('  🔧 ACTION REQUIRED: Check worker logs and configuration');
      
      await supabaseAdmin
        .from('scan_jobs')
        .update({
          status: 'error',
          error: 'Worker empty - config issue. Check admin logs or retry.',
          finished_at: new Date().toISOString(),
        })
        .eq('id', job.id);
      
      // Broadcast completion event for zero-result scans
      await supabaseAdmin.channel(`scan_progress_${job.id}`).send({
        type: 'broadcast',
        event: 'scan_complete',
        payload: {
          status: 'error',
          totalProviders: 0,
          totalFindings: 0,
          message: 'No results – check admin logs or retry',
        },
      });
      
      // Auto-create partial case for tracking
      try {
        const { data: caseData } = await supabaseAdmin
          .from('cases')
          .insert({
            user_id: user.id,
            workspace_id: workspaceId,
            title: `Empty scan: ${username}`,
            description: 'Scan returned no results - Worker may need configuration',
            status: 'open',
            priority: 'low'
          })
          .select()
          .single();
        
        if (caseData) {
          console.log(`📝 Auto-created partial case: ${caseData.id}`);
        }
      } catch (caseError) {
        console.error('Failed to auto-create partial case:', caseError);
      }
        
      return new Response(
        JSON.stringify({
          jobId: job.id,
          status: 'error',
          error: 'No results – check admin logs or retry',
          adminMessage: 'Worker configuration issue detected',
          debug: {
            linesProcessed: lineNo,
            inserted,
            normalized
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✓ Stream processing completed successfully', {
      providersCompleted,
      linesProcessed: lineNo,
      inserted,
      normalized
    });

    await supabaseAdmin
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
