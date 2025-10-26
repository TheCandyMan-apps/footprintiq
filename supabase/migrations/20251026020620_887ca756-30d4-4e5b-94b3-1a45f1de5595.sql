-- Entity Nodes Table
CREATE TABLE IF NOT EXISTS public.entity_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('email', 'username', 'domain', 'phone', 'ip', 'person')),
  entity_value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  risk_score NUMERIC(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence_score NUMERIC(5,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  provider_count INTEGER DEFAULT 0,
  finding_count INTEGER DEFAULT 0,
  severity_breakdown JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}'::jsonb,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_value)
);

-- Entity Edges Table
CREATE TABLE IF NOT EXISTS public.entity_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_node_id UUID NOT NULL REFERENCES public.entity_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.entity_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  confidence NUMERIC(5,2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  providers JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_node_id, target_node_id, relationship_type)
);

-- Graph Snapshots Table for export/versioning
CREATE TABLE IF NOT EXISTS public.graph_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  graph_data JSONB NOT NULL,
  node_count INTEGER DEFAULT 0,
  edge_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entity_nodes_user_type ON public.entity_nodes(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_nodes_value ON public.entity_nodes(entity_value);
CREATE INDEX IF NOT EXISTS idx_entity_edges_source ON public.entity_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_entity_edges_target ON public.entity_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_snapshots_user ON public.graph_snapshots(user_id);

-- Enable RLS
ALTER TABLE public.entity_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entity_nodes
CREATE POLICY "Users can view own entity nodes"
  ON public.entity_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entity nodes"
  ON public.entity_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entity nodes"
  ON public.entity_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entity nodes"
  ON public.entity_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for entity_edges
CREATE POLICY "Users can view own entity edges"
  ON public.entity_edges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entity edges"
  ON public.entity_edges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entity edges"
  ON public.entity_edges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entity edges"
  ON public.entity_edges FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for graph_snapshots
CREATE POLICY "Users can view own graph snapshots"
  ON public.graph_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own graph snapshots"
  ON public.graph_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own graph snapshots"
  ON public.graph_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update entity node timestamps
CREATE OR REPLACE FUNCTION public.update_entity_node_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

-- Trigger for entity_nodes
CREATE TRIGGER update_entity_nodes_timestamp
  BEFORE UPDATE ON public.entity_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_entity_node_timestamp();