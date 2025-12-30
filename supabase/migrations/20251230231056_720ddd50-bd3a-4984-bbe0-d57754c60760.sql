-- Add trial tracking columns to workspaces table
ALTER TABLE public.workspaces 
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_scans_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT NULL;

-- Add constraint for trial_status values
ALTER TABLE public.workspaces 
  DROP CONSTRAINT IF EXISTS workspaces_trial_status_check;
  
ALTER TABLE public.workspaces 
  ADD CONSTRAINT workspaces_trial_status_check 
  CHECK (trial_status IS NULL OR trial_status IN ('active', 'converted', 'cancelled', 'expired'));

-- Add trial flag to scans table
ALTER TABLE public.scans 
  ADD COLUMN IF NOT EXISTS is_trial_scan BOOLEAN DEFAULT FALSE;

-- Create index for efficient trial queries
CREATE INDEX IF NOT EXISTS idx_workspaces_trial_status 
  ON public.workspaces(trial_status) 
  WHERE trial_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scans_trial 
  ON public.scans(is_trial_scan, workspace_id) 
  WHERE is_trial_scan = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN public.workspaces.trial_status IS 'Pro Preview trial status: active, converted, cancelled, expired';
COMMENT ON COLUMN public.workspaces.trial_scans_used IS 'Number of Pro scans used during trial (max 3)';
COMMENT ON COLUMN public.scans.is_trial_scan IS 'Whether this scan was created during a Pro Preview trial';