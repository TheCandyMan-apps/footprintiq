-- Create workspace_settings table for auto-refill and other settings
CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  auto_refill_enabled boolean DEFAULT false,
  auto_refill_threshold integer DEFAULT 50,
  auto_refill_package text DEFAULT 'osint-pro',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Workspace members can read settings
CREATE POLICY "Workspace members can read settings"
  ON public.workspace_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_settings.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Policy: Workspace admins can update settings
CREATE POLICY "Workspace admins can update settings"
  ON public.workspace_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_settings.workspace_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_settings.workspace_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_workspace_settings_updated_at
  BEFORE UPDATE ON public.workspace_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();