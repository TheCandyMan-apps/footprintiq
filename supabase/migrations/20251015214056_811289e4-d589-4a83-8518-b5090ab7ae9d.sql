-- CRITICAL SECURITY FIX: Prevent privilege escalation and payment bypass
-- Remove public RPC access to grant_admin_role and update_user_subscription functions

-- Revoke execute permission from authenticated users on grant_admin_role
REVOKE EXECUTE ON FUNCTION public.grant_admin_role FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_role FROM anon;

-- Grant execute only to service role
GRANT EXECUTE ON FUNCTION public.grant_admin_role TO service_role;

-- Revoke execute permission from authenticated users on update_user_subscription
REVOKE EXECUTE ON FUNCTION public.update_user_subscription FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_subscription FROM anon;

-- Grant execute only to service role
GRANT EXECUTE ON FUNCTION public.update_user_subscription TO service_role;

-- Add comments to document the security restrictions
COMMENT ON FUNCTION public.grant_admin_role IS 'SECURITY: Only callable by service_role. Use edge functions with service role key to grant admin privileges.';
COMMENT ON FUNCTION public.update_user_subscription IS 'SECURITY: Only callable by service_role. Use Stripe webhooks or edge functions with service role key to update subscriptions.';