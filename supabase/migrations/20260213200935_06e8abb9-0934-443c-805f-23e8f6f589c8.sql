
-- Fix DB functions that reference 'premium' instead of 'pro'
-- (Function updates only — no data migration needed since 'premium' was never in the enum)

-- 1. Fix has_subscription_tier
CREATE OR REPLACE FUNCTION public.has_subscription_tier(_user_id uuid, _required_tier text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        CASE _required_tier
          WHEN 'free' THEN subscription_tier IN ('free', 'pro', 'family')
          WHEN 'pro' THEN subscription_tier IN ('pro', 'family')
          WHEN 'family' THEN subscription_tier = 'family'
          ELSE false
        END
      )
      AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  )
$function$;

-- 2. Fix update_user_subscription
CREATE OR REPLACE FUNCTION public.update_user_subscription(_user_id uuid, _new_tier subscription_tier, _expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result json;
  v_caller_uid uuid;
BEGIN
  v_caller_uid := auth.uid();
  
  IF v_caller_uid IS NOT NULL AND v_caller_uid != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update another user subscription';
  END IF;

  IF _new_tier NOT IN ('free', 'basic', 'pro', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid subscription tier';
  END IF;

  UPDATE public.user_roles
  SET 
    subscription_tier = _new_tier,
    subscription_expires_at = _expires_at
  WHERE user_id = _user_id;

  SELECT json_build_object(
    'user_id', user_id,
    'role', role,
    'subscription_tier', subscription_tier,
    'subscription_expires_at', subscription_expires_at
  ) INTO v_result
  FROM public.user_roles
  WHERE user_id = _user_id;

  RETURN v_result;
END;
$function$;

-- 3. Fix sync_workspace_scan_limits
CREATE OR REPLACE FUNCTION public.sync_workspace_scan_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.plan = 'business' OR NEW.subscription_tier = 'business' OR
     NEW.plan = 'enterprise' OR NEW.subscription_tier = 'enterprise' THEN
    NEW.scan_limit_monthly := NULL;
  ELSIF NEW.plan = 'pro' OR NEW.subscription_tier = 'pro' THEN
    NEW.scan_limit_monthly := 100;
  ELSE
    NEW.scan_limit_monthly := 10;
  END IF;
  
  RETURN NEW;
END;
$function$;
