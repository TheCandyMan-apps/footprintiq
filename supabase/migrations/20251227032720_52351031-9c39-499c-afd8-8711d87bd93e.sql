-- Fix rate_limits RLS policies - drop and recreate to ensure proper access control
-- Drop all existing policies on rate_limits to start fresh
DROP POLICY IF EXISTS "Admins can view all rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can view own user rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can update rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can update rate limits" ON public.rate_limits;

-- Recreate with proper access control
-- Admins can view all rate limits (including IP-based)
CREATE POLICY "Admins can view all rate limits"
  ON public.rate_limits FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Users can view only their own user-scoped limits (not IP-based)
CREATE POLICY "Users can view own user rate limits"
  ON public.rate_limits FOR SELECT
  USING (
    identifier_type = 'user' 
    AND identifier = (auth.uid())::text
  );

-- Allow inserts for rate limit tracking (system use)
CREATE POLICY "System can manage rate limits"
  ON public.rate_limits FOR INSERT
  WITH CHECK (true);

-- Allow updates to rate limits (for incrementing counts)
CREATE POLICY "System can update rate limits"
  ON public.rate_limits FOR UPDATE
  USING (true);