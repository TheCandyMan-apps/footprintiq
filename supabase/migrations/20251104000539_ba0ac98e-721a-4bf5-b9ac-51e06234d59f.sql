-- Create consent tracking table
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('analytics', 'marketing', 'functional', 'necessary')),
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view own consents"
  ON public.user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents"
  ON public.user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents
CREATE POLICY "Users can update own consents"
  ON public.user_consents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX idx_user_consents_granted ON public.user_consents(granted);

-- Create trigger for updated_at
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create consent history for audit trail
CREATE TABLE IF NOT EXISTS public.consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'updated')),
  previous_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on history
ALTER TABLE public.consent_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent history
CREATE POLICY "Users can view own consent history"
  ON public.consent_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert history
CREATE POLICY "Service can insert consent history"
  ON public.consent_history
  FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX idx_consent_history_user_id ON public.consent_history(user_id);
CREATE INDEX idx_consent_history_created ON public.consent_history(created_at DESC);