
-- Add anonymous scan support columns to scans table
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS session_fingerprint text;

-- Anonymous scans: user_id and workspace_id are already nullable in scans table
-- Verify they are nullable (they should be based on existing schema)
-- ALTER TABLE public.scans ALTER COLUMN user_id DROP NOT NULL; -- only if needed

-- Create anonymous IP rate limit table
CREATE TABLE IF NOT EXISTS public.anonymous_scan_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  scan_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  last_scan_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS anon_rate_limit_ip_idx 
  ON public.anonymous_scan_rate_limits (ip_address);

-- RLS: only service role can access (edge functions use service key)
ALTER TABLE public.anonymous_scan_rate_limits ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE policies for anon/authenticated — service role bypasses RLS
-- Admins can view for monitoring
CREATE POLICY "admins_can_view_anon_rate_limits"
  ON public.anonymous_scan_rate_limits
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
