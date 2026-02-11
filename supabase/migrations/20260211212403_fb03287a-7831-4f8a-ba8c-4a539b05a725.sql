-- Fix: handle_new_user's workspace_members insert conflicts with 
-- the on_workspace_created trigger (add_owner_as_workspace_member).
-- Remove the redundant insert since the trigger already handles it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_workspace_id UUID;
  v_user_role TEXT := 'user';
  v_subscription_tier subscription_tier := 'free';
  v_admin_email TEXT := 'admin@footprintiq.io';
BEGIN
  IF NEW.email = v_admin_email THEN
    v_user_role := 'admin';
    v_subscription_tier := 'pro';
  END IF;

  INSERT INTO public.user_roles (user_id, role, subscription_tier)
  VALUES (NEW.id, v_user_role, v_subscription_tier)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;

  SELECT wm.workspace_id INTO v_workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id = NEW.id
  LIMIT 1;

  IF v_workspace_id IS NULL THEN
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
      NEW.id
    )
    RETURNING id INTO v_workspace_id;
    -- NOTE: workspace_members insert removed - handled by on_workspace_created trigger
  END IF;

  RETURN NEW;
END;
$$;