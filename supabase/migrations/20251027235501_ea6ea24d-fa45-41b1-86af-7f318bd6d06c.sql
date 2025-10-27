-- Phase 18.4: Circuit Breaker Enhancements

-- Circuit breaker state tracking
CREATE TABLE public.circuit_breaker_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('closed', 'open', 'half_open')) DEFAULT 'closed',
  failure_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  half_opened_at TIMESTAMP WITH TIME ZONE,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  
  -- Adaptive thresholds
  failure_threshold INTEGER NOT NULL DEFAULT 5,
  success_threshold INTEGER NOT NULL DEFAULT 2,
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  
  -- Circuit breaker config
  cooldown_period_ms INTEGER NOT NULL DEFAULT 60000,
  half_open_max_calls INTEGER NOT NULL DEFAULT 3,
  
  -- Metrics
  total_trips INTEGER NOT NULL DEFAULT 0,
  total_calls_blocked INTEGER NOT NULL DEFAULT 0,
  avg_recovery_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Circuit breaker events (history)
CREATE TABLE public.circuit_breaker_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('trip', 'reset', 'half_open', 'call_blocked', 'call_success', 'call_failure')),
  previous_state TEXT,
  new_state TEXT,
  failure_count INTEGER,
  success_count INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Provider health scores (real-time)
CREATE TABLE public.provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL UNIQUE,
  health_score NUMERIC(5, 2) NOT NULL DEFAULT 100.0 CHECK (health_score >= 0 AND health_score <= 100),
  
  -- Recent metrics (last 5 minutes)
  recent_success_rate NUMERIC(5, 2),
  recent_avg_latency_ms INTEGER,
  recent_error_count INTEGER DEFAULT 0,
  recent_timeout_count INTEGER DEFAULT 0,
  
  -- Status flags
  is_healthy BOOLEAN NOT NULL DEFAULT true,
  is_degraded BOOLEAN NOT NULL DEFAULT false,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  degradation_reason TEXT,
  
  -- Circuit breaker status
  circuit_breaker_state TEXT,
  circuit_breaker_trips_24h INTEGER DEFAULT 0,
  
  last_checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circuit_breaker_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breaker_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circuit_breaker_states
CREATE POLICY "Admins can view circuit breaker states"
  ON public.circuit_breaker_states FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage circuit breaker states"
  ON public.circuit_breaker_states FOR ALL
  USING (true);

-- RLS Policies for circuit_breaker_events
CREATE POLICY "Admins can view circuit breaker events"
  ON public.circuit_breaker_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert circuit breaker events"
  ON public.circuit_breaker_events FOR INSERT
  WITH CHECK (true);

-- RLS Policies for provider_health
CREATE POLICY "Anyone can view provider health"
  ON public.provider_health FOR SELECT
  USING (true);

CREATE POLICY "System can manage provider health"
  ON public.provider_health FOR ALL
  USING (true);

-- Indexes
CREATE INDEX idx_circuit_breaker_states_provider ON public.circuit_breaker_states(provider_id);
CREATE INDEX idx_circuit_breaker_states_state ON public.circuit_breaker_states(state);
CREATE INDEX idx_circuit_breaker_events_provider ON public.circuit_breaker_events(provider_id, created_at DESC);
CREATE INDEX idx_circuit_breaker_events_type ON public.circuit_breaker_events(event_type, created_at DESC);
CREATE INDEX idx_provider_health_score ON public.provider_health(health_score);
CREATE INDEX idx_provider_health_status ON public.provider_health(is_healthy, is_degraded, is_critical);

-- Triggers
CREATE TRIGGER update_circuit_breaker_states_updated_at
  BEFORE UPDATE ON public.circuit_breaker_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_provider_health_updated_at
  BEFORE UPDATE ON public.provider_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Seed initial circuit breaker states for common providers
INSERT INTO public.circuit_breaker_states (provider_id, failure_threshold, success_threshold, timeout_ms, cooldown_period_ms)
VALUES
  ('hibp', 5, 2, 30000, 60000),
  ('dehashed', 5, 2, 30000, 60000),
  ('hunter', 5, 2, 30000, 60000),
  ('shodan', 5, 2, 30000, 60000),
  ('censys', 5, 2, 30000, 60000),
  ('virustotal', 5, 2, 30000, 60000),
  ('abuseipdb', 5, 2, 30000, 60000),
  ('securitytrails', 5, 2, 30000, 60000),
  ('apify', 5, 2, 30000, 60000),
  ('intelx', 5, 2, 30000, 60000)
ON CONFLICT (provider_id) DO NOTHING;

-- Seed initial provider health
INSERT INTO public.provider_health (provider_id, health_score, is_healthy)
VALUES
  ('hibp', 100.0, true),
  ('dehashed', 100.0, true),
  ('hunter', 100.0, true),
  ('shodan', 100.0, true),
  ('censys', 100.0, true),
  ('virustotal', 100.0, true),
  ('abuseipdb', 100.0, true),
  ('securitytrails', 100.0, true),
  ('apify', 100.0, true),
  ('intelx', 100.0, true)
ON CONFLICT (provider_id) DO NOTHING;