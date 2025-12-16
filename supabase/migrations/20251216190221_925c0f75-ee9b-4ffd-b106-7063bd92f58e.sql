-- Add results_route column to scans table for deterministic View Results routing
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS results_route text NOT NULL DEFAULT 'results';

-- Add check constraint for valid values
ALTER TABLE public.scans
  ADD CONSTRAINT scans_results_route_check 
  CHECK (results_route IN ('results', 'maigret'));

-- Comment for documentation
COMMENT ON COLUMN public.scans.results_route IS 'Determines which results page to route to: results (full/advanced) or maigret (basic username only)';