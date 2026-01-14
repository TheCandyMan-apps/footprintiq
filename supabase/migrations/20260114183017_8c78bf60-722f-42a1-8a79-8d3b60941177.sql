-- Create a function to cleanup stuck scans (can be called by pg_cron or edge function)
CREATE OR REPLACE FUNCTION public.cleanup_stuck_scans(timeout_minutes integer DEFAULT 15)
RETURNS TABLE(scan_id uuid, old_status text, new_status text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_time timestamptz;
BEGIN
  cutoff_time := NOW() - (timeout_minutes || ' minutes')::interval;
  
  RETURN QUERY
  WITH stuck AS (
    SELECT 
      s.id,
      s.status as old_status,
      CASE 
        WHEN s.created_at < NOW() - INTERVAL '30 minutes' THEN 'failed'::text
        ELSE 'timeout'::text
      END as new_status
    FROM scans s
    WHERE s.status IN ('pending', 'running')
      AND s.created_at < cutoff_time
    LIMIT 100
  ),
  updated AS (
    UPDATE scans s
    SET 
      status = stuck.new_status,
      completed_at = NOW(),
      error_message = CASE 
        WHEN stuck.new_status = 'failed' THEN 'Scan timed out after 30+ minutes'
        ELSE 'Scan timed out - no response from workers'
      END
    FROM stuck
    WHERE s.id = stuck.id
    RETURNING s.id, stuck.old_status, stuck.new_status
  ),
  -- Insert scan events for tracking
  events_inserted AS (
    INSERT INTO scan_events (scan_id, event_type, message, metadata)
    SELECT 
      u.id,
      'scan_timeout',
      'Scan automatically cleaned up by system',
      jsonb_build_object('old_status', u.old_status, 'new_status', u.new_status, 'cleanup_time', NOW())
    FROM updated u
    RETURNING scan_id
  )
  SELECT u.id as scan_id, u.old_status, u.new_status FROM updated u;
END;
$$;

-- Grant execute to authenticated users (for edge function calls)
GRANT EXECUTE ON FUNCTION public.cleanup_stuck_scans(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_stuck_scans(integer) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.cleanup_stuck_scans IS 'Cleans up scans stuck in pending/running state for longer than timeout_minutes. Returns list of cleaned up scans.';