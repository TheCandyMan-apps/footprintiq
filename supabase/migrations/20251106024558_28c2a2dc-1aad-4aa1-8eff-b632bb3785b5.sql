-- User entitlements for Maigret scan plans
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'premium')) DEFAULT 'standard',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan jobs tracking
CREATE TABLE IF NOT EXISTS public.scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'maigret',
  username TEXT NOT NULL,
  tags TEXT,
  all_sites BOOLEAN DEFAULT FALSE,
  artifacts TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'finished', 'error', 'canceled')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan TEXT NOT NULL DEFAULT 'standard'
);

CREATE INDEX IF NOT EXISTS scan_jobs_idx ON public.scan_jobs (requested_by, created_at DESC);

-- Raw NDJSON scan results
CREATE TABLE IF NOT EXISTS public.scan_results (
  job_id UUID REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  line_no INT NOT NULL,
  ndjson JSONB NOT NULL,
  PRIMARY KEY (job_id, line_no)
);

-- Normalized findings per site
CREATE TABLE IF NOT EXISTS public.scan_findings (
  job_id UUID REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  url TEXT,
  status TEXT,
  raw JSONB,
  PRIMARY KEY (job_id, site)
);

-- Cache for username/site combinations
CREATE TABLE IF NOT EXISTS public.username_site_cache (
  username TEXT NOT NULL,
  site TEXT NOT NULL,
  last_status TEXT,
  last_url TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  raw JSONB,
  PRIMARY KEY (username, site)
);

-- Enable RLS
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.username_site_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_entitlements
CREATE POLICY "Users can view own entitlements" ON public.user_entitlements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entitlements" ON public.user_entitlements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entitlements" ON public.user_entitlements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for scan_jobs
CREATE POLICY "Users can view own scan jobs" ON public.scan_jobs
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can insert scan jobs" ON public.scan_jobs
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can update own scan jobs" ON public.scan_jobs
  FOR UPDATE USING (auth.uid() = requested_by);

-- RLS Policies for scan_results
CREATE POLICY "Users can view own scan results" ON public.scan_results
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.scan_jobs j 
      WHERE j.id = job_id AND j.requested_by = auth.uid()
    )
  );

-- RLS Policies for scan_findings
CREATE POLICY "Users can view own scan findings" ON public.scan_findings
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.scan_jobs j 
      WHERE j.id = job_id AND j.requested_by = auth.uid()
    )
  );

-- RLS Policies for username_site_cache
CREATE POLICY "Anyone can view username site cache" ON public.username_site_cache
  FOR SELECT USING (true);