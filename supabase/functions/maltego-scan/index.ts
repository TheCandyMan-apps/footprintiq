import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaltegoRequest {
  entity: string;
  entityType: 'username' | 'email' | 'ip' | 'domain';
  transforms: string[];
  workspaceId: string;
  saveToCase?: boolean;
  caseTitle?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const request: MaltegoRequest = await req.json();
    console.log('[maltego-scan] Request:', request);

    // Check premium subscription
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['premium', 'enterprise'].includes(userRole.subscription_tier)) {
      return new Response(
        JSON.stringify({ 
          error: 'Premium subscription required',
          upgrade_url: '/pricing'
        }), 
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check workspace membership
    const { data: membership } = await supabaseClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', request.workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Not a workspace member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits (10 credits for Maltego AI scan)
    const MALTEGO_COST = 10;
    const { data: creditCheck } = await supabaseClient.rpc('get_credits_balance', {
      _workspace_id: request.workspaceId
    });

    if (!creditCheck || creditCheck < MALTEGO_COST) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits',
          required: MALTEGO_COST,
          current: creditCheck || 0
        }), 
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .insert({
        user_id: user.id,
        scan_type: 'maltego_ai',
        email: request.entityType === 'email' ? request.entity : null,
        username: request.entityType === 'username' ? request.entity : null,
        status: 'processing',
        workspace_id: request.workspaceId
      })
      .select()
      .single();

    if (scanError || !scan) {
      console.error('[maltego-scan] Failed to create scan:', scanError);
      return new Response(JSON.stringify({ error: 'Failed to create scan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Broadcast initial progress
    const channel = supabaseClient.channel(`maltego_${scan.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        stage: 'initializing',
        message: 'Starting Maltego AI transforms...',
        progress: 0
      }
    });

    // Call Maltego worker
    const workerUrl = Deno.env.get('MALTEGO_WORKER_URL') || 'http://localhost:8080';
    
    try {
      const workerResponse = await fetch(`${workerUrl}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: request.entity,
          transforms: request.transforms,
          timeout: 60
        })
      });

      if (!workerResponse.ok) {
        throw new Error(`Worker returned ${workerResponse.status}`);
      }

      const graphData = await workerResponse.json();
      console.log('[maltego-scan] Graph data:', graphData);

      // Broadcast progress
      await channel.send({
        type: 'broadcast',
        event: 'progress',
        payload: {
          stage: 'processing',
          message: `Processed ${graphData.nodes.length} entities`,
          progress: 80,
          nodesFound: graphData.nodes.length
        }
      });

      // Deduct credits
      await supabaseClient.rpc('spend_credits', {
        _workspace_id: request.workspaceId,
        _cost: MALTEGO_COST,
        _reason: `Maltego AI scan: ${request.entity}`,
        _meta: { scan_id: scan.id, entity: request.entity }
      });

      // Update scan with results
      await supabaseClient
        .from('scans')
        .update({
          status: 'completed',
          results: graphData,
          completed_at: new Date().toISOString()
        })
        .eq('id', scan.id);

      // Save to case if requested
      if (request.saveToCase) {
        const { error: caseError } = await supabaseClient
          .from('cases')
          .insert({
            title: request.caseTitle || `Maltego AI: ${request.entity}`,
            description: `AI-driven OSINT graph analysis for ${request.entity}`,
            user_id: user.id,
            workspace_id: request.workspaceId,
            scan_id: scan.id,
            status: 'open',
            priority: 'medium',
            results: graphData
          });

        if (caseError) {
          console.error('[maltego-scan] Failed to save case:', caseError);
        }
      }

      // Broadcast completion
      await channel.send({
        type: 'broadcast',
        event: 'complete',
        payload: {
          scanId: scan.id,
          nodesFound: graphData.nodes.length,
          edgesFound: graphData.edges.length,
          creditsUsed: MALTEGO_COST
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          scanId: scan.id,
          graph: graphData,
          creditsUsed: MALTEGO_COST
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (workerError) {
      console.error('[maltego-scan] Worker error:', workerError);
      
      // Update scan as failed
      await supabaseClient
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', scan.id);

      // Broadcast failure
      const errorMsg = workerError instanceof Error ? workerError.message : 'Unknown error';
      await channel.send({
        type: 'broadcast',
        event: 'failed',
        payload: { error: errorMsg }
      });

      return new Response(
        JSON.stringify({ error: 'Transform execution failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('[maltego-scan] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
