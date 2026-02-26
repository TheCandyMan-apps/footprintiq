
-- Create a safe view for shared_reports that excludes password_hash
CREATE OR REPLACE VIEW public.shared_reports_safe
WITH (security_invoker = true)
AS
SELECT 
  id, 
  user_id, 
  scan_id, 
  share_token, 
  expires_at, 
  view_count, 
  is_active, 
  created_at,
  -- Expose whether a password is set, but NOT the hash itself
  (password_hash IS NOT NULL) AS has_password
FROM public.shared_reports;

COMMENT ON VIEW public.shared_reports_safe IS 'Safe view of shared_reports that excludes password_hash column. Use this for all client-side queries.';
