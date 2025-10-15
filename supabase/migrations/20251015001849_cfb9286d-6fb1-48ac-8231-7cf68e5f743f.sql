-- Create SECURITY DEFINER functions for role management

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to safely update user subscription tier (for payment processing)
CREATE OR REPLACE FUNCTION public.update_user_subscription(
  _user_id uuid,
  _new_tier subscription_tier,
  _expires_at timestamp with time zone DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  -- Only allow updating to valid subscription tiers
  IF _new_tier NOT IN ('free', 'basic', 'premium', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid subscription tier';
  END IF;

  -- Update the user's subscription
  UPDATE public.user_roles
  SET 
    subscription_tier = _new_tier,
    subscription_expires_at = _expires_at
  WHERE user_id = _user_id;

  -- Return the updated data
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
$$;

-- Function to grant admin role (should only be called by authorized edge functions)
CREATE OR REPLACE FUNCTION public.grant_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's role to admin
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;

-- Add RLS policy for user_roles to use the has_role function
CREATE POLICY "Users can update own subscription through function"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comment explaining these functions should be called from edge functions
COMMENT ON FUNCTION public.update_user_subscription IS 'Safely updates user subscription tier. Should be called from payment processing edge functions.';
COMMENT ON FUNCTION public.grant_admin_role IS 'Grants admin role to a user. Should only be called from authorized edge functions with proper validation.';
COMMENT ON FUNCTION public.has_role IS 'Checks if a user has a specific role. Used in RLS policies to avoid recursion.';