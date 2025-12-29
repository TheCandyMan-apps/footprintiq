-- Admin function to create a workspace for any user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_create_workspace_for_user(
  _user_id UUID,
  _workspace_name TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_id UUID;
  v_workspace_id UUID;
  v_workspace_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Get the calling user's ID
  v_caller_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get user email for default workspace name
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = _user_id;
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Set workspace name
  v_workspace_name := COALESCE(_workspace_name, split_part(v_user_email, '@', 1) || '''s Workspace');
  
  -- Check if user already has a workspace they own
  SELECT id INTO v_workspace_id
  FROM public.workspaces
  WHERE owner_id = _user_id
  LIMIT 1;
  
  IF v_workspace_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', true, 
      'workspace_id', v_workspace_id, 
      'already_exists', true,
      'message', 'User already has a workspace'
    );
  END IF;
  
  -- Create the workspace (SECURITY DEFINER bypasses RLS)
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (v_workspace_name, _user_id)
  RETURNING id INTO v_workspace_id;
  
  -- Add user as admin member of their own workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, _user_id, 'admin')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  
  -- Grant initial starter credits (10 credits for new workspaces)
  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (v_workspace_id, 10, 'signup_bonus', 
    jsonb_build_object('type', 'admin_created', 'created_by', v_caller_id));
  
  -- Log to audit_activity
  INSERT INTO public.audit_activity (workspace_id, user_id, action, meta)
  VALUES (v_workspace_id, v_caller_id, 'admin_workspace_created', 
    jsonb_build_object('for_user', _user_id, 'workspace_name', v_workspace_name));
  
  RETURN json_build_object(
    'success', true, 
    'workspace_id', v_workspace_id, 
    'already_exists', false,
    'message', 'Workspace created successfully'
  );
END;
$$;