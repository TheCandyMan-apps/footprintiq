-- Create ML configuration table for storing dynamic thresholds
CREATE TABLE IF NOT EXISTS public.ml_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ml_config ENABLE ROW LEVEL SECURITY;

-- Admin can view and update
CREATE POLICY "Admins can view ml config"
  ON public.ml_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage ml config"
  ON public.ml_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default confidence thresholds
INSERT INTO public.ml_config (config_key, config_value)
VALUES 
  ('confidence_thresholds', '{"low": 40, "medium": 70, "high": 85}'::jsonb),
  ('false_positive_patterns', '{"commonProviders": [], "lowConfidenceThreshold": 50, "categoryPatterns": {}}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;