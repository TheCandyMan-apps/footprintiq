
CREATE TABLE public.checklist_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  checklist_slug TEXT NOT NULL DEFAULT '2026-data-broker-removal',
  consent_given BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.checklist_downloads
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_checklist_downloads_email ON public.checklist_downloads (email);
