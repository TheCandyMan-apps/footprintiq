-- Phase 18.2: Provider Benchmark & Quality Lab

-- Quality benchmark results table
CREATE TABLE public.quality_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  test_corpus_version TEXT NOT NULL DEFAULT 'v1.0',
  sample_size INTEGER NOT NULL DEFAULT 0,
  
  -- Performance metrics
  p50_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  p99_latency_ms INTEGER,
  avg_latency_ms INTEGER,
  error_rate_pct NUMERIC(5, 2),
  timeout_count INTEGER DEFAULT 0,
  
  -- Accuracy metrics
  true_positives INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  true_negatives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  precision NUMERIC(5, 2),
  recall NUMERIC(5, 2),
  f1_score NUMERIC(5, 2),
  accuracy NUMERIC(5, 2),
  
  -- Cost & reliability
  total_cost_cents INTEGER DEFAULT 0,
  circuit_breaker_trips INTEGER DEFAULT 0,
  
  -- Detailed results
  test_cases_passed INTEGER DEFAULT 0,
  test_cases_failed INTEGER DEFAULT 0,
  failure_details JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Golden test corpus table
CREATE TABLE public.quality_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_version TEXT NOT NULL DEFAULT 'v1.0',
  test_case_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('email', 'username', 'domain', 'ip', 'phone')),
  artifact_value TEXT NOT NULL,
  expected_findings JSONB NOT NULL DEFAULT '{}',
  provider_expectations JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(corpus_version, test_case_id)
);

-- Provider quality scores (aggregated view)
CREATE TABLE public.provider_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL UNIQUE,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  
  -- 7-day averages
  avg_f1_score_7d NUMERIC(5, 2),
  avg_p95_latency_7d INTEGER,
  avg_error_rate_7d NUMERIC(5, 2),
  
  -- 30-day averages
  avg_f1_score_30d NUMERIC(5, 2),
  avg_p95_latency_30d INTEGER,
  avg_error_rate_30d NUMERIC(5, 2),
  
  -- Overall rank
  quality_rank INTEGER,
  reliability_rank INTEGER,
  speed_rank INTEGER,
  
  -- Status flags
  is_degraded BOOLEAN DEFAULT false,
  degradation_reason TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_quality_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quality_results
CREATE POLICY "Admins can view all quality results"
  ON public.quality_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert quality results"
  ON public.quality_results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for quality_corpus
CREATE POLICY "Admins can manage quality corpus"
  ON public.quality_corpus FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for provider_quality_scores
CREATE POLICY "Anyone can view quality scores"
  ON public.provider_quality_scores FOR SELECT
  USING (true);

CREATE POLICY "System can update quality scores"
  ON public.provider_quality_scores FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_quality_results_provider_run ON public.quality_results(provider_id, run_at DESC);
CREATE INDEX idx_quality_results_run_at ON public.quality_results(run_at DESC);
CREATE INDEX idx_quality_corpus_active ON public.quality_corpus(is_active) WHERE is_active = true;
CREATE INDEX idx_quality_corpus_artifact_type ON public.quality_corpus(artifact_type);

-- Trigger to update updated_at
CREATE TRIGGER update_quality_corpus_updated_at
  BEFORE UPDATE ON public.quality_corpus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_provider_quality_scores_updated_at
  BEFORE UPDATE ON public.provider_quality_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();