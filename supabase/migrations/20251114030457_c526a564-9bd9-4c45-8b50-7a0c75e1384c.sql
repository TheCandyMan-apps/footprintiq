-- Create social_media_findings table
CREATE TABLE IF NOT EXISTS public.social_media_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.social_integrations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  finding_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  url TEXT,
  visibility TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  discovered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_social_media_findings_user_id ON public.social_media_findings(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_findings_platform ON public.social_media_findings(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_findings_risk_level ON public.social_media_findings(risk_level);

-- Enable RLS
ALTER TABLE public.social_media_findings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own social media findings"
  ON public.social_media_findings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social media findings"
  ON public.social_media_findings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social media findings"
  ON public.social_media_findings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social media findings"
  ON public.social_media_findings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_social_media_findings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_social_media_findings_updated_at
  BEFORE UPDATE ON public.social_media_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_social_media_findings_updated_at();