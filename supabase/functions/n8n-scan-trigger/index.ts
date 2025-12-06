import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_SCAN_WEBHOOK_URL');
    const workerUrl = Deno.env.get('OSINT_WORKER_URL');
    const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');

    if (!n8nWebhookUrl) {
      console.error('N8N_SCAN_WEBHOOK_URL not configured');
      return new Response(JSON.stringify({ error: 'n8n webhook not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { username, workspaceId, scanType = 'username' } = body;

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[n8n-scan-trigger] Starting scan for username: ${username.substring(0, 3)}***`);

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        scan_type: scanType,
        username: username,
        status: 'pending',
        provider_counts: {},
      })
      .select()
      .single();

    if (scanError) {
      console.error('[n8n-scan-trigger] Failed to create scan:', scanError);
      return new Response(JSON.stringify({ error: 'Failed to create scan record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[n8n-scan-trigger] Created scan record: ${scan.id}`);

    // Define providers for username scans
    // Use providers matching what n8n workflow actually runs
    const providers = ['sherlock', 'gosearch', 'maigret', 'holehe', 'whatsmyname'];

    // Create initial scan_progress record so UI can track progress
    const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error: progressError } = await serviceClient
      .from('scan_progress')
      .upsert({
        scan_id: scan.id,
        status: 'running',
        total_providers: providers.length,
        completed_providers: 0,
        current_providers: providers,
        findings_count: 0,
        message: `Starting scan with ${providers.length} providers...`,
        error: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'scan_id' });

    if (progressError) {
      console.error('[n8n-scan-trigger] Failed to create scan_progress:', progressError);
    } else {
      console.log(`[n8n-scan-trigger] Created scan_progress for ${scan.id}`);
    }

    // Trigger n8n webhook (fire and forget using fetch without await)
    const n8nPayload = {
      scanId: scan.id,
      username: username,
      workspaceId: workspaceId,
      userId: user.id,
      workerUrl: workerUrl,
      workerToken: workerToken,
      supabaseUrl: supabaseUrl,
      anonKey: supabaseAnonKey,
    };

    // Fire n8n webhook asynchronously - don't wait for response
    console.log(`[n8n-scan-trigger] Calling n8n webhook for scan ${scan.id}`);
    
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    }).then(async (n8nResponse) => {
      // Use service role to update status after n8n responds
      const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      
      if (!n8nResponse.ok) {
        console.error(`[n8n-scan-trigger] n8n webhook failed: ${n8nResponse.status}`);
        await serviceClient
          .from('scans')
          .update({ status: 'failed', error_message: 'n8n webhook failed' })
          .eq('id', scan.id);
      } else {
        console.log(`[n8n-scan-trigger] n8n webhook accepted scan ${scan.id}`);
        await serviceClient
          .from('scans')
          .update({ status: 'running' })
          .eq('id', scan.id);
      }
    }).catch((err) => {
      console.error('[n8n-scan-trigger] Error calling n8n:', err);
    });

    // Return immediately with scan ID
    return new Response(JSON.stringify({ 
      id: scan.id,
      scanId: scan.id,
      status: 'accepted',
      message: 'Scan queued for processing via n8n'
    }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('[n8n-scan-trigger] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
