-- Remove permissive UPDATE policy that allows direct client updates
DROP POLICY IF EXISTS "Users can update own subscription through function" ON public.user_roles;

-- Create restrictive policy that only allows service_role to update
-- This forces all updates to go through validated RPC functions like update_user_subscription()
CREATE POLICY "Service role updates user roles"
  ON public.user_roles FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);