-- Helper function to check for stuck scans (admin only)
CREATE OR REPLACE FUNCTION public.get_stuck_scans(minutes_threshold INTEGER DEFAULT 5)
RETURNS TABLE (
  scan_id UUID,
  scan_type TEXT,
  target_value TEXT,
  status TEXT,
  stuck_minutes INTEGER,
  workspace_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS scan_id,
    s.scan_type::TEXT,
    COALESCE(s.username, s.email, s.phone, 'unknown') AS target_value,
    s.status,
    EXTRACT(EPOCH FROM (NOW() - s.created_at))::INTEGER / 60 AS stuck_minutes,
    s.workspace_id,
    s.created_at
  FROM scans s
  WHERE s.status = 'pending'
    AND s.created_at < NOW() - (minutes_threshold || ' minutes')::INTERVAL
  ORDER BY s.created_at ASC
  LIMIT 100;
END;
$$;

-- Grant execute to authenticated users (they'll only see their workspace's scans via RLS)
GRANT EXECUTE ON FUNCTION public.get_stuck_scans(INTEGER) TO authenticated;