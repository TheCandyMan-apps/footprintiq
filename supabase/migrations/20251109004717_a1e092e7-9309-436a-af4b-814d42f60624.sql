-- Create table for module auto-update preferences
CREATE TABLE IF NOT EXISTS public.recon_ng_auto_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  schedule TEXT NOT NULL DEFAULT 'weekly', -- daily, weekly
  last_check_at TIMESTAMPTZ,
  last_update_at TIMESTAMPTZ,
  modules_to_watch TEXT[] DEFAULT ARRAY[]::TEXT[], -- empty = all modules
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Create table for module update history
CREATE TABLE IF NOT EXISTS public.recon_ng_update_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  old_version TEXT,
  new_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success', -- success, failed
  error_message TEXT,
  changelog TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recon_ng_auto_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recon_ng_update_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto_updates
CREATE POLICY "Users can view auto-update settings for their workspaces"
  ON public.recon_ng_auto_updates FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage auto-update settings for their workspaces"
  ON public.recon_ng_auto_updates FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

-- RLS Policies for update_history
CREATE POLICY "Users can view update history for their workspaces"
  ON public.recon_ng_update_history FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert update history"
  ON public.recon_ng_update_history FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_auto_updates_workspace ON public.recon_ng_auto_updates(workspace_id);
CREATE INDEX idx_auto_updates_enabled ON public.recon_ng_auto_updates(enabled, schedule);
CREATE INDEX idx_update_history_workspace ON public.recon_ng_update_history(workspace_id);
CREATE INDEX idx_update_history_module ON public.recon_ng_update_history(module_name);
CREATE INDEX idx_update_history_updated_at ON public.recon_ng_update_history(updated_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_recon_ng_auto_updates_updated_at
  BEFORE UPDATE ON public.recon_ng_auto_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();