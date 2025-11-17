-- Add billing/quota columns to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS scans_used_monthly integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scan_limit_monthly integer;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_quota ON public.workspaces(plan, scans_used_monthly);

-- Migrate existing subscription_tier to plan column
UPDATE public.workspaces 
SET plan = COALESCE(subscription_tier, 'free')
WHERE plan IS NULL OR plan = 'free';

-- Set quota limits based on plan
UPDATE public.workspaces 
SET scan_limit_monthly = CASE plan
  WHEN 'free' THEN 10
  WHEN 'pro' THEN 100
  WHEN 'business' THEN NULL  -- unlimited
  ELSE 10
END
WHERE scan_limit_monthly IS NULL;

-- Set scans_used_monthly to 0 if NULL
UPDATE public.workspaces
SET scans_used_monthly = 0
WHERE scans_used_monthly IS NULL;

-- Create function to reset monthly scans (called by cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_workspace_scans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset scans_used_monthly for all workspaces on the 1st of each month
  UPDATE public.workspaces
  SET scans_used_monthly = 0
  WHERE scans_used_monthly > 0;
END;
$$;