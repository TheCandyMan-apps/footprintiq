-- Create consents table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
  ON public.consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert their own consents"
  ON public.consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all consents
CREATE POLICY "Admins can view all consents"
  ON public.consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster user lookups
CREATE INDEX idx_consents_user_id ON public.consents(user_id);
CREATE INDEX idx_consents_consent_type ON public.consents(consent_type);
CREATE INDEX idx_consents_consented_at ON public.consents(consented_at DESC);