DROP FUNCTION IF EXISTS public.cleanup_stuck_scans(integer);

CREATE FUNCTION public.cleanup_stuck_scans(timeout_minutes integer DEFAULT 15)
 RETURNS TABLE(cleaned_scan_id uuid, old_status text, new_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cutoff_time timestamptz;
BEGIN
  cutoff_time := NOW() - (timeout_minutes || ' minutes')::interval;
  
  RETURN QUERY
  WITH stuck AS (
    SELECT 
      s.id,
      s.status as prev_status,
      CASE 
        WHEN s.created_at < NOW() - INTERVAL '30 minutes' THEN 'failed'::text
        ELSE 'timeout'::text
      END as next_status
    FROM scans s
    WHERE s.status IN ('pending', 'running')
      AND s.created_at < cutoff_time
    LIMIT 100
  ),
  updated AS (
    UPDATE scans s
    SET 
      status = stuck.next_status,
      completed_at = NOW()
    FROM stuck
    WHERE s.id = stuck.id
    RETURNING s.id, stuck.prev_status, stuck.next_status
  ),
  events_inserted AS (
    INSERT INTO scan_events (scan_id, provider, stage, status, message, metadata)
    SELECT 
      u.id,
      'system',
      'complete',
      u.next_status,
      'Scan automatically cleaned up by system',
      jsonb_build_object('old_status', u.prev_status, 'new_status', u.next_status, 'cleanup_time', NOW())
    FROM updated u
    RETURNING id
  )
  SELECT u.id as cleaned_scan_id, u.prev_status as old_status, u.next_status as new_status FROM updated u;
END;
$function$;