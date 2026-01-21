-- Spamhaus Cache Table
-- Stores normalized SpamhausSignal only (no raw Spamhaus data)
CREATE TABLE public.spamhaus_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('ip', 'domain')),
  input_value TEXT NOT NULL,
  signal JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for cache lookups
CREATE INDEX idx_spamhaus_cache_key ON public.spamhaus_cache(cache_key);
CREATE INDEX idx_spamhaus_cache_expires ON public.spamhaus_cache(expires_at);

-- Enable RLS
ALTER TABLE public.spamhaus_cache ENABLE ROW LEVEL SECURITY;

-- NO policies for anon/authenticated - only service_role can access
-- This effectively blocks all client access

-- Spamhaus Audit Table
-- Logs all Spamhaus API calls for compliance and debugging
CREATE TABLE public.spamhaus_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  scan_id UUID NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('ip', 'domain')),
  input_value TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('lookupIp', 'lookupDomain', 'passiveDns', 'contentReputation')),
  cache_hit BOOLEAN NOT NULL DEFAULT false,
  success BOOLEAN NOT NULL DEFAULT false,
  status_code INT NULL,
  error_code TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX idx_spamhaus_audit_user ON public.spamhaus_audit(user_id);
CREATE INDEX idx_spamhaus_audit_scan ON public.spamhaus_audit(scan_id);
CREATE INDEX idx_spamhaus_audit_created ON public.spamhaus_audit(created_at DESC);
CREATE INDEX idx_spamhaus_audit_action ON public.spamhaus_audit(action);

-- Enable RLS
ALTER TABLE public.spamhaus_audit ENABLE ROW LEVEL SECURITY;

-- NO policies for anon/authenticated - only service_role can access
-- This effectively blocks all client access

-- Add comments for documentation
COMMENT ON TABLE public.spamhaus_cache IS 'Server-side cache for normalized Spamhaus signals. Only accessible via service_role.';
COMMENT ON TABLE public.spamhaus_audit IS 'Audit log for Spamhaus API calls. Only accessible via service_role.';
COMMENT ON COLUMN public.spamhaus_cache.signal IS 'Normalized SpamhausSignal - no raw Spamhaus list names stored';
COMMENT ON COLUMN public.spamhaus_audit.action IS 'Spamhaus client method called: lookupIp, lookupDomain, passiveDns, contentReputation';

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_spamhaus_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.spamhaus_cache
  WHERE expires_at < NOW();
END;
$$;