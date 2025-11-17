-- Add workspace_id column to scans table for workspace-based billing
ALTER TABLE public.scans 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create index for query performance
CREATE INDEX idx_scans_workspace_id ON public.scans(workspace_id);

-- Backfill workspace_id from user's primary workspace (best effort)
UPDATE public.scans s
SET workspace_id = (
  SELECT w.id 
  FROM public.workspaces w
  WHERE w.owner_id = s.user_id
  LIMIT 1
)
WHERE s.workspace_id IS NULL;

-- Add comment
COMMENT ON COLUMN public.scans.workspace_id IS 'Reference to workspace for quota tracking and billing';