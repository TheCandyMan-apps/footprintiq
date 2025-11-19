-- Create storage bucket for scan exports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scan-exports', 'scan-exports', false)
ON CONFLICT (id) DO NOTHING;

-- Create scan_artifacts table
CREATE TABLE IF NOT EXISTS public.scan_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('html', 'pdf', 'csv', 'txt', 'json', 'xmind')),
  file_url TEXT NOT NULL,
  signed_url TEXT,
  signed_url_expires_at TIMESTAMPTZ,
  file_size_bytes BIGINT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_artifacts_scan_id ON public.scan_artifacts(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_artifacts_type ON public.scan_artifacts(artifact_type);

-- Enable RLS
ALTER TABLE public.scan_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see artifacts for their own scans
CREATE POLICY "Users can view their own scan artifacts"
ON public.scan_artifacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_artifacts.scan_id
    AND scans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert artifacts for their own scans"
ON public.scan_artifacts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_artifacts.scan_id
    AND scans.user_id = auth.uid()
  )
);

-- Storage policies for scan-exports bucket
CREATE POLICY "Users can upload their own scan exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scan-exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own scan exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'scan-exports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own scan exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'scan-exports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_scan_artifacts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_scan_artifacts_updated_at_trigger
BEFORE UPDATE ON public.scan_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_scan_artifacts_updated_at();