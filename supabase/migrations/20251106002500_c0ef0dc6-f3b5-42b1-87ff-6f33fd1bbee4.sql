-- Create scheduled_scans table for storing scan schedules
CREATE TABLE IF NOT EXISTS public.scheduled_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('email', 'username', 'domain', 'phone')),
  target_value TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  providers JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '{}'::jsonb,
  next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_scan_id UUID,
  is_active BOOLEAN DEFAULT true,
  notify_on_new_findings BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient cron queries
CREATE INDEX idx_scheduled_scans_next_run ON public.scheduled_scans(next_run_at) WHERE is_active = true;
CREATE INDEX idx_scheduled_scans_workspace ON public.scheduled_scans(workspace_id);
CREATE INDEX idx_scheduled_scans_user ON public.scheduled_scans(user_id);

-- Enable RLS
ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;

-- Policies for scheduled_scans
CREATE POLICY "Users can view their workspace scheduled scans"
  ON public.scheduled_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = scheduled_scans.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scheduled scans in their workspace"
  ON public.scheduled_scans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = scheduled_scans.workspace_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Users can update their workspace scheduled scans"
  ON public.scheduled_scans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = scheduled_scans.workspace_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Users can delete their workspace scheduled scans"
  ON public.scheduled_scans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = scheduled_scans.workspace_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'analyst')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_scans_updated_at
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tracking scan findings history
CREATE TABLE IF NOT EXISTS public.scheduled_scan_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_scan_id UUID NOT NULL REFERENCES public.scheduled_scans(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL,
  findings_count INTEGER NOT NULL DEFAULT 0,
  new_findings_count INTEGER NOT NULL DEFAULT 0,
  findings_snapshot JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_scheduled_scan_findings_scheduled_scan ON public.scheduled_scan_findings(scheduled_scan_id);
CREATE INDEX idx_scheduled_scan_findings_scan ON public.scheduled_scan_findings(scan_id);

-- Enable RLS
ALTER TABLE public.scheduled_scan_findings ENABLE ROW LEVEL SECURITY;

-- Policies for scheduled_scan_findings
CREATE POLICY "Users can view their workspace scheduled scan findings"
  ON public.scheduled_scan_findings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scheduled_scans ss
      INNER JOIN public.workspace_members wm ON wm.workspace_id = ss.workspace_id
      WHERE ss.id = scheduled_scan_findings.scheduled_scan_id
      AND wm.user_id = auth.uid()
    )
  );