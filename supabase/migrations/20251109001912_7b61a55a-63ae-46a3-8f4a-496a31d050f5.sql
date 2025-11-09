-- Create recon_ng_scans table
CREATE TABLE IF NOT EXISTS public.recon_ng_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  target TEXT NOT NULL,
  target_type TEXT NOT NULL,
  modules TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  total_results INTEGER DEFAULT 0,
  results JSONB DEFAULT '[]',
  correlations JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.recon_ng_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their workspace scans"
  ON public.recon_ng_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = recon_ng_scans.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scans in their workspaces"
  ON public.recon_ng_scans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = recon_ng_scans.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their workspace scans"
  ON public.recon_ng_scans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = recon_ng_scans.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_recon_ng_scans_workspace ON public.recon_ng_scans(workspace_id);
CREATE INDEX idx_recon_ng_scans_user ON public.recon_ng_scans(user_id);
CREATE INDEX idx_recon_ng_scans_status ON public.recon_ng_scans(status);
CREATE INDEX idx_recon_ng_scans_created ON public.recon_ng_scans(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_recon_ng_scans_updated_at
  BEFORE UPDATE ON public.recon_ng_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.recon_ng_scans;