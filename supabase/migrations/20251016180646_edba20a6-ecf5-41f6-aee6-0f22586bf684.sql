-- ============================================
-- Security Fix: Admin Grant Function + DELETE Policies + Audit Logging
-- ============================================

-- 1. Create audit table for admin grant attempts
CREATE TABLE IF NOT EXISTS public.admin_grant_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_grant_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view grant attempts"
ON public.admin_grant_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Update grant_admin_role function with rate limiting and audit logging
CREATE OR REPLACE FUNCTION public.grant_admin_role(
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
  attempt_count int;
BEGIN
  -- Get the expected token from settings
  expected_token := current_setting('app.admin_grant_token', true);
  
  -- If no token configured, reject all calls
  IF expected_token IS NULL OR expected_token = '' THEN
    RAISE EXCEPTION 'Admin grant function is not configured';
  END IF;
  
  -- Check for rate limiting (max 10 attempts per hour)
  SELECT COUNT(*) INTO attempt_count
  FROM public.admin_grant_attempts
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count > 10 THEN
    RAISE EXCEPTION 'Too many admin grant attempts';
  END IF;
  
  -- Log the attempt (initially as failed)
  INSERT INTO public.admin_grant_attempts (user_id, success, created_at)
  VALUES (_user_id, false, NOW());
  
  -- Verify the caller provided the correct token
  IF _caller_token IS NULL OR _caller_token != expected_token THEN
    RAISE EXCEPTION 'Unauthorized admin grant attempt';
  END IF;
  
  -- Update the user's role to admin
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = _user_id;
  
  -- Update attempt log as successful
  UPDATE public.admin_grant_attempts
  SET success = true
  WHERE user_id = _user_id AND created_at = (
    SELECT MAX(created_at) FROM public.admin_grant_attempts WHERE user_id = _user_id
  );

  RETURN FOUND;
END;
$$;

-- 3. Add CASCADE constraints for proper data cleanup
ALTER TABLE public.data_sources
DROP CONSTRAINT IF EXISTS data_sources_scan_id_fkey,
ADD CONSTRAINT data_sources_scan_id_fkey
FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

ALTER TABLE public.social_profiles
DROP CONSTRAINT IF EXISTS social_profiles_scan_id_fkey,
ADD CONSTRAINT social_profiles_scan_id_fkey
FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

ALTER TABLE public.scan_comparisons
DROP CONSTRAINT IF EXISTS scan_comparisons_first_scan_id_fkey,
ADD CONSTRAINT scan_comparisons_first_scan_id_fkey
FOREIGN KEY (first_scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

ALTER TABLE public.scan_comparisons
DROP CONSTRAINT IF EXISTS scan_comparisons_latest_scan_id_fkey,
ADD CONSTRAINT scan_comparisons_latest_scan_id_fkey
FOREIGN KEY (latest_scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

ALTER TABLE public.removal_requests
DROP CONSTRAINT IF EXISTS removal_requests_scan_id_fkey,
ADD CONSTRAINT removal_requests_scan_id_fkey
FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

-- 4. Add DELETE RLS policies for all tables

-- Scans: Users can delete their own scans
CREATE POLICY "Users can delete own scans"
ON public.scans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Profiles: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Data sources: Cascade with scan deletion
CREATE POLICY "Users can delete data sources from own scans"
ON public.data_sources
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = data_sources.scan_id
    AND scans.user_id = auth.uid()
  )
);

-- Social profiles: Cascade with scan deletion
CREATE POLICY "Users can delete social profiles from own scans"
ON public.social_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = social_profiles.scan_id
    AND scans.user_id = auth.uid()
  )
);

-- Removal requests: Users can delete their own
CREATE POLICY "Users can delete own removal requests"
ON public.removal_requests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Scan comparisons: Users can delete their own
CREATE POLICY "Users can delete own scan comparisons"
ON public.scan_comparisons
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Support tickets: Users can delete own, admins can delete all
CREATE POLICY "Users can delete own tickets"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all tickets"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));