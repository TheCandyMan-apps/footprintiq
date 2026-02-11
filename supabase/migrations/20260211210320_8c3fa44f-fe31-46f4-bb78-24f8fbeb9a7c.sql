
-- Fix handle_new_user: cast text to subscription_tier enum
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
  -- Check if user is admin
  IF NEW.email = v_admin_email THEN
    v_user_role := 'admin';
    v_subscription_tier := 'pro';
  END IF;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role, subscription_tier)
  VALUES (NEW.id, v_user_role, v_subscription_tier);

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Create default workspace
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    NEW.id
  )
  RETURNING id INTO v_workspace_id;

  -- Add user as workspace admin
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;

-- Fix set_workspace_tier_from_owner: cast text to proper enum types
CREATE OR REPLACE FUNCTION public.set_workspace_tier_from_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  owner_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO owner_tier
  FROM public.user_roles
  WHERE user_id = NEW.owner_id;

  IF owner_tier = 'pro'::subscription_tier THEN
    NEW.plan := 'pro';
    NEW.subscription_tier := 'pro';
    NEW.scan_limit_monthly := NULL;
  ELSIF owner_tier = 'enterprise'::subscription_tier THEN
    NEW.plan := 'business';
    NEW.subscription_tier := 'enterprise';
    NEW.scan_limit_monthly := NULL;
  ELSIF owner_tier = 'basic'::subscription_tier THEN
    NEW.plan := 'pro';
    NEW.subscription_tier := 'pro';
    NEW.scan_limit_monthly := 100;
  ELSE
    NEW.plan := 'free';
    NEW.subscription_tier := 'free';
    NEW.scan_limit_monthly := 10;
  END IF;

  RETURN NEW;
END;
$$;
