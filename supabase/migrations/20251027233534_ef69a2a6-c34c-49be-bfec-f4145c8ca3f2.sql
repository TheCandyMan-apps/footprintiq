-- Phase 18.3: SLOs, Observability & Incidents

-- SLO definitions
CREATE TABLE public.slo_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slo_type TEXT NOT NULL CHECK (slo_type IN ('latency', 'error_rate', 'availability', 'custom')),
  target_value NUMERIC NOT NULL,
  measurement_window TEXT NOT NULL DEFAULT '1h' CHECK (measurement_window IN ('5m', '15m', '1h', '6h', '24h')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLO measurements (time-series data)
CREATE TABLE public.slo_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slo_id UUID NOT NULL REFERENCES public.slo_definitions(id) ON DELETE CASCADE,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  measured_value NUMERIC NOT NULL,
  is_violation BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  impact TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  slack_thread_url TEXT,
  postmortem_url TEXT,
  affected_services TEXT[] DEFAULT '{}',
  root_cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incident updates (timeline)
CREATE TABLE public.incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  message TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Metrics aggregations (hourly/daily rollups)
CREATE TABLE public.metrics_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'histogram', 'gauge')),
  aggregation_period TEXT NOT NULL CHECK (aggregation_period IN ('1m', '5m', '15m', '1h', '24h')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Aggregated values
  count BIGINT DEFAULT 0,
  sum NUMERIC DEFAULT 0,
  min NUMERIC,
  max NUMERIC,
  avg NUMERIC,
  p50 NUMERIC,
  p95 NUMERIC,
  p99 NUMERIC,
  
  -- Dimensions
  dimensions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, aggregation_period, period_start, dimensions)
);

-- Alert rules
CREATE TABLE public.alert_rules_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('slo_violation', 'threshold', 'anomaly', 'circuit_breaker')),
  condition JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notification_channels JSONB NOT NULL DEFAULT '["email"]',
  cooldown_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alert events (history)
CREATE TABLE public.alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID REFERENCES public.alert_rules_v2(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slo_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slo_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SLO tables
CREATE POLICY "Admins can manage SLO definitions"
  ON public.slo_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert SLO measurements"
  ON public.slo_measurements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view SLO measurements"
  ON public.slo_measurements FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for incidents
CREATE POLICY "Admins can manage incidents"
  ON public.incidents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view public incidents"
  ON public.incidents FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage incident updates"
  ON public.incident_updates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view public incident updates"
  ON public.incident_updates FOR SELECT
  USING (is_public = true);

-- RLS Policies for metrics
CREATE POLICY "System can manage metrics"
  ON public.metrics_aggregations FOR ALL
  USING (true);

CREATE POLICY "Admins can view metrics"
  ON public.metrics_aggregations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for alerts
CREATE POLICY "Admins can manage alert rules"
  ON public.alert_rules_v2 FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alert events"
  ON public.alert_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage alert events"
  ON public.alert_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_slo_measurements_slo_measured ON public.slo_measurements(slo_id, measured_at DESC);
CREATE INDEX idx_slo_measurements_violation ON public.slo_measurements(is_violation) WHERE is_violation = true;
CREATE INDEX idx_incidents_status ON public.incidents(status) WHERE status != 'resolved';
CREATE INDEX idx_incidents_started ON public.incidents(started_at DESC);
CREATE INDEX idx_incident_updates_incident ON public.incident_updates(incident_id, created_at DESC);
CREATE INDEX idx_metrics_agg_lookup ON public.metrics_aggregations(metric_name, aggregation_period, period_start DESC);
CREATE INDEX idx_alert_events_created ON public.alert_events(created_at DESC);
CREATE INDEX idx_alert_events_unack ON public.alert_events(acknowledged_at) WHERE acknowledged_at IS NULL;

-- Triggers
CREATE TRIGGER update_slo_definitions_updated_at
  BEFORE UPDATE ON public.slo_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON public.alert_rules_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_incident_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.incidents WHERE incident_number = new_incident_number
    );
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique incident number';
    END IF;
  END LOOP;
  
  RETURN new_incident_number;
END;
$$;

-- Insert default SLO definitions
INSERT INTO public.slo_definitions (name, description, slo_type, target_value, measurement_window, severity)
VALUES
  ('API P95 Latency', 'API requests should complete within 2500ms at p95', 'latency', 2500, '15m', 'high'),
  ('API Error Rate', 'API error rate should be below 1%', 'error_rate', 1.0, '15m', 'critical'),
  ('Scan Availability', 'Scan service should be available 99.9% of the time', 'availability', 99.9, '1h', 'high'),
  ('Provider Circuit Breaker', 'No provider circuit breakers should be stuck open', 'custom', 0, '5m', 'medium')
ON CONFLICT (name) DO NOTHING;