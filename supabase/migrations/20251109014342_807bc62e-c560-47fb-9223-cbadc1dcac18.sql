-- Add workspace_id column to scan_jobs
ALTER TABLE public.scan_jobs 
ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id);

-- Migrate existing data: assign to user's first workspace
UPDATE public.scan_jobs sj
SET workspace_id = (
  SELECT workspace_id 
  FROM public.workspace_members wm 
  WHERE wm.user_id = sj.requested_by 
  ORDER BY wm.created_at ASC
  LIMIT 1
)
WHERE workspace_id IS NULL;

-- Make it required going forward
ALTER TABLE public.scan_jobs 
ALTER COLUMN workspace_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_scan_jobs_workspace_id ON public.scan_jobs(workspace_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can insert scan jobs" ON public.scan_jobs;
DROP POLICY IF EXISTS "Users can update own scan jobs" ON public.scan_jobs;
DROP POLICY IF EXISTS "Users can view own scan jobs" ON public.scan_jobs;

-- Create new workspace-based RLS policies
CREATE POLICY "Users can insert scan jobs in their workspace"
ON public.scan_jobs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = scan_jobs.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'analyst')
  )
);

CREATE POLICY "Users can update scan jobs in their workspace"
ON public.scan_jobs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = scan_jobs.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'analyst')
  )
);

CREATE POLICY "Users can view scan jobs in their workspace"
ON public.scan_jobs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = scan_jobs.workspace_id
    AND user_id = auth.uid()
  )
);