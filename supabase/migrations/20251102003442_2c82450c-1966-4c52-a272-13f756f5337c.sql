-- Create workspace_features table to store enabled features per workspace
CREATE TABLE IF NOT EXISTS public.workspace_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.workspace_features ENABLE ROW LEVEL SECURITY;

-- Policies for workspace_features
CREATE POLICY "Users can view their workspace features"
  ON public.workspace_features
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_features.workspace_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace features"
  ON public.workspace_features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_features.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Create function to check if workspace has feature
CREATE OR REPLACE FUNCTION public.workspace_has_feature(
  _workspace_id UUID,
  _feature_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM public.workspace_features
     WHERE workspace_id = _workspace_id AND feature_name = _feature_name),
    false
  );
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_workspace_features_updated_at
  BEFORE UPDATE ON public.workspace_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();