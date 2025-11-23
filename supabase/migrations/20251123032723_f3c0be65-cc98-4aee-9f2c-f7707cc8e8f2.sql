-- Add caching fields to scans table
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS cache_key TEXT,
  ADD COLUMN IF NOT EXISTS cached_from_scan_id UUID REFERENCES public.scans(id);

-- Create index for fast cache lookups
CREATE INDEX IF NOT EXISTS scans_cache_key_created_at_idx
  ON public.scans(cache_key, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.scans.cache_key IS 'Composite key for caching: workspace_id:scan_type:normalized_target';
COMMENT ON COLUMN public.scans.cached_from_scan_id IS 'If this scan was served from cache, links to the original scan';

-- Ensure cached_from_scan_id is readable under existing RLS
-- (existing scans RLS policies should already cover this since it's a reference to scans)