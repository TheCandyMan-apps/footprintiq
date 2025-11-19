-- ============================================
-- Phase 2: Production Hardening & Reliability
-- Database Performance, Rate Limiting, Data Integrity
-- ============================================

-- ============================================
-- 2.1: Database Performance - Add Missing Indexes
-- ============================================

-- Scans table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scans_workspace_status 
  ON public.scans(workspace_id, status) 
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_scans_created_at_desc 
  ON public.scans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scans_user_created 
  ON public.scans(user_id, created_at DESC);

-- Findings table indexes for scan result queries
CREATE INDEX IF NOT EXISTS idx_findings_scan_provider 
  ON public.findings(scan_id, provider);

CREATE INDEX IF NOT EXISTS idx_findings_severity 
  ON public.findings(scan_id, severity) 
  WHERE severity IN ('critical', 'high');

CREATE INDEX IF NOT EXISTS idx_findings_created 
  ON public.findings(created_at DESC);

-- Workspace members for RLS checks
CREATE INDEX IF NOT EXISTS idx_workspace_members_user 
  ON public.workspace_members(user_id, workspace_id);

-- Scan progress for realtime updates
CREATE INDEX IF NOT EXISTS idx_scan_progress_scan_status 
  ON public.scan_progress(scan_id, status, updated_at DESC);

-- System errors for admin dashboard
CREATE INDEX IF NOT EXISTS idx_system_errors_severity_time 
  ON public.system_errors(severity, created_at DESC) 
  WHERE severity IN ('error', 'critical');

-- ============================================
-- 2.2: Rate Limiting Tables
-- ============================================

-- Workspace-level scan rate limits
CREATE TABLE IF NOT EXISTS public.workspace_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  rate_limit_type TEXT NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_size_seconds INTEGER NOT NULL DEFAULT 3600,
  max_allowed INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, rate_limit_type)
);

CREATE INDEX IF NOT EXISTS idx_workspace_rate_limits_lookup 
  ON public.workspace_rate_limits(workspace_id, rate_limit_type, window_start);

-- IP-based rate limits for auth endpoints
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_size_minutes INTEGER NOT NULL DEFAULT 60,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_lookup 
  ON public.ip_rate_limits(ip_address, endpoint, window_start);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_blocked 
  ON public.ip_rate_limits(blocked_until) 
  WHERE blocked_until IS NOT NULL;

-- Enable RLS
ALTER TABLE public.workspace_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin only for rate limits)
CREATE POLICY "Admins can view all rate limits" 
  ON public.workspace_rate_limits 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage rate limits" 
  ON public.workspace_rate_limits 
  FOR ALL 
  USING (auth.uid() IS NULL);

CREATE POLICY "Service role can manage IP rate limits" 
  ON public.ip_rate_limits 
  FOR ALL 
  USING (auth.uid() IS NULL);

-- ============================================
-- 2.3: Data Validation Triggers
-- ============================================

-- Validate scan input data
CREATE OR REPLACE FUNCTION public.validate_scan_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate phone format if provided (basic check)
  IF NEW.phone IS NOT NULL AND LENGTH(TRIM(NEW.phone)) < 7 THEN
    RAISE EXCEPTION 'Invalid phone number: too short';
  END IF;
  
  -- Validate username if provided
  IF NEW.username IS NOT NULL AND LENGTH(TRIM(NEW.username)) < 2 THEN
    RAISE EXCEPTION 'Invalid username: too short';
  END IF;
  
  -- Ensure at least one target is provided
  IF NEW.email IS NULL AND NEW.phone IS NULL AND NEW.username IS NULL THEN
    RAISE EXCEPTION 'At least one target (email, phone, or username) must be provided';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_scan_input_trigger
  BEFORE INSERT ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_scan_input();

-- ============================================
-- 2.4: Enhanced Audit Logging
-- ============================================

-- Trigger to log workspace changes
CREATE OR REPLACE FUNCTION public.log_workspace_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (workspace_id, user_id, action, target, meta)
    VALUES (
      NEW.id,
      NEW.owner_id,
      'workspace_created',
      NEW.id::TEXT,
      jsonb_build_object('name', NEW.name, 'tier', NEW.subscription_tier)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
      INSERT INTO public.audit_log (workspace_id, user_id, action, target, meta)
      VALUES (
        NEW.id,
        auth.uid(),
        'tier_changed',
        NEW.id::TEXT,
        jsonb_build_object('old_tier', OLD.subscription_tier, 'new_tier', NEW.subscription_tier)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (workspace_id, user_id, action, target, meta)
    VALUES (
      OLD.id,
      auth.uid(),
      'workspace_deleted',
      OLD.id::TEXT,
      jsonb_build_object('name', OLD.name)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER log_workspace_mutations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.log_workspace_mutation();

-- ============================================
-- 2.5: Rate Limit Helper Functions
-- ============================================

CREATE OR REPLACE FUNCTION public.check_workspace_scan_limit(
  _workspace_id UUID,
  _rate_type TEXT DEFAULT 'scan_hourly'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_max_allowed INTEGER;
  v_window_start TIMESTAMPTZ;
  v_window_size INTEGER;
BEGIN
  INSERT INTO public.workspace_rate_limits (workspace_id, rate_limit_type)
  VALUES (_workspace_id, _rate_type)
  ON CONFLICT (workspace_id, rate_limit_type) DO NOTHING;
  
  SELECT current_count, max_allowed, window_start, window_size_seconds
  INTO v_current_count, v_max_allowed, v_window_start, v_window_size
  FROM public.workspace_rate_limits
  WHERE workspace_id = _workspace_id AND rate_limit_type = _rate_type;
  
  IF v_window_start + (v_window_size || ' seconds')::INTERVAL < NOW() THEN
    UPDATE public.workspace_rate_limits
    SET current_count = 1, window_start = NOW(), updated_at = NOW()
    WHERE workspace_id = _workspace_id AND rate_limit_type = _rate_type;
    RETURN TRUE;
  END IF;
  
  IF v_current_count >= v_max_allowed THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.workspace_rate_limits
  SET current_count = current_count + 1, updated_at = NOW()
  WHERE workspace_id = _workspace_id AND rate_limit_type = _rate_type;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  _ip_address INET,
  _endpoint TEXT,
  _max_attempts INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked_until TIMESTAMPTZ;
  v_attempt_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT blocked_until INTO v_blocked_until
  FROM public.ip_rate_limits
  WHERE ip_address = _ip_address AND endpoint = _endpoint;
  
  IF v_blocked_until IS NOT NULL AND v_blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.ip_rate_limits (ip_address, endpoint, max_attempts)
  VALUES (_ip_address, _endpoint, _max_attempts)
  ON CONFLICT (ip_address, endpoint) DO NOTHING;
  
  SELECT attempt_count, window_start
  INTO v_attempt_count, v_window_start
  FROM public.ip_rate_limits
  WHERE ip_address = _ip_address AND endpoint = _endpoint;
  
  IF v_window_start + INTERVAL '1 hour' < NOW() THEN
    UPDATE public.ip_rate_limits
    SET attempt_count = 1, window_start = NOW(), blocked_until = NULL, updated_at = NOW()
    WHERE ip_address = _ip_address AND endpoint = _endpoint;
    RETURN TRUE;
  END IF;
  
  IF v_attempt_count >= _max_attempts THEN
    UPDATE public.ip_rate_limits
    SET blocked_until = NOW() + INTERVAL '1 hour', updated_at = NOW()
    WHERE ip_address = _ip_address AND endpoint = _endpoint;
    RETURN FALSE;
  END IF;
  
  UPDATE public.ip_rate_limits
  SET attempt_count = attempt_count + 1, updated_at = NOW()
  WHERE ip_address = _ip_address AND endpoint = _endpoint;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.workspace_rate_limits
  SET current_count = 0, window_start = NOW(), updated_at = NOW()
  WHERE window_start + (window_size_seconds || ' seconds')::INTERVAL < NOW();
  
  UPDATE public.ip_rate_limits
  SET attempt_count = 0, window_start = NOW(), blocked_until = NULL, updated_at = NOW()
  WHERE window_start + (window_size_minutes || ' minutes')::INTERVAL < NOW()
    OR (blocked_until IS NOT NULL AND blocked_until < NOW());
END;
$$;