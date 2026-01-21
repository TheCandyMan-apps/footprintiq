-- Scan Enrichments Table
-- Stores normalized enrichment signals (Spamhaus, future enrichment providers)
CREATE TABLE public.scan_enrichments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  enrichment_type TEXT NOT NULL CHECK (enrichment_type IN ('spamhaus', 'reputation', 'abuse_signals')),
  input_type TEXT NOT NULL CHECK (input_type IN ('ip', 'domain', 'email')),
  input_value TEXT NOT NULL,
  signal JSONB NOT NULL,
  verdict TEXT CHECK (verdict IN ('low', 'medium', 'high', 'unknown')),
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for scan lookups
CREATE INDEX idx_scan_enrichments_scan_id ON public.scan_enrichments(scan_id);
CREATE INDEX idx_scan_enrichments_type ON public.scan_enrichments(enrichment_type);
CREATE UNIQUE INDEX idx_scan_enrichments_unique ON public.scan_enrichments(scan_id, enrichment_type, input_type, input_value);

-- Enable RLS
ALTER TABLE public.scan_enrichments ENABLE ROW LEVEL SECURITY;

-- Allow users to read enrichments for scans they own
CREATE POLICY "Users can view enrichments for their scans"
ON public.scan_enrichments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.scans s
    WHERE s.id = scan_enrichments.scan_id
    AND s.user_id = auth.uid()
  )
);

-- Service role can insert enrichments
-- No INSERT policy for regular users - only service_role can insert

-- Add comments
COMMENT ON TABLE public.scan_enrichments IS 'Stores normalized enrichment signals for scans (reputation, abuse intelligence)';
COMMENT ON COLUMN public.scan_enrichments.signal IS 'Normalized signal data (no raw provider data)';