-- Agent configurations and execution logs
CREATE TABLE IF NOT EXISTS public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- 'trend', 'summary', 'data_qa', 'custom'
  description TEXT,
  schedule TEXT, -- cron expression
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agent_configs(id) ON DELETE CASCADE,
  user_id UUID,
  workspace_id UUID,
  query TEXT,
  result JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'approval_required'
  error_message TEXT,
  runtime_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.agent_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agent_configs(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{"read": true, "write": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.graph_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID,
  natural_language_query TEXT NOT NULL,
  generated_query TEXT, -- SQL or Cypher
  result_summary JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intel_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID,
  agent_run_id UUID REFERENCES public.agent_runs(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  topic TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_agent_runs_agent_id ON public.agent_runs(agent_id);
CREATE INDEX idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX idx_graph_queries_user_id ON public.graph_queries(user_id);
CREATE INDEX idx_intel_cards_user_id ON public.intel_cards(user_id);
CREATE INDEX idx_intel_cards_tags ON public.intel_cards USING GIN(tags);

-- RLS Policies
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_cards ENABLE ROW LEVEL SECURITY;

-- Agent configs: users can manage their own
CREATE POLICY "Users can manage own agent configs" ON public.agent_configs
  FOR ALL USING (auth.uid() = created_by);

-- Agent runs: users can view their own
CREATE POLICY "Users can view own agent runs" ON public.agent_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert agent runs" ON public.agent_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own agent runs" ON public.agent_runs
  FOR UPDATE USING (auth.uid() = user_id);

-- Agent API keys: only agent owners can view
CREATE POLICY "Agent owners can view API keys" ON public.agent_api_keys
  FOR SELECT USING (
    agent_id IN (SELECT id FROM public.agent_configs WHERE created_by = auth.uid())
  );

-- Graph queries: users can view own
CREATE POLICY "Users can manage own graph queries" ON public.graph_queries
  FOR ALL USING (auth.uid() = user_id);

-- Intel cards: users can manage own
CREATE POLICY "Users can manage own intel cards" ON public.intel_cards
  FOR ALL USING (auth.uid() = user_id);