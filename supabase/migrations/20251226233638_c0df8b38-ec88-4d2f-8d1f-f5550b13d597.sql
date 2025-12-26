-- Create table for 404 error logging
CREATE TABLE public.page_not_found_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  search TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_not_found_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public logging)
CREATE POLICY "Anyone can log 404 events"
ON public.page_not_found_events
FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view 404 events"
ON public.page_not_found_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Index for querying by path and time
CREATE INDEX idx_page_not_found_path ON public.page_not_found_events(path);
CREATE INDEX idx_page_not_found_created_at ON public.page_not_found_events(created_at DESC);