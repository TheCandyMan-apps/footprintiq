-- Create scan_provider_events table for audit trail
CREATE TABLE IF NOT EXISTS public.scan_provider_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('start', 'success', 'failed', 'retry', 'skipped')),
  message TEXT,
  result_count INTEGER DEFAULT 0,
  error JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_scan_provider_events_scan_id ON public.scan_provider_events(scan_id, created_at DESC);
CREATE INDEX idx_scan_provider_events_provider ON public.scan_provider_events(provider, event);

-- Enable RLS
ALTER TABLE public.scan_provider_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view events for their own scans
CREATE POLICY "Users can view their scan provider events"
  ON public.scan_provider_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = scan_provider_events.scan_id
        AND scans.user_id = auth.uid()
    )
  );

-- Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_provider_events;