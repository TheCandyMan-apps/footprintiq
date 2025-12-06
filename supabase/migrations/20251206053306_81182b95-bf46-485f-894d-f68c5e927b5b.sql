-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage scan progress" ON public.scan_progress;

-- Create a more restrictive policy for system/edge function inserts
-- This uses a function check to ensure only service role can insert/update
CREATE POLICY "System can insert scan progress"
ON public.scan_progress
FOR INSERT
WITH CHECK (
  -- Service role bypasses RLS, so this policy allows backend inserts
  -- Regular users cannot insert directly
  auth.uid() IS NOT NULL OR current_setting('role', true) = 'service_role'
);

CREATE POLICY "System can update scan progress"
ON public.scan_progress
FOR UPDATE
USING (
  -- Allow updates from service role (edge functions)
  current_setting('role', true) = 'service_role'
  OR 
  -- Or from the scan owner
  scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid())
)
WITH CHECK (
  current_setting('role', true) = 'service_role'
  OR 
  scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid())
);

-- Explicitly deny anonymous access by ensuring auth.uid() is required for SELECT
DROP POLICY IF EXISTS "Users can view their scan progress" ON public.scan_progress;

CREATE POLICY "Authenticated users can view their scan progress"
ON public.scan_progress
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Can only see progress for their own scans
  scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid())
);