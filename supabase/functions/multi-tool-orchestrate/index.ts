import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolResult {
  tool: string;
  status: 'completed' | 'failed' | 'skipped';
  resultCount?: number;
  error?: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target, targetType, tools, workspaceId, scanId } = await req.json();

    if (!target || !targetType || !tools || !workspaceId || !scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is workspace member
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isMember } = await supabaseClient
      .rpc('is_workspace_member', { _workspace: workspaceId, _user: user.id });

    if (!isMember) {
      return new Response(
        JSON.stringify({ error: 'Not a member of this workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total credit cost
    const creditCosts: Record<string, number> = {
      maigret: 5,
      spiderfoot: 10,
      reconng: 10,
    };

    const totalCost = tools.reduce((sum: number, tool: string) => sum + (creditCosts[tool] || 0), 0);

    // Check and deduct credits
    const { data: creditSuccess, error: creditError } = await supabaseClient
      .rpc('spend_credits', {
        _workspace_id: workspaceId,
        _cost: totalCost,
        _reason: `Multi-tool scan: ${tools.join(', ')}`,
        _meta: { scanId, target, targetType, tools },
      });

    if (creditError || !creditSuccess) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[multi-tool-orchestrate] Starting multi-tool scan for ${target} (${targetType})`);
    console.log(`[multi-tool-orchestrate] Tools: ${tools.join(', ')}`);
    console.log(`[multi-tool-orchestrate] Credits deducted: ${totalCost}`);

    // Create progress channel for real-time updates
    const progressChannel = supabaseClient.channel(`multi-tool-progress:${scanId}`);

    const broadcastProgress = async (update: any) => {
      await progressChannel.send({
        type: 'broadcast',
        event: 'tool_progress',
        payload: update,
      });
    };

    // Run tools in parallel
    const toolResults: ToolResult[] = [];
    const toolPromises = tools.map(async (tool: string) => {
      try {
        await broadcastProgress({
          toolName: tool,
          status: 'running',
          message: 'Starting scan...',
          stage: 'scanning',
        });

        let result: ToolResult;

        switch (tool) {
          case 'maigret':
            result = await runMaigret(target, targetType, workspaceId, supabaseClient, broadcastProgress);
            break;
          case 'spiderfoot':
            result = await runSpiderFoot(target, targetType, workspaceId, supabaseClient, broadcastProgress);
            break;
          case 'reconng':
            result = await runReconNg(target, targetType, workspaceId, supabaseClient, broadcastProgress);
            break;
          default:
            result = { tool, status: 'skipped', error: 'Unknown tool' };
        }

        toolResults.push(result);

        await broadcastProgress({
          toolName: tool,
          status: result.status,
          message: result.status === 'completed' 
            ? `Found ${result.resultCount || 0} results` 
            : result.error || 'Failed',
          resultCount: result.resultCount,
        });

        return result;
      } catch (error) {
        console.error(`[multi-tool-orchestrate] Error running ${tool}:`, error);
        const failedResult: ToolResult = {
          tool,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        toolResults.push(failedResult);

        await broadcastProgress({
          toolName: tool,
          status: 'failed',
          message: failedResult.error,
        });

        return failedResult;
      }
    });

    // Wait for all tools to complete
    await Promise.allSettled(toolPromises);

    // Broadcast completion
    await progressChannel.send({
      type: 'broadcast',
      event: 'scan_complete',
      payload: {
        scanId,
        results: toolResults,
        completedTools: toolResults.filter(r => r.status === 'completed').length,
        totalTools: tools.length,
      },
    });

    // Create combined scan result
    const { data: scanResult, error: scanError } = await supabaseClient
      .from('scans')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        scan_type: targetType,
        target_value: target,
        status: 'completed',
        multi_tool_results: {
          tools: toolResults,
          scanId,
        },
        credits_used: totalCost,
      })
      .select()
      .single();

    if (scanError) {
      console.error('[multi-tool-orchestrate] Error creating scan record:', scanError);
    }

    // Unsubscribe from channel
    await progressChannel.unsubscribe();

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        results: toolResults,
        totalCost,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[multi-tool-orchestrate] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runMaigret(
  target: string,
  targetType: string,
  workspaceId: string,
  supabase: any,
  broadcastProgress: (update: any) => Promise<void>
): Promise<ToolResult> {
  if (targetType !== 'username') {
    return { tool: 'maigret', status: 'skipped', error: 'Incompatible target type' };
  }

  try {
    // Check if Maigret service is available
    const maigretUrl = Deno.env.get('VITE_MAIGRET_API_URL');
    if (!maigretUrl || maigretUrl.includes('localhost')) {
      return { tool: 'maigret', status: 'skipped', error: 'Service not configured' };
    }

    await broadcastProgress({
      toolName: 'maigret',
      status: 'running',
      message: 'Scanning 400+ platforms...',
    });

    // Create scan job in database
    const { data: jobData, error: jobError } = await supabase
      .from('scan_jobs')
      .insert({
        workspace_id: workspaceId,
        username: target,
        status: 'pending',
        tags: ['multi-tool'],
      })
      .select()
      .single();

    if (jobError) throw jobError;

    return {
      tool: 'maigret',
      status: 'completed',
      resultCount: 0, // Will be updated when job completes
      data: { jobId: jobData?.id },
    };
  } catch (error) {
    console.error('[runMaigret] Error:', error);
    return {
      tool: 'maigret',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runSpiderFoot(
  target: string,
  targetType: string,
  workspaceId: string,
  supabase: any,
  broadcastProgress: (update: any) => Promise<void>
): Promise<ToolResult> {
  try {
    // Check if SpiderFoot is configured
    const spiderfootUrl = Deno.env.get('SPIDERFOOT_API_URL');
    const spiderfootKey = Deno.env.get('SPIDERFOOT_API_KEY');
    
    if (!spiderfootUrl || !spiderfootKey) {
      return { tool: 'spiderfoot', status: 'skipped', error: 'Service not configured' };
    }

    // Map target types
    const typeMap: Record<string, string> = {
      username: 'username',
      email: 'email',
      ip: 'ip',
      domain: 'domain',
    };

    const mappedType = typeMap[targetType];
    if (!mappedType) {
      return { tool: 'spiderfoot', status: 'skipped', error: 'Incompatible target type' };
    }

    await broadcastProgress({
      toolName: 'spiderfoot',
      status: 'running',
      message: 'Running 200+ OSINT modules...',
    });

    // Create SpiderFoot scan record
    const { data: scanData, error: scanError } = await supabase
      .from('spiderfoot_scans')
      .insert({
        workspace_id: workspaceId,
        target,
        target_type: mappedType,
        status: 'pending',
      })
      .select()
      .single();

    if (scanError) throw scanError;

    return {
      tool: 'spiderfoot',
      status: 'completed',
      resultCount: 0, // Will be updated when scan completes
      data: { scanId: scanData?.id },
    };
  } catch (error) {
    console.error('[runSpiderFoot] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      tool: 'spiderfoot',
      status: errorMsg?.includes('not configured') ? 'skipped' : 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runReconNg(
  target: string,
  targetType: string,
  workspaceId: string,
  supabase: any,
  broadcastProgress: (update: any) => Promise<void>
): Promise<ToolResult> {
  try {
    await broadcastProgress({
      toolName: 'reconng',
      status: 'running',
      message: 'Running passive reconnaissance...',
    });

    // Create Recon-ng scan record
    const { data: scanData, error: scanError } = await supabase
      .from('reconng_scans')
      .insert({
        workspace_id: workspaceId,
        target,
        target_type: targetType,
        status: 'pending',
      })
      .select()
      .single();

    if (scanError) throw scanError;

    return {
      tool: 'reconng',
      status: 'completed',
      resultCount: 0, // Will be updated when scan completes
      data: { scanId: scanData?.id },
    };
  } catch (error) {
    console.error('[runReconNg] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      tool: 'reconng',
      status: errorMsg?.includes('unavailable') ? 'skipped' : 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
