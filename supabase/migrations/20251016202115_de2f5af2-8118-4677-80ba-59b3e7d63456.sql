-- Fix 1: Add RLS policies for scan-images storage bucket
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own images
CREATE POLICY "Users can view own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can access all images
CREATE POLICY "Admins can manage all images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  public.has_role(auth.uid(), 'admin')
);

-- Fix 2: Create email rate limit table for persistent rate limiting
CREATE TABLE IF NOT EXISTS public.email_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on email rate limit table
ALTER TABLE public.email_rate_limit ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limit records
CREATE POLICY "System can manage rate limits"
ON public.email_rate_limit
FOR ALL
TO authenticated
USING (false);

-- Create index for fast lookups
CREATE INDEX idx_email_rate_limit_ip_created ON public.email_rate_limit(ip, created_at);

-- Fix 3: Create admin grant tokens table for one-time-use tokens
CREATE TABLE IF NOT EXISTS public.admin_grant_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_grant_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can create tokens
CREATE POLICY "Admins can create grant tokens"
ON public.admin_grant_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Admins can view all tokens
CREATE POLICY "Admins can view grant tokens"
ON public.admin_grant_tokens
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Update grant_admin_role function to use one-time tokens
CREATE OR REPLACE FUNCTION public.grant_admin_role(
  _user_id uuid,
  _caller_token text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token_record RECORD;
  v_token_hash text;
  attempt_count int;
BEGIN
  -- Check for rate limiting (max 10 attempts per hour)
  SELECT COUNT(*) INTO attempt_count
  FROM public.admin_grant_attempts
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count > 10 THEN
    RAISE EXCEPTION 'Too many admin grant attempts';
  END IF;

  -- If no token provided, fail
  IF _caller_token IS NULL OR _caller_token = '' THEN
    INSERT INTO public.admin_grant_attempts (user_id, success, created_at)
    VALUES (_user_id, false, NOW());
    RAISE EXCEPTION 'Admin grant token required';
  END IF;

  -- Hash the provided token
  v_token_hash := encode(
    digest(_caller_token, 'sha256'),
    'hex'
  );
  
  -- Find and validate token
  SELECT * INTO v_token_record
  FROM public.admin_grant_tokens
  WHERE token_hash = v_token_hash
    AND expires_at > NOW()
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.admin_grant_attempts (user_id, success, created_at)
    VALUES (_user_id, false, NOW());
    
    RAISE EXCEPTION 'Invalid or expired admin grant token';
  END IF;
  
  -- Mark token as used
  UPDATE public.admin_grant_tokens
  SET used_at = NOW(),
      used_by = _user_id
  WHERE id = v_token_record.id;
  
  -- Grant admin role
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = _user_id;
  
  -- Log successful attempt
  INSERT INTO public.admin_grant_attempts (user_id, success, created_at)
  VALUES (_user_id, true, NOW());

  RETURN FOUND;
END;
$$;

-- Fix 4: Add PII auto-cleanup function for GDPR compliance
CREATE OR REPLACE FUNCTION public.cleanup_scan_pii()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- After 30 days, redact PII from old scans
  UPDATE public.scans
  SET 
    email = NULL,
    phone = NULL,
    first_name = NULL,
    last_name = NULL
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND (email IS NOT NULL OR phone IS NOT NULL OR first_name IS NOT NULL OR last_name IS NOT NULL);
END;
$$;

-- Create a function to be called by cron or manually
COMMENT ON FUNCTION public.cleanup_scan_pii() IS 'Redacts PII from scans older than 30 days for GDPR compliance';