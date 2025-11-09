-- Create spiderfoot_scans table to store scan results
CREATE TABLE public.spiderfoot_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('email', 'ip', 'domain', 'username', 'phone')),
  modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  scan_id TEXT, -- SpiderFoot scan ID
  total_events INTEGER DEFAULT 0,
  results JSONB DEFAULT '[]'::JSONB,
  correlations JSONB DEFAULT '[]'::JSONB,
  error TEXT,
  credits_used INTEGER DEFAULT 10,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spiderfoot_scans ENABLE ROW LEVEL SECURITY;

-- Policies for workspace members
CREATE POLICY "Users can view spiderfoot scans in their workspace"
  ON public.spiderfoot_scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spiderfoot_scans.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create spiderfoot scans in their workspace"
  ON public.spiderfoot_scans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spiderfoot_scans.workspace_id
      AND user_id = auth.uid()
      AND role IN ('analyst', 'admin')
    )
  );

CREATE POLICY "Users can update their workspace spiderfoot scans"
  ON public.spiderfoot_scans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spiderfoot_scans.workspace_id
      AND user_id = auth.uid()
      AND role IN ('analyst', 'admin')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_spiderfoot_scans_updated_at
  BEFORE UPDATE ON public.spiderfoot_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_spiderfoot_scans_workspace_id ON public.spiderfoot_scans(workspace_id);
CREATE INDEX idx_spiderfoot_scans_user_id ON public.spiderfoot_scans(user_id);
CREATE INDEX idx_spiderfoot_scans_status ON public.spiderfoot_scans(status);
CREATE INDEX idx_spiderfoot_scans_created_at ON public.spiderfoot_scans(created_at DESC);