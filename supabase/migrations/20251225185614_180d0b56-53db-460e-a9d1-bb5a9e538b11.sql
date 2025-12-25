-- Fix update_user_status function - remove incorrect ::text cast for entity_id
CREATE OR REPLACE FUNCTION public.update_user_status(_user_id uuid, _new_status text, _reason text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_uid uuid;
  v_old_status text;
  v_result json;
BEGIN
  -- Get the calling user's ID
  v_caller_uid := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_uid, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get current status
  SELECT status INTO v_old_status
  FROM public.profiles
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update status
  UPDATE public.profiles
  SET 
    status = _new_status,
    status_changed_at = now(),
    status_reason = _reason,
    status_changed_by = v_caller_uid
  WHERE user_id = _user_id;
  
  -- Log to audit trail
  INSERT INTO public.user_status_history (user_id, previous_status, new_status, reason, changed_by)
  VALUES (_user_id, v_old_status, _new_status, _reason, v_caller_uid);
  
  -- Log to activity_logs - entity_id is UUID, not text
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller_uid, 'user.status_changed', 'user', _user_id, 
    jsonb_build_object('previous_status', v_old_status, 'new_status', _new_status, 'reason', _reason));
  
  RETURN json_build_object('success', true, 'previous_status', v_old_status, 'new_status', _new_status);
END;
$function$;

-- Fix admin_delete_user function - remove incorrect ::text cast for entity_id
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid, _reason text DEFAULT 'Admin deletion'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_uid uuid;
  v_user_email text;
BEGIN
  -- Get the calling user's ID
  v_caller_uid := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_uid, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get user email for logging
  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log the deletion before removing - entity_id is UUID, not text
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller_uid, 'user.deleted', 'user', _user_id, 
    jsonb_build_object('deleted_email', v_user_email, 'reason', _reason));
  
  -- Delete from auth.users (cascades to profiles via foreign key)
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN json_build_object('success', true, 'deleted_email', v_user_email);
END;
$function$;