-- Create admin function to reset workspace scan limits for testing
CREATE OR REPLACE FUNCTION public.admin_reset_scan_limits(_workspace_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_old_count INTEGER;
BEGIN
  -- Get the calling user's ID
  v_caller_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get current count
  SELECT scans_used_monthly INTO v_old_count
  FROM public.workspaces
  WHERE id = _workspace_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workspace not found';
  END IF;
  
  -- Reset scan count
  UPDATE public.workspaces
  SET scans_used_monthly = 0, updated_at = NOW()
  WHERE id = _workspace_id;
  
  -- Log the action
  INSERT INTO public.audit_activity (workspace_id, user_id, action, meta)
  VALUES (_workspace_id, v_caller_id, 'admin_reset_scan_limits', 
    jsonb_build_object('old_count', v_old_count, 'new_count', 0));
  
  RETURN json_build_object('success', true, 'old_count', v_old_count, 'new_count', 0);
END;
$$;

-- Also grant extra credits for testing
CREATE OR REPLACE FUNCTION public.admin_grant_test_credits(_workspace_id uuid, _amount integer DEFAULT 100)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_new_balance INTEGER;
BEGIN
  v_caller_id := auth.uid();
  
  IF NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Add credits
  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (_workspace_id, _amount, 'purchase', 
    jsonb_build_object('type', 'test_grant', 'granted_by', v_caller_id));
  
  -- Get new balance
  SELECT COALESCE(SUM(delta), 0)::INT INTO v_new_balance
  FROM public.credits_ledger
  WHERE workspace_id = _workspace_id;
  
  RETURN json_build_object('success', true, 'credits_added', _amount, 'new_balance', v_new_balance);
END;
$$;