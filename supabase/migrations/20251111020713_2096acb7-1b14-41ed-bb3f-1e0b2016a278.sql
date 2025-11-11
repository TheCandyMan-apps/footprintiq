-- Add RLS policies for data_sources table
-- Users can view data_sources from their own scans
CREATE POLICY "Users can view own data_sources"
ON public.data_sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = data_sources.scan_id
    AND scans.user_id = auth.uid()
  )
);

-- Add RLS policies for removal_requests table
-- Users can view their own removal requests
CREATE POLICY "Users can view own removal_requests"
ON public.removal_requests
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own removal requests
CREATE POLICY "Users can insert own removal_requests"
ON public.removal_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own removal requests
CREATE POLICY "Users can update own removal_requests"
ON public.removal_requests
FOR UPDATE
USING (user_id = auth.uid());