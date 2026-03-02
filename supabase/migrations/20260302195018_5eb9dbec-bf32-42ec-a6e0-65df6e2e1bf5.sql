
-- =============================================
-- 1. Extend scan_events with workspace_id, user_id, message columns
-- =============================================
ALTER TABLE public.scan_events
  ADD COLUMN IF NOT EXISTS workspace_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Index for user-scoped reads
CREATE INDEX IF NOT EXISTS idx_scan_events_user_id ON public.scan_events (user_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_workspace_id ON public.scan_events (workspace_id);

-- =============================================
-- 2. Create scan_health table (one row per scan)
-- =============================================
CREATE TABLE IF NOT EXISTS public.scan_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL UNIQUE,
  workspace_id UUID,
  user_id UUID,
  state TEXT NOT NULL DEFAULT 'pending',
  last_stage TEXT,
  last_heartbeat_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_code TEXT,
  error_detail TEXT,
  latency_ms_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_health_scan_id ON public.scan_health (scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_health_user_id ON public.scan_health (user_id);
CREATE INDEX IF NOT EXISTS idx_scan_health_state ON public.scan_health (state);

-- =============================================
-- 3. RLS on scan_events (read own, service role writes)
-- =============================================
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;

-- Users read their own scan events
CREATE POLICY "Users read own scan_events"
  ON public.scan_events FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.scans s
      WHERE s.id = scan_events.scan_id
        AND s.user_id = auth.uid()
    )
  );

-- Service role can do everything (edge functions use service_role key)
CREATE POLICY "Service role full access scan_events"
  ON public.scan_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================
-- 4. RLS on scan_health
-- =============================================
ALTER TABLE public.scan_health ENABLE ROW LEVEL SECURITY;

-- Users read their own scan health
CREATE POLICY "Users read own scan_health"
  ON public.scan_health FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Service role full access
CREATE POLICY "Service role full access scan_health"
  ON public.scan_health FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Admin bypass for both tables
CREATE POLICY "Admin read all scan_events"
  ON public.scan_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin read all scan_health"
  ON public.scan_health FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
