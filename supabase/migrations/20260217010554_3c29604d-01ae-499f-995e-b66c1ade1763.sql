
-- Sovereignty Requests table for RTBF/erasure tracking
CREATE TABLE public.sovereignty_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  target_entity TEXT NOT NULL, -- broker/platform name
  target_url TEXT, -- URL of the listing
  jurisdiction TEXT NOT NULL DEFAULT 'gdpr', -- gdpr, ccpa, uk_sds
  request_type TEXT NOT NULL DEFAULT 'erasure', -- erasure, rectification, access
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, acknowledged, processing, completed, rejected, expired
  submitted_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  template_data JSONB DEFAULT '{}',
  notes TEXT,
  scan_id UUID REFERENCES public.scans(id) ON DELETE SET NULL,
  finding_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sovereignty_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies - users access own workspace data
CREATE POLICY "Users can view own workspace sovereignty requests"
  ON public.sovereignty_requests FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can create sovereignty requests in own workspace"
  ON public.sovereignty_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can update own sovereignty requests"
  ON public.sovereignty_requests FOR UPDATE
  USING (auth.uid() = user_id AND public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can delete own sovereignty requests"
  ON public.sovereignty_requests FOR DELETE
  USING (auth.uid() = user_id AND public.is_workspace_member(workspace_id, auth.uid()));

-- Admin bypass
CREATE POLICY "Admins can manage all sovereignty requests"
  ON public.sovereignty_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_sovereignty_requests_workspace ON public.sovereignty_requests(workspace_id);
CREATE INDEX idx_sovereignty_requests_user ON public.sovereignty_requests(user_id);
CREATE INDEX idx_sovereignty_requests_status ON public.sovereignty_requests(status);
CREATE INDEX idx_sovereignty_requests_jurisdiction ON public.sovereignty_requests(jurisdiction);

-- Updated_at trigger
CREATE TRIGGER update_sovereignty_requests_updated_at
  BEFORE UPDATE ON public.sovereignty_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sovereignty_requests;

-- Sovereignty score snapshots for trend tracking
CREATE TABLE public.sovereignty_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  factors JSONB NOT NULL DEFAULT '{}', -- breakdown of score components
  exposure_count INTEGER DEFAULT 0,
  removals_completed INTEGER DEFAULT 0,
  removals_pending INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sovereignty_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sovereignty scores"
  ON public.sovereignty_scores FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "System can insert sovereignty scores"
  ON public.sovereignty_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage sovereignty scores"
  ON public.sovereignty_scores FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_sovereignty_scores_workspace ON public.sovereignty_scores(workspace_id);
CREATE INDEX idx_sovereignty_scores_calculated ON public.sovereignty_scores(calculated_at DESC);
