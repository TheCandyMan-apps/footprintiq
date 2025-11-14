-- Create social_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.social_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.social_integrations;
DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.social_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.social_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.social_integrations;

-- Create RLS policies for social_integrations
CREATE POLICY "Users can view their own integrations"
  ON public.social_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON public.social_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.social_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON public.social_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_social_integrations_user_id ON public.social_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_social_integrations_platform ON public.social_integrations(user_id, platform);

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_social_integrations_updated_at ON public.social_integrations;
CREATE TRIGGER update_social_integrations_updated_at
  BEFORE UPDATE ON public.social_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();