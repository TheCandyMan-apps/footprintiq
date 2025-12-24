-- Create secure admin-only credit granting function
CREATE OR REPLACE FUNCTION public.admin_grant_credits(
  _workspace_id UUID,
  _amount INTEGER,
  _description TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_caller_id UUID;
BEGIN
  -- Get the calling user's ID
  v_caller_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Add credit transaction
  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (_workspace_id, _amount, 'purchase', 
    jsonb_build_object('type', 'admin_grant', 'description', _description, 'granted_by', v_caller_id));
  
  -- Get new balance
  SELECT COALESCE(SUM(delta), 0)::INT INTO v_new_balance
  FROM public.credits_ledger
  WHERE workspace_id = _workspace_id;
  
  -- Log to audit_activity
  INSERT INTO public.audit_activity (workspace_id, user_id, action, meta)
  VALUES (_workspace_id, v_caller_id, 'admin_credits_granted', 
    jsonb_build_object('amount', _amount, 'description', _description, 'new_balance', v_new_balance));
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;