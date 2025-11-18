-- Update workspace to premium tier
UPDATE public.workspaces 
SET 
  plan = 'premium',
  subscription_tier = 'premium',
  updated_at = NOW()
WHERE id = '39a55e0d-54e2-41e3-a487-c50077e2f968';

-- Fix the stuck scan
UPDATE public.scans
SET 
  status = 'error',
  completed_at = NOW()
WHERE id = '0bfc0a05-0bf0-429f-85f5-e708738ae07f'
  AND status = 'pending';

-- Verify sync_subscription_to_workspace trigger exists and recreate if needed
DROP TRIGGER IF EXISTS sync_subscription_to_workspace_trigger ON public.subscriptions;

CREATE OR REPLACE FUNCTION public.sync_subscription_to_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update workspaces table with subscription data
  UPDATE public.workspaces
  SET 
    plan = NEW.plan,
    subscription_tier = NEW.plan,
    scan_limit_monthly = NEW.scan_limit_monthly,
    scans_used_monthly = CASE 
      WHEN NEW.current_period_start > OLD.current_period_start THEN 0
      ELSE COALESCE(workspaces.scans_used_monthly, NEW.scans_used_monthly, 0)
    END,
    updated_at = NOW()
  WHERE id = NEW.workspace_id;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER sync_subscription_to_workspace_trigger
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_subscription_to_workspace();

-- Also create trigger for user_roles to workspace sync
DROP TRIGGER IF EXISTS sync_user_role_to_workspace_trigger ON public.user_roles;

CREATE OR REPLACE FUNCTION public.sync_user_role_to_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update workspaces owned by this user with their subscription tier
  UPDATE public.workspaces
  SET 
    subscription_tier = NEW.subscription_tier,
    plan = CASE 
      WHEN NEW.subscription_tier = 'premium' THEN 'premium'
      WHEN NEW.subscription_tier = 'enterprise' THEN 'business'
      WHEN NEW.subscription_tier = 'basic' THEN 'pro'
      ELSE 'free'
    END,
    updated_at = NOW()
  WHERE owner_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER sync_user_role_to_workspace_trigger
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_to_workspace();