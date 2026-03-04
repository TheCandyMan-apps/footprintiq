
-- 1. Add the missing updated_at column to scans
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Backfill existing rows
UPDATE public.scans SET updated_at = COALESCE(completed_at, created_at) WHERE updated_at IS NULL;
