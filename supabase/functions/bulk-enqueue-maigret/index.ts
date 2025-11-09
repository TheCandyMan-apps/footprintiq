import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkScanRequest {
  usernames: string[];
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

    const body: BulkScanRequest = await req.json();
    const { usernames, tags, all_sites = false, artifacts = [] } = body;

    if (!usernames || usernames.length === 0) {
      return new Response(JSON.stringify({ error: 'Usernames array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user entitlement - must be premium for bulk
    const { data: entitlement } = await supabaseClient
      .from('user_entitlements')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const plan = entitlement?.plan || 'standard';

    if (plan !== 'premium') {
      return new Response(
        JSON.stringify({ error: 'Bulk scanning requires Premium plan' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's workspace
    const { data: workspace } = await supabaseClient
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!workspace) {
      return new Response(
        JSON.stringify({ error: 'No workspace found for user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const dailyLimit = parseInt(Deno.env.get('PUBLIC_PREMIUM_SCAN_DAILY_JOBS') || '200');

    // Check daily job limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabaseClient
      .from('scan_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by', user.id)
      .gte('created_at', today.toISOString());

    const remainingJobs = dailyLimit - (todayCount || 0);
    
    if (remainingJobs <= 0) {
      return new Response(
        JSON.stringify({ error: `Daily job limit reached (${dailyLimit})` }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Limit usernames to remaining quota
    const jobsToCreate = Math.min(usernames.length, remainingJobs);
    const jobIds: string[] = [];

    // Create jobs for each username
    for (let i = 0; i < jobsToCreate; i++) {
      const username = usernames[i].trim();
      if (!username) continue;

      const { data: job, error: jobError } = await supabaseClient
        .from('scan_jobs')
        .insert({
          username,
          tags: tags?.trim() || null,
          all_sites,
          artifacts,
          status: 'queued',
          requested_by: user.id,
          workspace_id: workspace.workspace_id,
          plan,
        })
        .select()
        .single();

      if (!jobError && job) {
        jobIds.push(job.id);
      }
    }

    return new Response(
      JSON.stringify({
        job_ids: jobIds,
        created: jobIds.length,
        skipped: usernames.length - jobsToCreate,
        message: jobIds.length < usernames.length
          ? `Created ${jobIds.length} jobs. ${usernames.length - jobsToCreate} skipped due to daily limit.`
          : `Created ${jobIds.length} jobs`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
