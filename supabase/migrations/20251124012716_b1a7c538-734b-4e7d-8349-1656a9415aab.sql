-- Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_workflows_workspace_id ON public.workflows(workspace_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_enabled ON public.workflows(enabled);
CREATE INDEX idx_workflows_trigger_type ON public.workflows(trigger_type);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view workflows in their workspace
CREATE POLICY "Users can view workflows in their workspace"
  ON public.workflows
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create workflows in their workspace
CREATE POLICY "Users can create workflows in their workspace"
  ON public.workflows
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- RLS Policy: Users can update their own workflows or workspace admins can update any
CREATE POLICY "Users can update their workflows or admins can update any"
  ON public.workflows
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Users can delete their own workflows or workspace admins can delete any
CREATE POLICY "Users can delete their workflows or admins can delete any"
  ON public.workflows
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_workflows_updated_at_trigger
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflows_updated_at();