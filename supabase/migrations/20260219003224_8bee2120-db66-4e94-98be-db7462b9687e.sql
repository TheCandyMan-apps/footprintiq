-- Drop deprecated trial columns from workspaces table
-- These columns are no longer used following the removal of the free trial model
ALTER TABLE public.workspaces
  DROP COLUMN IF EXISTS trial_status,
  DROP COLUMN IF EXISTS trial_started_at,
  DROP COLUMN IF EXISTS trial_ends_at,
  DROP COLUMN IF EXISTS trial_scans_used;