-- Create email domain blocklist table
CREATE TABLE IF NOT EXISTS public.email_domain_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'disposable' CHECK (category IN ('disposable', 'temporary', 'suspicious', 'spam', 'custom')),
  added_by uuid,
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_domain_blocklist ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view blocklist"
ON public.email_domain_blocklist FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blocklist"
ON public.email_domain_blocklist FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert common disposable email domains
INSERT INTO public.email_domain_blocklist (domain, category, reason) VALUES
  ('passmail.net', 'disposable', 'Known disposable email provider'),
  ('tempmail.com', 'disposable', 'Known temporary email provider'),
  ('guerrillamail.com', 'disposable', 'Known disposable email provider'),
  ('guerrillamail.org', 'disposable', 'Known disposable email provider'),
  ('guerrillamail.net', 'disposable', 'Known disposable email provider'),
  ('mailinator.com', 'disposable', 'Known disposable email provider'),
  ('10minutemail.com', 'disposable', 'Known temporary email provider'),
  ('throwaway.email', 'disposable', 'Known disposable email provider'),
  ('temp-mail.org', 'disposable', 'Known temporary email provider'),
  ('fakeinbox.com', 'disposable', 'Known disposable email provider'),
  ('yopmail.com', 'disposable', 'Known disposable email provider'),
  ('dispostable.com', 'disposable', 'Known disposable email provider'),
  ('trashmail.com', 'disposable', 'Known disposable email provider'),
  ('maildrop.cc', 'disposable', 'Known disposable email provider'),
  ('getairmail.com', 'disposable', 'Known temporary email provider'),
  ('mohmal.com', 'disposable', 'Known temporary email provider'),
  ('tempail.com', 'disposable', 'Known temporary email provider'),
  ('emailondeck.com', 'disposable', 'Known disposable email provider'),
  ('spamgourmet.com', 'disposable', 'Known disposable email provider'),
  ('sharklasers.com', 'disposable', 'Known disposable email provider'),
  ('grr.la', 'disposable', 'Known disposable email provider'),
  ('spam4.me', 'disposable', 'Known disposable email provider'),
  ('nada.email', 'disposable', 'Known disposable email provider'),
  ('getnada.com', 'disposable', 'Known disposable email provider'),
  ('minutemail.com', 'disposable', 'Known temporary email provider'),
  ('moakt.com', 'disposable', 'Known disposable email provider'),
  ('emailfake.com', 'disposable', 'Known disposable email provider')
ON CONFLICT (domain) DO NOTHING;

-- Create brand protection patterns table
CREATE TABLE IF NOT EXISTS public.brand_protection_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL UNIQUE,
  description text,
  is_regex boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_protection_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view brand patterns"
ON public.brand_protection_patterns FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage brand patterns"
ON public.brand_protection_patterns FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert brand protection patterns for FootprintIQ
INSERT INTO public.brand_protection_patterns (pattern, description, is_regex) VALUES
  ('footprintiq', 'Brand name in username', false),
  ('footprint.iq', 'Brand name variant', false),
  ('footprint-iq', 'Brand name variant', false),
  ('footprint_iq', 'Brand name variant', false),
  ('fpiq', 'Brand abbreviation', false),
  ('fp-iq', 'Brand abbreviation variant', false)
ON CONFLICT (pattern) DO NOTHING;

-- Create rate limit alert thresholds table
CREATE TABLE IF NOT EXISTS public.rate_limit_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL UNIQUE CHECK (metric_type IN ('scans_per_hour', 'scans_per_day', 'failed_scans', 'api_calls')),
  threshold_value integer NOT NULL,
  window_minutes integer NOT NULL,
  flag_type text NOT NULL DEFAULT 'suspicious',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limit_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view thresholds"
ON public.rate_limit_thresholds FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage thresholds"
ON public.rate_limit_thresholds FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default thresholds
INSERT INTO public.rate_limit_thresholds (metric_type, threshold_value, window_minutes, flag_type) VALUES
  ('scans_per_hour', 20, 60, 'high_risk'),
  ('scans_per_day', 100, 1440, 'suspicious'),
  ('failed_scans', 10, 60, 'abuse'),
  ('api_calls', 500, 60, 'high_risk')
ON CONFLICT (metric_type) DO NOTHING;

-- Create function to check if email domain is blocklisted
CREATE OR REPLACE FUNCTION public.is_email_blocklisted(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.email_domain_blocklist
    WHERE is_active = true
    AND LOWER(_email) LIKE '%@' || LOWER(domain)
  );
$$;

-- Create function to check if username matches brand pattern
CREATE OR REPLACE FUNCTION public.matches_brand_pattern(_username text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pattern RECORD;
  v_lower_username text;
BEGIN
  v_lower_username := LOWER(COALESCE(_username, ''));
  
  FOR v_pattern IN 
    SELECT pattern, is_regex FROM public.brand_protection_patterns WHERE is_active = true
  LOOP
    IF v_pattern.is_regex THEN
      IF v_lower_username ~ v_pattern.pattern THEN
        RETURN true;
      END IF;
    ELSE
      IF v_lower_username LIKE '%' || LOWER(v_pattern.pattern) || '%' THEN
        RETURN true;
      END IF;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;

-- Create function to auto-flag suspicious new users
CREATE OR REPLACE FUNCTION public.auto_flag_suspicious_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_domain text;
  v_flag_reason text;
  v_flag_type text;
BEGIN
  -- Extract domain from email
  v_email_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));
  
  -- Check for disposable email
  IF public.is_email_blocklisted(NEW.email) THEN
    v_flag_type := 'suspicious';
    v_flag_reason := 'Registered with disposable/blocklisted email domain: ' || v_email_domain;
    
    INSERT INTO public.flagged_users (user_id, flag_type, flagged_by, reason, notes)
    VALUES (NEW.user_id, v_flag_type, NEW.user_id, v_flag_reason, 'Auto-flagged by system on signup');
  END IF;
  
  -- Check for brand-mimicking username (check full_name as "username")
  IF public.matches_brand_pattern(NEW.full_name) THEN
    v_flag_type := 'suspicious';
    v_flag_reason := 'Username/name mimics brand: ' || COALESCE(NEW.full_name, 'unknown');
    
    INSERT INTO public.flagged_users (user_id, flag_type, flagged_by, reason, notes)
    VALUES (NEW.user_id, v_flag_type, NEW.user_id, v_flag_reason, 'Auto-flagged by system - brand impersonation')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Also check email username part for brand mimicking
  IF public.matches_brand_pattern(SPLIT_PART(NEW.email, '@', 1)) THEN
    v_flag_type := 'suspicious';
    v_flag_reason := 'Email username mimics brand: ' || SPLIT_PART(NEW.email, '@', 1);
    
    INSERT INTO public.flagged_users (user_id, flag_type, flagged_by, reason, notes)
    VALUES (NEW.user_id, v_flag_type, NEW.user_id, v_flag_reason, 'Auto-flagged by system - brand impersonation in email')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-flag on profile creation
DROP TRIGGER IF EXISTS trigger_auto_flag_suspicious_user ON public.profiles;
CREATE TRIGGER trigger_auto_flag_suspicious_user
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_flag_suspicious_user();

-- Create function to check user activity rate and auto-flag
CREATE OR REPLACE FUNCTION public.check_and_flag_rate_abuse(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold RECORD;
  v_count integer;
  v_workspace_ids uuid[];
BEGIN
  -- Get user's workspace IDs
  SELECT ARRAY_AGG(id) INTO v_workspace_ids
  FROM public.workspaces
  WHERE owner_id = _user_id;
  
  IF v_workspace_ids IS NULL THEN
    RETURN;
  END IF;
  
  -- Check each threshold
  FOR v_threshold IN 
    SELECT * FROM public.rate_limit_thresholds WHERE is_active = true
  LOOP
    IF v_threshold.metric_type = 'scans_per_hour' OR v_threshold.metric_type = 'scans_per_day' THEN
      SELECT COUNT(*) INTO v_count
      FROM public.scans
      WHERE workspace_id = ANY(v_workspace_ids)
      AND created_at > NOW() - (v_threshold.window_minutes || ' minutes')::INTERVAL;
      
      IF v_count >= v_threshold.threshold_value THEN
        -- Check if already flagged for this
        IF NOT EXISTS (
          SELECT 1 FROM public.flagged_users 
          WHERE user_id = _user_id 
          AND flag_type = v_threshold.flag_type 
          AND is_active = true
          AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          INSERT INTO public.flagged_users (user_id, flag_type, flagged_by, reason, notes)
          VALUES (
            _user_id, 
            v_threshold.flag_type, 
            _user_id, 
            'Rate limit exceeded: ' || v_count || ' ' || v_threshold.metric_type || ' in ' || v_threshold.window_minutes || ' minutes',
            'Auto-flagged by rate limit monitor'
          )
          ON CONFLICT DO NOTHING;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to check rate limits after each scan
CREATE OR REPLACE FUNCTION public.trigger_check_scan_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  -- Get workspace owner
  SELECT owner_id INTO v_owner_id
  FROM public.workspaces
  WHERE id = NEW.workspace_id;
  
  IF v_owner_id IS NOT NULL THEN
    PERFORM public.check_and_flag_rate_abuse(v_owner_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_scan_rate ON public.scans;
CREATE TRIGGER trigger_check_scan_rate
AFTER INSERT ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_scan_rate();