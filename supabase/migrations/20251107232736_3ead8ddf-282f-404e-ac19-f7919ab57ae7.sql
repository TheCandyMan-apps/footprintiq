-- Add results jsonb array column to cases table for multi-type results
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS results jsonb[] DEFAULT '{}';

-- Add workspace limits check function
CREATE OR REPLACE FUNCTION check_workspace_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  workspace_count int;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.user_roles
  WHERE user_id = NEW.owner_id;

  -- Count existing workspaces
  SELECT COUNT(*) INTO workspace_count
  FROM public.workspaces
  WHERE owner_id = NEW.owner_id;

  -- Free tier: limit to 1 workspace
  IF user_tier = 'free' AND workspace_count >= 1 THEN
    RAISE EXCEPTION 'Free tier limited to 1 workspace. Upgrade to Pro for unlimited workspaces.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add case limits check function
CREATE OR REPLACE FUNCTION check_case_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  case_count int;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.user_roles
  WHERE user_id = NEW.user_id;

  -- Count existing cases
  SELECT COUNT(*) INTO case_count
  FROM public.cases
  WHERE user_id = NEW.user_id;

  -- Free tier: limit to 3 cases
  IF user_tier = 'free' AND case_count >= 3 THEN
    RAISE EXCEPTION 'Free tier limited to 3 cases. Upgrade to Pro for unlimited cases.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add triggers to enforce limits
DROP TRIGGER IF EXISTS enforce_workspace_limit ON public.workspaces;
CREATE TRIGGER enforce_workspace_limit
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION check_workspace_limit();

DROP TRIGGER IF EXISTS enforce_case_limit ON public.cases;
CREATE TRIGGER enforce_case_limit
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION check_case_limit();

-- Add index on results for better performance
CREATE INDEX IF NOT EXISTS idx_cases_results ON public.cases USING GIN (results);