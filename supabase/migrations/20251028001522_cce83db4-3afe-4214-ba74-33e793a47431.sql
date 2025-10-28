-- Phase 19: Performance & Scale

-- Cache layer for frequently accessed data
CREATE TABLE public.cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_value JSONB NOT NULL,
  
  -- Cache metadata
  cache_type TEXT NOT NULL CHECK (cache_type IN ('scan', 'provider', 'user', 'query')),
  ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  
  -- Access tracking
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Lifecycle
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Query performance tracking
CREATE TABLE public.query_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  query_type TEXT NOT NULL,
  
  -- Performance metrics
  execution_time_ms INTEGER NOT NULL,
  rows_examined INTEGER,
  rows_returned INTEGER,
  
  -- Query details
  table_name TEXT,
  operation TEXT CHECK (operation IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  
  -- Optimization hints
  used_index BOOLEAN DEFAULT false,
  needs_optimization BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting tracking
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- user_id, ip, api_key
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key', 'workspace')),
  
  -- Limit configuration
  endpoint TEXT NOT NULL,
  limit_per_window INTEGER NOT NULL DEFAULT 100,
  window_seconds INTEGER NOT NULL DEFAULT 60,
  
  -- Current state
  current_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Tracking
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_blocked INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(identifier, identifier_type, endpoint, window_start)
);

-- Background job queue
CREATE TABLE public.background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('scan', 'export', 'cleanup', 'aggregation', 'notification')),
  
  -- Job data
  payload JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 0 AND priority <= 10),
  
  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  last_error TEXT,
  error_details JSONB,
  
  -- Assignment
  worker_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance baselines
CREATE TABLE public.performance_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('latency', 'throughput', 'error_rate', 'saturation')),
  
  -- Baseline values
  p50_value NUMERIC(10, 2) NOT NULL,
  p95_value NUMERIC(10, 2) NOT NULL,
  p99_value NUMERIC(10, 2) NOT NULL,
  
  -- Context
  resource_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sample_count INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(metric_name, resource_name, period_start)
);

-- Connection pool stats
CREATE TABLE public.connection_pool_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pool metrics
  pool_name TEXT NOT NULL,
  active_connections INTEGER NOT NULL,
  idle_connections INTEGER NOT NULL,
  waiting_requests INTEGER NOT NULL DEFAULT 0,
  
  -- Performance
  avg_wait_time_ms INTEGER,
  max_connections INTEGER NOT NULL,
  connection_errors INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_pool_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cache_entries
CREATE POLICY "System can manage cache entries"
  ON public.cache_entries FOR ALL
  USING (true);

-- RLS Policies for query_performance
CREATE POLICY "Admins can view query performance"
  ON public.query_performance FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert query performance"
  ON public.query_performance FOR INSERT
  WITH CHECK (true);

-- RLS Policies for rate_limits
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits FOR SELECT
  USING (identifier = auth.uid()::text OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (true);

-- RLS Policies for background_jobs
CREATE POLICY "System can manage background jobs"
  ON public.background_jobs FOR ALL
  USING (true);

CREATE POLICY "Admins can view background jobs"
  ON public.background_jobs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_baselines
CREATE POLICY "Admins can view performance baselines"
  ON public.performance_baselines FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage performance baselines"
  ON public.performance_baselines FOR ALL
  USING (true);

-- RLS Policies for connection_pool_stats
CREATE POLICY "Admins can view connection pool stats"
  ON public.connection_pool_stats FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert connection pool stats"
  ON public.connection_pool_stats FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_cache_entries_key ON public.cache_entries(cache_key);
CREATE INDEX idx_cache_entries_type_expires ON public.cache_entries(cache_type, expires_at);
CREATE INDEX idx_cache_entries_accessed ON public.cache_entries(last_accessed_at DESC);

CREATE INDEX idx_query_performance_hash ON public.query_performance(query_hash);
CREATE INDEX idx_query_performance_type ON public.query_performance(query_type, created_at DESC);
CREATE INDEX idx_query_performance_slow ON public.query_performance(execution_time_ms DESC) WHERE execution_time_ms > 1000;

CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, identifier_type, endpoint);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start DESC);

CREATE INDEX idx_background_jobs_status ON public.background_jobs(status, priority DESC, scheduled_at);
CREATE INDEX idx_background_jobs_type ON public.background_jobs(job_type, status);

CREATE INDEX idx_performance_baselines_metric ON public.performance_baselines(metric_name, resource_name, period_start DESC);

CREATE INDEX idx_connection_pool_stats_created ON public.connection_pool_stats(created_at DESC);

-- Triggers
CREATE TRIGGER update_cache_entries_updated_at
  BEFORE UPDATE ON public.cache_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_background_jobs_updated_at
  BEFORE UPDATE ON public.background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cache_entries
  WHERE expires_at < NOW();
END;
$$;

-- Function to reset rate limit windows
CREATE OR REPLACE FUNCTION public.reset_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rate_limits
  SET 
    current_count = 0,
    window_start = NOW()
  WHERE window_start + (window_seconds || ' seconds')::INTERVAL < NOW();
END;
$$;

-- Function to process background jobs
CREATE OR REPLACE FUNCTION public.claim_background_job(worker_id_param TEXT)
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  payload JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_job RECORD;
BEGIN
  -- Find and claim the highest priority pending job
  SELECT * INTO claimed_job
  FROM public.background_jobs
  WHERE status = 'pending'
    AND scheduled_at <= NOW()
    AND attempts < max_attempts
  ORDER BY priority DESC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Update job status
  UPDATE public.background_jobs
  SET 
    status = 'processing',
    started_at = NOW(),
    worker_id = worker_id_param,
    attempts = attempts + 1
  WHERE id = claimed_job.id;
  
  -- Return job details
  RETURN QUERY
  SELECT 
    claimed_job.id,
    claimed_job.job_type,
    claimed_job.payload;
END;
$$;