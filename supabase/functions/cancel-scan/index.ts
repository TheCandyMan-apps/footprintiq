import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelScanRequest {
  scanId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[cancel-scan] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { scanId }: CancelScanRequest = await req.json();

    if (!scanId) {
      return new Response(
        JSON.stringify({ error: 'scanId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[cancel-scan] Cancelling scan:', scanId, 'for user:', user.id);

    // Get scan details
    const { data: scan, error: scanError } = await supabase
      .from('scan_jobs')
      .select('*, workspace:workspaces!inner(id, owner_id)')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      console.error('[cancel-scan] Scan not found:', scanError);
      return new Response(
        JSON.stringify({ error: 'Scan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to cancel (owner or workspace member)
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', scan.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (!membership && scan.workspace.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to cancel this scan' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if scan is already completed or cancelled
    if (scan.status === 'completed' || scan.status === 'cancelled') {
      return new Response(
        JSON.stringify({ 
          error: `Scan already ${scan.status}`,
          status: scan.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate partial credit refund based on progress
    let creditRefund = 0;
    
    // Get credits spent on this scan from ledger
    const { data: ledgerEntries } = await supabase
      .from('credits_ledger')
      .select('delta')
      .eq('workspace_id', scan.workspace_id)
      .contains('meta', { scan_id: scanId });
    
    const totalCost = ledgerEntries 
      ? Math.abs(ledgerEntries.reduce((sum, entry) => sum + (entry.delta || 0), 0))
      : 0;
    
    if (totalCost > 0 && scan.status === 'running') {
      // Get scan progress from results
      const { data: results, error: resultsError } = await supabase
        .from('scan_results')
        .select('*')
        .eq('job_id', scanId);

      if (!resultsError && results && results.length > 0) {
        // Estimate 50% refund for partial completion
        creditRefund = Math.floor(totalCost * 0.5);
        console.log('[cancel-scan] Partial completion - 50% refund:', creditRefund, 'credits');
      } else {
        // If no results yet, refund full amount
        creditRefund = totalCost;
        console.log('[cancel-scan] No progress - Full refund:', creditRefund, 'credits');
      }
    }

    // Update scan status to partial (cancelled by user)
    const { error: updateError } = await supabase
      .from('scan_jobs')
      .update({
        status: 'partial',
        error: 'Cancelled by user',
        finished_at: new Date().toISOString(),
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('[cancel-scan] Failed to update scan status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cancel scan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process credit refund if any
    if (creditRefund > 0 && scan.workspace_id) {
      const { error: creditError } = await supabase
        .from('credits_ledger')
        .insert({
          workspace_id: scan.workspace_id,
          delta: creditRefund,
          reason: 'scan_cancelled',
          meta: {
            scan_id: scanId,
            cancelled_by: user.id,
            cancelled_at: new Date().toISOString(),
            original_cost: totalCost,
            refund_amount: creditRefund,
          },
        });

      if (creditError) {
        console.error('[cancel-scan] Failed to refund credits:', creditError);
      } else {
        console.log('[cancel-scan] Refunded', creditRefund, 'credits to workspace:', scan.workspace_id);
      }
    }

    // Broadcast cancellation event via Supabase Realtime to both channel patterns
    try {
      const maigretChannel = supabase.channel(`scan_progress_${scanId}`);
      await maigretChannel.subscribe();
      await maigretChannel.send({
        type: 'broadcast',
        event: 'scan_cancelled',
        payload: {
          scanId,
          cancelledBy: user.id,
          cancelledAt: new Date().toISOString(),
          creditRefund,
          message: 'Scan cancelled by user',
        },
      });

      const orchestratorChannel = supabase.channel(`scan_progress:${scanId}`);
      await orchestratorChannel.subscribe();
      await orchestratorChannel.send({
        type: 'broadcast',
        event: 'scan_cancelled',
        payload: {
          scanId,
          cancelledBy: user.id,
          cancelledAt: new Date().toISOString(),
          creditRefund,
          message: 'Scan cancelled by user',
        },
      });
    } catch (broadcastError) {
      console.error('[cancel-scan] Failed to broadcast cancellation:', broadcastError);
      // Don't fail the cancellation if broadcast fails
    }

    console.log('[cancel-scan] Successfully cancelled scan:', scanId);

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        status: 'cancelled',
        creditRefund,
        message: creditRefund > 0 
          ? `Scan cancelled. ${creditRefund} credits refunded.`
          : 'Scan cancelled.',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('[cancel-scan] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
