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
    // Check scans table first (Advanced pipeline - primary)
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id')
      .eq('id', jobId)
      .maybeSingle();

    if (!scanError && scan) {
      console.log('[scanPipeline] Detected Advanced pipeline for jobId:', jobId);
      return 'advanced';
    }

    // Check findings table as fallback for advanced pipeline
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('id')
      .eq('scan_id', jobId)
      .limit(1)
      .maybeSingle();

    if (!findingsError && findings) {
      console.log('[scanPipeline] Detected Advanced pipeline (via findings) for jobId:', jobId);
      return 'advanced';
    }

    // Check maigret_results (Simple/legacy pipeline)
    const { data: maigretResult, error: maigretError } = await supabase
      .from('maigret_results')
      .select('id')
      .eq('job_id', jobId)
      .maybeSingle();

    if (!maigretError && maigretResult) {
      console.log('[scanPipeline] Detected Simple pipeline for jobId:', jobId);
      return 'simple';
    }

    console.log('[scanPipeline] No pipeline detected for jobId:', jobId);
    return null;
  } catch (error) {
    console.error('[scanPipeline] Error detecting pipeline:', error);
    return null;
  }
}
