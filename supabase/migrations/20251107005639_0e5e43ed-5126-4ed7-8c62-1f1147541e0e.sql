-- Create dark_web_findings table for storing dark web alerts
CREATE TABLE IF NOT EXISTS public.dark_web_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dark_web_findings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own dark web findings
CREATE POLICY "Users can view their own dark web findings"
  ON public.dark_web_findings
  FOR SELECT
  USING (
    scan_id IN (
      SELECT id FROM public.scans WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert dark web findings
CREATE POLICY "Authenticated users can insert dark web findings"
  ON public.dark_web_findings
  FOR INSERT
  WITH CHECK (
    scan_id IN (
      SELECT id FROM public.scans WHERE user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_dark_web_findings_scan_id ON public.dark_web_findings(scan_id);
CREATE INDEX idx_dark_web_findings_discovered_at ON public.dark_web_findings(discovered_at DESC);