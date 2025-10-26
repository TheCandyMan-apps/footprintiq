-- Phase 16: Adaptive Intelligence, Magic Explain, Timeline 2.0, Foundation tables

-- ============================================
-- 1) ADAPTIVE INTELLIGENCE
-- ============================================

-- Entity co-occurrence tracking (for predictions)
CREATE TABLE IF NOT EXISTS public.entity_cooccurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_a TEXT NOT NULL,
  entity_b TEXT NOT NULL,
  cooccurrence_count INTEGER DEFAULT 1,
  confidence NUMERIC(3,2) DEFAULT 0.0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_a, entity_b)
);

CREATE INDEX idx_cooccur_entity_a ON public.entity_cooccurrences(entity_a);
CREATE INDEX idx_cooccur_entity_b ON public.entity_cooccurrences(entity_b);

-- Adaptive prediction cache
CREATE TABLE IF NOT EXISTS public.entity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed_entities TEXT[] NOT NULL,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_suggestions_user ON public.entity_suggestions(user_id);
CREATE INDEX idx_suggestions_expires ON public.entity_suggestions(expires_at);

-- ============================================
-- 2) SMART WATCHLISTS (foundation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.watchlist_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entity_nodes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by TEXT DEFAULT 'system',
  UNIQUE(watchlist_id, entity_id)
);

CREATE INDEX idx_watchlists_workspace ON public.watchlists(workspace_id);
CREATE INDEX idx_watchlists_user ON public.watchlists(user_id);
CREATE INDEX idx_watchlist_members_watchlist ON public.watchlist_members(watchlist_id);
CREATE INDEX idx_watchlist_members_entity ON public.watchlist_members(entity_id);

-- ============================================
-- 3) COLLABORATION (foundation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.case_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.case_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

CREATE INDEX idx_case_comments_case ON public.case_comments(case_id);
CREATE INDEX idx_case_comments_user ON public.case_comments(user_id);

-- ============================================
-- 4) EXPLANATION CACHE (Magic Explain)
-- ============================================

CREATE TABLE IF NOT EXISTS public.explanation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_hash TEXT NOT NULL UNIQUE,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE INDEX idx_explanation_expires ON public.explanation_cache(expires_at);

-- ============================================
-- 5) ANALYST METRICS (Scoreboard foundation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.analyst_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  scans_completed INTEGER DEFAULT 0,
  findings_verified INTEGER DEFAULT 0,
  false_positives_flagged INTEGER DEFAULT 0,
  avg_resolution_time_ms BIGINT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analyst_metrics_user ON public.analyst_metrics(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Entity suggestions
ALTER TABLE public.entity_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON public.entity_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suggestions"
  ON public.entity_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Watchlists
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlists"
  ON public.watchlists FOR ALL
  USING (auth.uid() = user_id);

-- Watchlist members
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view watchlist members"
  ON public.watchlist_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.watchlists 
    WHERE watchlists.id = watchlist_members.watchlist_id 
    AND watchlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage watchlist members"
  ON public.watchlist_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.watchlists 
    WHERE watchlists.id = watchlist_members.watchlist_id 
    AND watchlists.user_id = auth.uid()
  ));

-- Case comments
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case comments"
  ON public.case_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id = case_comments.case_id 
    AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create case comments"
  ON public.case_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = case_comments.case_id 
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.case_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.case_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Comment reactions
ALTER TABLE public.case_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
  ON public.case_comment_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.case_comments cc
    JOIN public.cases c ON c.id = cc.case_id
    WHERE cc.id = case_comment_reactions.comment_id
    AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own reactions"
  ON public.case_comment_reactions FOR ALL
  USING (auth.uid() = user_id);

-- Analyst metrics
ALTER TABLE public.analyst_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all analyst metrics"
  ON public.analyst_metrics FOR SELECT
  USING (true);

CREATE POLICY "System can update analyst metrics"
  ON public.analyst_metrics FOR ALL
  USING (true);

-- Explanation cache (public read for efficiency)
ALTER TABLE public.explanation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached explanations"
  ON public.explanation_cache FOR SELECT
  USING (true);

CREATE POLICY "System can manage explanation cache"
  ON public.explanation_cache FOR ALL
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update watchlist timestamp
CREATE OR REPLACE FUNCTION update_watchlist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watchlist_updated
  BEFORE UPDATE ON public.watchlists
  FOR EACH ROW
  EXECUTE FUNCTION update_watchlist_timestamp();

-- Auto-update comment timestamp
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_updated
  BEFORE UPDATE ON public.case_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_timestamp();