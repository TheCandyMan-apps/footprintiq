-- Create webhook_endpoints table
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  connector_type TEXT NOT NULL CHECK (connector_type IN ('slack', 'discord', 'teams', 'generic')),
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  signing_secret TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Users can view their own webhooks
CREATE POLICY "Users can view own webhooks"
  ON public.webhook_endpoints
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own webhooks
CREATE POLICY "Users can insert own webhooks"
  ON public.webhook_endpoints
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own webhooks
CREATE POLICY "Users can update own webhooks"
  ON public.webhook_endpoints
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own webhooks
CREATE POLICY "Users can delete own webhooks"
  ON public.webhook_endpoints
  FOR DELETE
  USING (auth.uid() = user_id);

-- Workspace members can view workspace webhooks
CREATE POLICY "Workspace members can view workspace webhooks"
  ON public.webhook_endpoints
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_webhook_endpoints_user_id ON public.webhook_endpoints(user_id);
CREATE INDEX idx_webhook_endpoints_workspace_id ON public.webhook_endpoints(workspace_id);

-- Create updated_at trigger
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();