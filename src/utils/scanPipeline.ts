import { supabase } from '@/integrations/supabase/client';

/**
 * Detects which pipeline is being used for a given scan job ID
 * - Simple pipeline: Results stored in maigret_results table
 * - Advanced pipeline: Results stored in scan_jobs/scan_findings tables
 */
export async function detectScanPipeline(
  jobId: string
): Promise<'simple' | 'advanced' | null> {
  try {
    // Check maigret_results first (Simple pipeline)
    const { data: maigretResult, error: maigretError } = await supabase
      .from('maigret_results')
      .select('id')
      .eq('job_id', jobId)
      .maybeSingle();

    if (!maigretError && maigretResult) {
      console.log('[scanPipeline] Detected Simple pipeline for jobId:', jobId);
      return 'simple';
    }

    // Check scan_jobs (Advanced pipeline)
    const { data: scanJob, error: scanJobError } = await supabase
      .from('scan_jobs')
      .select('id')
      .eq('id', jobId)
      .maybeSingle();

    if (!scanJobError && scanJob) {
      console.log('[scanPipeline] Detected Advanced pipeline for jobId:', jobId);
      return 'advanced';
    }

    console.log('[scanPipeline] No pipeline detected for jobId:', jobId);
    return null;
  } catch (error) {
    console.error('[scanPipeline] Error detecting pipeline:', error);
    return null;
  }
}
