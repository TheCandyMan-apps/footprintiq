-- Add authorization checks to SECURITY DEFINER functions

-- Drop old functions first to allow signature changes
DROP FUNCTION IF EXISTS public.grant_admin_role(uuid);
DROP FUNCTION IF EXISTS public.update_user_subscription(uuid, subscription_tier, timestamp with time zone);
DROP FUNCTION IF EXISTS public.generate_ticket_number();

-- Create grant_admin_role with authorization token requirement
CREATE FUNCTION public.grant_admin_role(
  _user_id uuid,
  _caller_token text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected_token text;
BEGIN
  -- Get the expected token from settings (must be set via ALTER DATABASE)
  expected_token := current_setting('app.admin_grant_token', true);
  
  -- If no token configured, reject all calls
  IF expected_token IS NULL OR expected_token = '' THEN
    RAISE EXCEPTION 'Admin grant function is not configured';
  END IF;
  
  -- Verify the caller provided the correct token
  IF _caller_token IS NULL OR _caller_token != expected_token THEN
    RAISE EXCEPTION 'Unauthorized admin grant attempt';
  END IF;
  
  -- Update the user's role to admin
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;

-- Create update_user_subscription with caller authorization
CREATE FUNCTION public.update_user_subscription(
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
  v_caller_uid uuid;
BEGIN
  -- Get the calling user's ID
  v_caller_uid := auth.uid();
  
  -- Only allow if caller is the user themselves OR if called with service role
  -- (service role will have NULL auth.uid())
  IF v_caller_uid IS NOT NULL AND v_caller_uid != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update another user subscription';
  END IF;

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

-- Create generate_ticket_number with authentication requirement
CREATE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ticket_number TEXT;
  counter INTEGER := 0;
  v_caller_uid uuid;
BEGIN
  -- Verify user is authenticated
  v_caller_uid := auth.uid();
  IF v_caller_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to generate ticket number';
  END IF;

  LOOP
    new_ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.support_tickets WHERE ticket_number = new_ticket_number
    );
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique ticket number';
    END IF;
  END LOOP;
  
  RETURN new_ticket_number;
END;
$$;

-- Update function comments
COMMENT ON FUNCTION public.update_user_subscription IS 'Safely updates user subscription tier. Requires caller to be the user or service role.';
COMMENT ON FUNCTION public.grant_admin_role IS 'Grants admin role to a user. Requires authorization token. Call with: SELECT grant_admin_role(user_id, token);';
COMMENT ON FUNCTION public.generate_ticket_number IS 'Generates unique ticket number. Requires authentication to prevent abuse.';