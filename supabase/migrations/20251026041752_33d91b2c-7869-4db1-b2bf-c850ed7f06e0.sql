-- Create share_links table for time-limited report sharing
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Users can create share links for their own scans
CREATE POLICY "Users can create share links for own scans"
  ON public.share_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = share_links.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- Users can view their own share links
CREATE POLICY "Users can view own share links"
  ON public.share_links
  FOR SELECT
  USING (created_by = auth.uid());

-- Anyone can access non-expired share links (for public sharing)
CREATE POLICY "Anyone can access valid share links"
  ON public.share_links
  FOR SELECT
  USING (expires_at > now());

-- Create index for share token lookups
CREATE INDEX idx_share_links_token ON public.share_links(share_token);
CREATE INDEX idx_share_links_expires ON public.share_links(expires_at);