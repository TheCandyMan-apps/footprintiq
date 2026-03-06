
-- Create admin RPC to update user roles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(_user_id uuid, _new_role text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_uid uuid;
  v_result json;
BEGIN
  v_caller_uid := auth.uid();
  
  IF NOT public.has_role(v_caller_uid, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  UPDATE public.user_roles
  SET role = _new_role
  WHERE user_id = _user_id;

  SELECT json_build_object(
    'user_id', user_id,
    'role', role,
    'subscription_tier', subscription_tier
  ) INTO v_result
  FROM public.user_roles
  WHERE user_id = _user_id;

  RETURN v_result;
END;
$function$;
