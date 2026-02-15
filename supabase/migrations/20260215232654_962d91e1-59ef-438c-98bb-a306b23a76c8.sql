
-- Add missing columns for JSONB artifact storage
ALTER TABLE public.scan_artifacts
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add composite index for source + artifact_type lookups
CREATE INDEX IF NOT EXISTS idx_scan_artifacts_source_type ON public.scan_artifacts(source, artifact_type);

-- Add index on scan_id if not exists
CREATE INDEX IF NOT EXISTS idx_scan_artifacts_scan_id ON public.scan_artifacts(scan_id);

-- Add admin policy if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scan_artifacts' AND policyname = 'Admins can access all artifacts'
  ) THEN
    CREATE POLICY "Admins can access all artifacts"
      ON public.scan_artifacts
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
