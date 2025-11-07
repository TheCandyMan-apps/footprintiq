-- Add anon_mode setting to user profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS anon_mode_enabled boolean DEFAULT false;

-- Add proxy configuration table
CREATE TABLE IF NOT EXISTS public.proxy_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  proxy_type text NOT NULL, -- 'tor', 'http', 'socks5'
  proxy_url text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add source credibility scores table (linked to scans and providers)
CREATE TABLE IF NOT EXISTS public.source_credibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES public.scans(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  credibility_score numeric(3,2) CHECK (credibility_score >= 0 AND credibility_score <= 1),
  confidence numeric(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  reasoning text,
  data_quality_score numeric(3,2),
  verification_method text,
  verified_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proxy_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_credibility ENABLE ROW LEVEL SECURITY;

-- Policies for proxy_configs
CREATE POLICY "Users can view own proxy configs"
  ON public.proxy_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proxy configs"
  ON public.proxy_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proxy configs"
  ON public.proxy_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proxy configs"
  ON public.proxy_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for source_credibility
CREATE POLICY "Users can view credibility scores for their scans"
  ON public.source_credibility FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = source_credibility.scan_id
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert credibility scores"
  ON public.source_credibility FOR INSERT
  WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_proxy_configs_user_id ON public.proxy_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_source_credibility_scan_id ON public.source_credibility(scan_id);
CREATE INDEX IF NOT EXISTS idx_source_credibility_provider ON public.source_credibility(provider_name);
CREATE INDEX IF NOT EXISTS idx_profiles_anon_mode ON public.profiles(anon_mode_enabled) WHERE anon_mode_enabled = true;