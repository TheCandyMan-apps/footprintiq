
-- Fix sync_user_role_to_workspace: replace 'premium' with 'pro'
CREATE OR REPLACE FUNCTION public.sync_user_role_to_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.workspaces
  SET 
    subscription_tier = NEW.subscription_tier::text,
    plan = CASE 
      WHEN NEW.subscription_tier = 'pro'::subscription_tier THEN 'pro'
      WHEN NEW.subscription_tier = 'enterprise'::subscription_tier THEN 'business'
      WHEN NEW.subscription_tier = 'basic'::subscription_tier THEN 'pro'
      ELSE 'free'
    END,
    updated_at = NOW()
  WHERE owner_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;
