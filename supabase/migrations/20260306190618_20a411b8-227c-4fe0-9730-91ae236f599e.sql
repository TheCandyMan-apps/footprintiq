
-- Fix update_user_subscription to allow admins to update other users
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
  
  -- Allow if: caller is the user themselves, caller is admin, or called via service_role (no auth.uid)
  IF v_caller_uid IS NOT NULL 
     AND v_caller_uid != _user_id 
     AND NOT public.has_role(v_caller_uid, 'admin') THEN
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
