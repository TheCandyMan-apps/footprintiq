-- Create function to validate subscription tier server-side
CREATE OR REPLACE FUNCTION public.has_subscription_tier(
  _user_id uuid,
  _required_tier text
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        CASE _required_tier
          WHEN 'free' THEN subscription_tier IN ('free', 'premium', 'family')
          WHEN 'premium' THEN subscription_tier IN ('premium', 'family')
          WHEN 'family' THEN subscription_tier = 'family'
          ELSE false
        END
      )
      AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  )
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.has_subscription_tier TO authenticated;