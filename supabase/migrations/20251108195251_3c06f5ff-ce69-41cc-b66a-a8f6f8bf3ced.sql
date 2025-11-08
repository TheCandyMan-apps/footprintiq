-- Add partial results tracking to scan_jobs
ALTER TABLE scan_jobs 
  ADD COLUMN IF NOT EXISTS partial_results JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS providers_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS providers_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_provider_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status_updated 
  ON scan_jobs(status, last_provider_update DESC);