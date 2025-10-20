import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScheduleSchema = z.object({
  action: z.literal('schedule'),
  userId: z.string().uuid(),
  scanId: z.string().uuid(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

const ExecuteSchema = z.object({
  action: z.literal('execute'),
});

const CompareSchema = z.object({
  action: z.literal('compare'),
  userId: z.string().uuid(),
  firstScanId: z.string().uuid(),
  latestScanId: z.string().uuid(),
});

const RequestSchema = z.discriminatedUnion('action', [
  ScheduleSchema,
  ExecuteSchema,
  CompareSchema,
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const data = validation.data;
    const action = data.action;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate user ownership for non-execute actions
    if (action !== 'execute') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
        const userId = 'userId' in data ? data.userId : null;
        if (user && userId && userId !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    console.log('Monitoring scheduler action:', action);

    if (action === 'schedule') {
      if (!('userId' in data) || !('scanId' in data)) {
        throw new Error('Invalid schedule data');
      }
      
      const monitoringConfig = {
        user_id: data.userId,
        original_scan_id: data.scanId,
        frequency: data.frequency || 'weekly',
        next_scan_date: calculateNextScanDate(data.frequency || 'weekly'),
        active: true,
      };

      // Store monitoring configuration
      // (Would create a new table: monitoring_schedules)
      console.log('Monitoring scheduled:', monitoringConfig);

      return new Response(
        JSON.stringify({
          success: true,
          config: monitoringConfig,
          message: `Monitoring scheduled: ${data.frequency || 'weekly'} scans`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'execute') {
      // Find all active schedules due for execution
      const { data: dueSchedules, error: schedError } = await supabase
        .from('monitoring_schedules')
        .select('*, scans(*)')
        .eq('is_active', true)
        .lte('next_run', new Date().toISOString());

      if (schedError) throw schedError;

      const executedScans = {
        total: dueSchedules?.length || 0,
        successful: 0,
        failed: 0,
        changesDetected: 0,
      };

      for (const schedule of dueSchedules || []) {
        try {
          // Update schedule
          await supabase
            .from('monitoring_schedules')
            .update({
              last_run: new Date().toISOString(),
              next_run: calculateNextScanDate(schedule.frequency)
            })
            .eq('id', schedule.id);

          executedScans.successful++;
        } catch (error) {
          console.error('Failed to process schedule:', schedule.id, error);
          executedScans.failed++;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          execution: executedScans,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'compare') {
      if (!('firstScanId' in data) || !('latestScanId' in data) || !('userId' in data)) {
        throw new Error('Invalid compare data');
      }
      
      const { firstScanId, latestScanId, userId } = data;

      // Get both scans
      const { data: firstScan } = await supabase
        .from('scans')
        .select('*, data_sources(*), social_profiles(*)')
        .eq('id', firstScanId)
        .single();

      const { data: latestScan } = await supabase
        .from('scans')
        .select('*, data_sources(*), social_profiles(*)')
        .eq('id', latestScanId)
        .single();

      if (!firstScan || !latestScan) {
        throw new Error('One or both scans not found');
      }

      // Calculate differences
      const comparison = {
        privacy_score_change: latestScan.privacy_score - firstScan.privacy_score,
        new_sources: latestScan.total_sources_found - firstScan.total_sources_found,
        sources_removed: Math.max(0, firstScan.total_sources_found - latestScan.total_sources_found),
        risk_level_changes: {
          high: latestScan.high_risk_count - firstScan.high_risk_count,
          medium: latestScan.medium_risk_count - firstScan.medium_risk_count,
          low: latestScan.low_risk_count - firstScan.low_risk_count,
        },
        improvement_percentage: calculateImprovement(
          firstScan.privacy_score,
          latestScan.privacy_score
        ),
      };

      // Store comparison
      const { error: compError } = await supabase
        .from('scan_comparisons')
        .insert({
          user_id: userId,
          first_scan_id: firstScanId,
          latest_scan_id: latestScanId,
          sources_removed: comparison.sources_removed,
          improvement_percentage: comparison.improvement_percentage,
        });

      if (compError) console.error('Error storing comparison:', compError);

      return new Response(
        JSON.stringify({
          success: true,
          comparison,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Monitoring scheduler error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing monitoring request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateNextScanDate(frequency: string): string {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 7); // Default to weekly
  }
  
  return now.toISOString();
}

function calculateImprovement(oldScore: number, newScore: number): number {
  if (oldScore === 0) return 0;
  return Math.round(((newScore - oldScore) / oldScore) * 100);
}
