import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

interface UsageEvent {
  workspaceId: string;
  type: 'scan' | 'darkweb_scan' | 'api_call' | 'ai_query';
  count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workspaceId, type, count = 1 }: UsageEvent = await req.json();

    if (!workspaceId || !type) {
      return bad(400, 'workspaceId and type required');
    }

    // Get current period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get or create usage record
    const { data: existing, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('period_start', periodStart.toISOString())
      .single();

    const columnMap = {
      scan: 'scans_count',
      darkweb_scan: 'darkweb_scans_count',
      api_call: 'api_calls_count',
      ai_query: 'ai_queries_count',
    };

    const column = columnMap[type];
    if (!column) {
      return bad(400, 'invalid_type');
    }

    // Get workspace tier and quotas
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('plan')
      .eq('id', workspaceId)
      .single();

    const { data: quotas } = await supabase
      .from('subscription_quotas')
      .select('*')
      .eq('tier', workspace?.plan || 'free')
      .single();

    if (existing) {
      // Update existing record
      const newCount = (existing[column] || 0) + count;
      
      // Calculate overage
      let overageColumn = '';
      let overageFee = 0;
      
      if (type === 'scan' && quotas?.scans_per_month !== -1) {
        overageColumn = 'overage_scans';
        const overage = Math.max(0, newCount - (quotas?.scans_per_month || 0));
        overageFee = overage * 1.50; // $1.50 per scan overage
      } else if (type === 'darkweb_scan' && quotas?.darkweb_scans_per_month !== -1) {
        overageColumn = 'overage_darkweb';
        const overage = Math.max(0, newCount - (quotas?.darkweb_scans_per_month || 0));
        overageFee = overage * 5.00; // $5.00 per dark web scan overage
      }

      const updateData: any = { [column]: newCount };
      if (overageColumn) {
        updateData[overageColumn] = Math.max(0, newCount - (quotas?.[`${type}s_per_month`] || 0));
        updateData.overage_fees_usd = (existing.overage_fees_usd || 0) + overageFee;
      }

      await supabase
        .from('usage_tracking')
        .update(updateData)
        .eq('id', existing.id);

    } else {
      // Create new record
      await supabase.from('usage_tracking').insert({
        workspace_id: workspaceId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        [column]: count,
      });
    }

    // Check if approaching limit (90% threshold) and send notification
    const { data: updatedUsage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('period_start', periodStart.toISOString())
      .single();

    if (updatedUsage && quotas) {
      const quotaKey = `${type}s_per_month`;
      const limit = quotas[quotaKey];
      const current = updatedUsage[column];
      
      if (limit !== -1 && current >= limit * 0.9) {
        // Trigger notification (could invoke another function here)
        console.log(`[usage-track] Warning: ${workspaceId} at ${Math.round(current / limit * 100)}% of ${type} quota`);
      }
    }

    return ok({ 
      tracked: true, 
      type, 
      count,
      period: periodStart.toISOString() 
    });

  } catch (error) {
    console.error('[usage-track] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});