-- Phase 24: Advanced Analytics & Business Intelligence

-- Custom Reports Table
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'executive', 'detailed', 'comparison', 'custom'
  config JSONB NOT NULL DEFAULT '{}', -- Report configuration (metrics, filters, layout)
  schedule TEXT, -- Cron expression for scheduled reports
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom Metrics Table
CREATE TABLE IF NOT EXISTS public.custom_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL, -- 'count', 'sum', 'avg', 'ratio', 'formula'
  calculation JSONB NOT NULL, -- Formula or aggregation definition
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Snapshots Table (for historical tracking)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- All calculated metrics for this date
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Exports Table
CREATE TABLE IF NOT EXISTS public.report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_id UUID REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  format TEXT NOT NULL, -- 'pdf', 'excel', 'csv'
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Data Warehouse Connectors Table
CREATE TABLE IF NOT EXISTS public.warehouse_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  connector_type TEXT NOT NULL, -- 'bigquery', 'snowflake', 's3', 'redshift'
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- Connection credentials (encrypted)
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Predictive Models Table
CREATE TABLE IF NOT EXISTS public.predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_type TEXT NOT NULL, -- 'risk_forecast', 'trend_prediction', 'anomaly'
  model_data JSONB NOT NULL, -- Trained model parameters
  accuracy_score NUMERIC,
  last_trained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own reports"
  ON public.custom_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.custom_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.custom_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.custom_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for custom_metrics
CREATE POLICY "Users can view their own metrics"
  ON public.custom_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON public.custom_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.custom_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON public.custom_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view their own snapshots"
  ON public.analytics_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snapshots"
  ON public.analytics_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for report_exports
CREATE POLICY "Users can view their own exports"
  ON public.report_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
  ON public.report_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for warehouse_connectors
CREATE POLICY "Users can view their own connectors"
  ON public.warehouse_connectors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connectors"
  ON public.warehouse_connectors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connectors"
  ON public.warehouse_connectors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connectors"
  ON public.warehouse_connectors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for predictive_models
CREATE POLICY "Users can view their own models"
  ON public.predictive_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own models"
  ON public.predictive_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_custom_reports_user_id ON public.custom_reports(user_id);
CREATE INDEX idx_custom_reports_workspace_id ON public.custom_reports(workspace_id);
CREATE INDEX idx_custom_metrics_user_id ON public.custom_metrics(user_id);
CREATE INDEX idx_analytics_snapshots_user_id_date ON public.analytics_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_report_exports_user_id ON public.report_exports(user_id);
CREATE INDEX idx_warehouse_connectors_user_id ON public.warehouse_connectors(user_id);
CREATE INDEX idx_predictive_models_user_id ON public.predictive_models(user_id);

-- Triggers
CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_custom_metrics_updated_at
  BEFORE UPDATE ON public.custom_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_warehouse_connectors_updated_at
  BEFORE UPDATE ON public.warehouse_connectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();