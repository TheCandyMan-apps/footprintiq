-- Create finding_enrichments table
CREATE TABLE IF NOT EXISTS public.finding_enrichments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  enriched_by UUID NOT NULL,
  context TEXT NOT NULL,
  links JSONB DEFAULT '[]'::jsonb,
  remediation_steps JSONB DEFAULT '[]'::jsonb,
  attack_vectors JSONB DEFAULT '[]'::jsonb,
  credits_spent INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_finding_enrichments_finding_id ON public.finding_enrichments(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_enrichments_workspace_id ON public.finding_enrichments(workspace_id);

-- Enable RLS
ALTER TABLE public.finding_enrichments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view enrichments for their workspace findings"
  ON public.finding_enrichments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = finding_enrichments.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create enrichments for their workspace findings"
  ON public.finding_enrichments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = finding_enrichments.workspace_id
      AND user_id = auth.uid()
    )
  );
