-- Phase 21: Intelligence AI Fusion & Predictive Persona Resolution

-- Enable pgvector extension for vector similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- Persona vectors table for multi-modal embeddings
CREATE TABLE IF NOT EXISTS public.persona_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  embeddings vector(1536),
  modality TEXT NOT NULL CHECK (modality IN ('text', 'image', 'social', 'infra')),
  source TEXT,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_persona_vectors_entity ON public.persona_vectors(entity_id);
CREATE INDEX idx_persona_vectors_user ON public.persona_vectors(user_id);
CREATE INDEX idx_persona_vectors_modality ON public.persona_vectors(modality);
CREATE INDEX idx_persona_vectors_embeddings ON public.persona_vectors USING ivfflat (embeddings vector_cosine_ops);

-- Link predictions for entity resolution
CREATE TABLE IF NOT EXISTS public.link_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_a UUID NOT NULL,
  entity_b UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
  rationale JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'review')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_a, entity_b, user_id)
);

CREATE INDEX idx_link_predictions_user ON public.link_predictions(user_id);
CREATE INDEX idx_link_predictions_entities ON public.link_predictions(entity_a, entity_b);
CREATE INDEX idx_link_predictions_probability ON public.link_predictions(probability DESC);
CREATE INDEX idx_link_predictions_status ON public.link_predictions(status);

-- Linguistic fingerprints for behavioral analysis
CREATE TABLE IF NOT EXISTS public.linguistic_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_version TEXT NOT NULL,
  writing_style JSONB,
  activity_rhythm JSONB,
  vocabulary_stats JSONB,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_linguistic_fingerprints_entity ON public.linguistic_fingerprints(entity_id);
CREATE INDEX idx_linguistic_fingerprints_user ON public.linguistic_fingerprints(user_id);

-- AI explanations for transparency
CREATE TABLE IF NOT EXISTS public.ai_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES public.link_predictions(id) ON DELETE CASCADE,
  explanation TEXT NOT NULL,
  weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_version TEXT NOT NULL,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_explanations_user ON public.ai_explanations(user_id);
CREATE INDEX idx_ai_explanations_prediction ON public.ai_explanations(prediction_id);

-- Threat forecasts for anomaly detection
CREATE TABLE IF NOT EXISTS public.threat_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_type TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_intervals JSONB,
  model_used TEXT NOT NULL,
  forecast_horizon_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_threat_forecasts_user ON public.threat_forecasts(user_id);
CREATE INDEX idx_threat_forecasts_type ON public.threat_forecasts(forecast_type);
CREATE INDEX idx_threat_forecasts_valid ON public.threat_forecasts(valid_until);

-- RLS Policies
ALTER TABLE public.persona_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linguistic_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_forecasts ENABLE ROW LEVEL SECURITY;

-- Persona vectors policies
CREATE POLICY "Users can manage own persona vectors"
  ON public.persona_vectors FOR ALL
  USING (auth.uid() = user_id);

-- Link predictions policies
CREATE POLICY "Users can view own link predictions"
  ON public.link_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create link predictions"
  ON public.link_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own link predictions"
  ON public.link_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Linguistic fingerprints policies
CREATE POLICY "Users can manage own fingerprints"
  ON public.linguistic_fingerprints FOR ALL
  USING (auth.uid() = user_id);

-- AI explanations policies
CREATE POLICY "Users can view own explanations"
  ON public.ai_explanations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert explanations"
  ON public.ai_explanations FOR INSERT
  WITH CHECK (true);

-- Threat forecasts policies
CREATE POLICY "Users can view own forecasts"
  ON public.threat_forecasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage forecasts"
  ON public.threat_forecasts FOR ALL
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_persona_vectors_updated_at
  BEFORE UPDATE ON public.persona_vectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_link_predictions_updated_at
  BEFORE UPDATE ON public.link_predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linguistic_fingerprints_updated_at
  BEFORE UPDATE ON public.linguistic_fingerprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();