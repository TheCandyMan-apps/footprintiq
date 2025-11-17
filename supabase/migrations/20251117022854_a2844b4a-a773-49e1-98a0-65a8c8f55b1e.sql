-- Create trigger function to sync subscriptions to workspaces
CREATE OR REPLACE FUNCTION public.sync_subscription_to_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update workspaces table with subscription data
  UPDATE public.workspaces
  SET 
    plan = NEW.plan,
    scan_limit_monthly = NEW.scan_limit_monthly,
    scans_used_monthly = CASE 
      -- Reset scans_used_monthly when entering a new billing period
      WHEN NEW.current_period_start > OLD.current_period_start THEN 0
      -- Otherwise preserve existing count
      ELSE COALESCE(workspaces.scans_used_monthly, NEW.scans_used_monthly, 0)
    END,
    subscription_tier = NEW.plan, -- Keep legacy field in sync
    updated_at = NOW()
  WHERE id = NEW.workspace_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically sync on subscription changes
DROP TRIGGER IF EXISTS sync_subscription_to_workspace_trigger ON public.subscriptions;
CREATE TRIGGER sync_subscription_to_workspace_trigger
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_subscription_to_workspace();

-- Backfill: sync existing subscriptions to workspaces
UPDATE public.workspaces w
SET 
  plan = s.plan,
  scan_limit_monthly = s.scan_limit_monthly,
  scans_used_monthly = COALESCE(s.scans_used_monthly, 0),
  subscription_tier = s.plan
FROM public.subscriptions s
WHERE w.id = s.workspace_id;