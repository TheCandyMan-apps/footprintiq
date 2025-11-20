
-- Create function to automatically sync scan limits based on plan/subscription_tier
CREATE OR REPLACE FUNCTION public.sync_workspace_scan_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Set scan_limit_monthly based on plan or subscription_tier
  IF NEW.plan = 'premium' OR NEW.subscription_tier = 'premium' OR 
     NEW.plan = 'business' OR NEW.subscription_tier = 'business' THEN
    NEW.scan_limit_monthly := NULL; -- Unlimited for premium/business
  ELSIF NEW.plan = 'pro' OR NEW.subscription_tier = 'pro' THEN
    NEW.scan_limit_monthly := 100; -- 100 scans for pro
  ELSE
    NEW.scan_limit_monthly := 10; -- 10 scans for free
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically sync scan limits on workspace insert/update
DROP TRIGGER IF EXISTS sync_scan_limits_trigger ON public.workspaces;
CREATE TRIGGER sync_scan_limits_trigger
  BEFORE INSERT OR UPDATE OF plan, subscription_tier
  ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_workspace_scan_limits();
