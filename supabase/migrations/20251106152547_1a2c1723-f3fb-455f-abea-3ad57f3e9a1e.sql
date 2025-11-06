-- Add archived_at column to scans table for soft delete functionality
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add archived_at column to scan_jobs table for soft delete functionality
ALTER TABLE public.scan_jobs
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for archived scans queries
CREATE INDEX IF NOT EXISTS idx_scans_archived_at ON public.scans(archived_at);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_archived_at ON public.scan_jobs(archived_at);

-- Add comment explaining the archive pattern
COMMENT ON COLUMN public.scans.archived_at IS 'Timestamp when scan was archived. NULL means active, non-NULL means archived.';
COMMENT ON COLUMN public.scan_jobs.archived_at IS 'Timestamp when scan job was archived. NULL means active, non-NULL means archived.';