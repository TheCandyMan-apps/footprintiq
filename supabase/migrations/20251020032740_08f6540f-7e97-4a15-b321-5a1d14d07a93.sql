-- Phase 16: Advanced Analytics & ML

-- ML Models registry
CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'risk_prediction', 'pattern_detection', 'anomaly_detection'
  version TEXT NOT NULL,
  accuracy_score NUMERIC,
  training_data_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_trained_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Risk predictions
CREATE TABLE IF NOT EXISTS public.risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.ml_models(id) ON DELETE SET NULL,
  predicted_risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  confidence_score NUMERIC NOT NULL,
  factors JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detected patterns
CREATE TABLE IF NOT EXISTS public.detected_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_scans JSONB DEFAULT '[]',
  first_detected TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- Anomalies
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'
);

-- Trend forecasts
CREATE TABLE IF NOT EXISTS public.trend_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_type TEXT NOT NULL,
  predicted_values JSONB NOT NULL,
  confidence_interval JSONB,
  forecast_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  model_id UUID REFERENCES public.ml_models(id) ON DELETE SET NULL
);

-- User behavior analytics
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  behavior_type TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  insights JSONB NOT NULL DEFAULT '[]',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL
);

-- Analytics aggregations (for dashboards)
CREATE TABLE IF NOT EXISTS public.analytics_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  aggregation_type TEXT NOT NULL,
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  data JSONB NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL
);

-- Enable RLS
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ml_models (public read)
CREATE POLICY "ML models are viewable by everyone"
  ON public.ml_models FOR SELECT
  USING (is_active = true);

-- RLS Policies for risk_predictions
CREATE POLICY "Users can view own risk predictions"
  ON public.risk_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk predictions"
  ON public.risk_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for detected_patterns
CREATE POLICY "Users can view own patterns"
  ON public.detected_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own patterns"
  ON public.detected_patterns FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for anomalies
CREATE POLICY "Users can view own anomalies"
  ON public.anomalies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own anomalies"
  ON public.anomalies FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for trend_forecasts
CREATE POLICY "Users can view own forecasts"
  ON public.trend_forecasts FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for user_behavior_analytics
CREATE POLICY "Users can view own behavior analytics"
  ON public.user_behavior_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for analytics_aggregations
CREATE POLICY "Users can view own aggregations"
  ON public.analytics_aggregations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_predictions_user ON public.risk_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_scan ON public.risk_predictions(scan_id);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_user ON public.detected_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_user ON public.anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_trend_forecasts_user ON public.trend_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON public.user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_agg_user ON public.analytics_aggregations(user_id);

-- Trigger to update last_seen on patterns
CREATE OR REPLACE FUNCTION update_pattern_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = now();
  NEW.occurrence_count = NEW.occurrence_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pattern_timestamp
  BEFORE UPDATE ON public.detected_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_last_seen();