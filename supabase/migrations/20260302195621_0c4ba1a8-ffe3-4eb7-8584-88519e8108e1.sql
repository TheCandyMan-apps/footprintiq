-- Create ops_alerts table
CREATE TABLE public.ops_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL DEFAULT 'warning',
  type TEXT NOT NULL,
  dedupe_key TEXT,
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ
);

-- Index for dedupe lookups
CREATE INDEX idx_ops_alerts_dedupe ON public.ops_alerts (dedupe_key, resolved_at) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_ops_alerts_created ON public.ops_alerts (created_at DESC);

-- RLS: service_role writes, admins read
ALTER TABLE public.ops_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ops_alerts"
  ON public.ops_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access on ops_alerts"
  ON public.ops_alerts FOR ALL TO service_role
  USING (true) WITH CHECK (true);