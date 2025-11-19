-- Phase 1: Emergency repair of stuck scans (FINAL FIX)
-- Fix scans that completed in scan_progress but not in scans table

DO $$
DECLARE
  v_scan_record RECORD;
  v_findings_count INT;
  v_provider_counts JSONB;
  v_high_risk INT;
  v_medium_risk INT;
  v_low_risk INT;
  v_privacy_score INT;
  v_repaired_count INT := 0;
BEGIN
  -- Find scans that are pending in scans table but completed in scan_progress
  FOR v_scan_record IN
    SELECT s.id, s.workspace_id, s.user_id
    FROM scans s
    INNER JOIN scan_progress sp ON s.id = sp.scan_id
    WHERE s.status = 'pending'
      AND sp.status = 'completed'
      AND s.created_at > NOW() - INTERVAL '48 hours'
  LOOP
    -- Get findings count and stats for this scan
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE severity = 'high'),
      COUNT(*) FILTER (WHERE severity = 'medium'),
      COUNT(*) FILTER (WHERE severity = 'low')
    INTO v_findings_count, v_high_risk, v_medium_risk, v_low_risk
    FROM findings
    WHERE scan_id = v_scan_record.id
      AND kind != 'provider_error';
    
    -- Calculate provider counts
    SELECT jsonb_object_agg(provider, count)
    INTO v_provider_counts
    FROM (
      SELECT provider, COUNT(*) as count
      FROM findings
      WHERE scan_id = v_scan_record.id
        AND kind != 'provider_error'
      GROUP BY provider
    ) provider_stats;
    
    -- Default to empty object if no findings
    IF v_provider_counts IS NULL THEN
      v_provider_counts := '{}'::jsonb;
    END IF;
    
    -- Calculate privacy score
    v_privacy_score := GREATEST(0, LEAST(100, 100 - (v_high_risk * 10 + v_medium_risk * 5 + v_low_risk * 2)));
    
    -- Update scans table with reconciled data (no updated_at column)
    UPDATE scans
    SET
      status = 'completed',
      completed_at = NOW(),
      high_risk_count = v_high_risk,
      medium_risk_count = v_medium_risk,
      low_risk_count = v_low_risk,
      privacy_score = v_privacy_score,
      total_sources_found = v_findings_count,
      provider_counts = v_provider_counts
    WHERE id = v_scan_record.id;
    
    v_repaired_count := v_repaired_count + 1;
    
    RAISE NOTICE 'Repaired scan % with % findings', v_scan_record.id, v_findings_count;
  END LOOP;
  
  RAISE NOTICE 'Emergency repair complete. Fixed % scans.', v_repaired_count;
END $$;