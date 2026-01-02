-- Create canonical_results table for deduplicated, enriched scan results
-- Deduplication key: platform + username (not URL fingerprint)
-- URLs stored as variants in JSONB array

CREATE TABLE public.canonical_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Deduplication key: lower(platform):lower(username)
  canonical_key TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  canonical_username TEXT NOT NULL,
  
  -- Primary display URL (highest priority variant)
  primary_url TEXT,
  
  -- Page type of primary URL (for UI sorting/demotion)
  -- profile > directory > api > search > unknown
  page_type TEXT NOT NULL DEFAULT 'profile',
  
  -- URL variants: all found URLs for this platform+username
  -- Structure: [{ url, page_type, provider, is_verified, verification_status, source_finding_id, priority }]
  url_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Aggregated severity/confidence (highest from all variants)
  severity TEXT NOT NULL DEFAULT 'info',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  
  -- Verification status of primary URL
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT,
  last_verified_at TIMESTAMPTZ,
  
  -- AI enrichment fields
  risk_score INTEGER,
  ai_summary TEXT,
  remediation_priority TEXT,
  platform_category TEXT,
  
  -- Source tracking
  source_finding_ids UUID[] DEFAULT '{}',
  source_providers TEXT[] DEFAULT '{}',
  processing_pipeline TEXT DEFAULT 'n8n',
  
  -- Timestamps
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint: one row per scan + platform + username
  CONSTRAINT canonical_results_scan_key_unique UNIQUE(scan_id, canonical_key)
);

-- Create indexes for efficient queries
CREATE INDEX idx_canonical_results_scan_id ON public.canonical_results(scan_id);
CREATE INDEX idx_canonical_results_workspace_id ON public.canonical_results(workspace_id);
CREATE INDEX idx_canonical_results_canonical_key ON public.canonical_results(canonical_key);
CREATE INDEX idx_canonical_results_page_type ON public.canonical_results(page_type);
CREATE INDEX idx_canonical_results_platform_name ON public.canonical_results(platform_name);

-- Enable Row Level Security
ALTER TABLE public.canonical_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view canonical results for their workspace scans
CREATE POLICY "Users can view canonical results for workspace scans"
  ON public.canonical_results
  FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

-- RLS Policy: Service role can manage all canonical results
CREATE POLICY "Service role can manage canonical results"
  ON public.canonical_results
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_canonical_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_canonical_results_updated_at
  BEFORE UPDATE ON public.canonical_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_canonical_results_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.canonical_results IS 'Deduplicated, enriched scan results. Key: platform+username. URLs stored as variants.';
COMMENT ON COLUMN public.canonical_results.canonical_key IS 'Dedup key: lower(platform_name):lower(canonical_username)';
COMMENT ON COLUMN public.canonical_results.page_type IS 'Type of primary_url: profile, directory, api, search, unknown. Used for UI sorting.';
COMMENT ON COLUMN public.canonical_results.url_variants IS 'Array of all URL variants found for this platform+username';