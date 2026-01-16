-- LENS Forensic Module: Create evidence_ledger table for storing verification records

CREATE TABLE public.evidence_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Verification data from n8n
  verification_hash TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  hashed_content TEXT,
  
  -- Metadata summary
  source_age TEXT,
  ssl_status TEXT,
  platform_consistency TEXT,
  
  -- Timestamps
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Raw n8n response for debugging
  raw_response JSONB
);

-- Add validation trigger for confidence_score (0-100)
CREATE OR REPLACE FUNCTION public.validate_confidence_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confidence_score < 0 OR NEW.confidence_score > 100 THEN
    RAISE EXCEPTION 'confidence_score must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_confidence_score_trigger
BEFORE INSERT OR UPDATE ON public.evidence_ledger
FOR EACH ROW EXECUTE FUNCTION public.validate_confidence_score();

-- Enable RLS
ALTER TABLE public.evidence_ledger ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification records
CREATE POLICY "Users can view own ledger entries"
  ON public.evidence_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ledger entries"
  ON public.evidence_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_evidence_ledger_finding_id ON public.evidence_ledger(finding_id);
CREATE INDEX idx_evidence_ledger_scan_id ON public.evidence_ledger(scan_id);
CREATE INDEX idx_evidence_ledger_user_id ON public.evidence_ledger(user_id);

-- Add comment for documentation
COMMENT ON TABLE public.evidence_ledger IS 'LENS Forensic Module: Stores cryptographic verification records for scan findings';