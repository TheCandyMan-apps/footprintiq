-- Create scan_progress table for reliable real-time updates
CREATE TABLE public.scan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL,
  total_providers INTEGER DEFAULT 0,
  completed_providers INTEGER DEFAULT 0,
  current_provider TEXT,
  current_providers TEXT[],
  findings_count INTEGER DEFAULT 0,
  message TEXT,
  error BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- Create indexes for fast lookups
CREATE INDEX idx_scan_progress_scan_id ON public.scan_progress(scan_id);
CREATE INDEX idx_scan_progress_updated_at ON public.scan_progress(updated_at DESC);

-- Enable realtime
ALTER TABLE public.scan_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_progress;

-- RLS policies
ALTER TABLE public.scan_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their scan progress"
  ON public.scan_progress FOR SELECT
  USING (
    scan_id IN (
      SELECT id FROM scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage scan progress"
  ON public.scan_progress FOR ALL
  USING (true)
  WITH CHECK (true);