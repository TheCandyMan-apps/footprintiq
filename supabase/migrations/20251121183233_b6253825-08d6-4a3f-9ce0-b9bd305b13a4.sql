-- Create function to set workspace tier from owner's subscription
CREATE OR REPLACE FUNCTION public.set_workspace_tier_from_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  owner_tier text;
BEGIN
  -- Get owner's subscription tier
  SELECT subscription_tier INTO owner_tier
  FROM public.user_roles
  WHERE user_id = NEW.owner_id;
  
  -- Map subscription tier to workspace plan
  IF owner_tier = 'premium' THEN
    NEW.plan := 'premium';
    NEW.subscription_tier := 'premium';
    NEW.scan_limit_monthly := NULL; -- unlimited
  ELSIF owner_tier = 'enterprise' THEN
    NEW.plan := 'business';
    NEW.subscription_tier := 'enterprise';
    NEW.scan_limit_monthly := NULL; -- unlimited
  ELSIF owner_tier = 'basic' THEN
    NEW.plan := 'pro';
    NEW.subscription_tier := 'pro';
    NEW.scan_limit_monthly := 100;
  ELSE
    -- Default to free
    NEW.plan := 'free';
    NEW.subscription_tier := 'free';
    NEW.scan_limit_monthly := 10;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to run on workspace insert
DROP TRIGGER IF EXISTS set_workspace_tier_trigger ON public.workspaces;
CREATE TRIGGER set_workspace_tier_trigger
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_workspace_tier_from_owner();