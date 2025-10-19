-- Create cases table for investigation management
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create case_evidence table
CREATE TABLE public.case_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('screenshot', 'document', 'link', 'data_source', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_notes table
CREATE TABLE public.case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring_schedules table
CREATE TABLE public.monitoring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_email TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring_alerts table
CREATE TABLE public.monitoring_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_id UUID REFERENCES public.monitoring_schedules(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('new_exposure', 'risk_increase', 'data_breach', 'profile_change')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Cases policies
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = user_id);

-- Case evidence policies
CREATE POLICY "Users can view evidence from own cases"
  ON public.case_evidence FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_evidence.case_id
    AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can add evidence to own cases"
  ON public.case_evidence FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_evidence.case_id
    AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete evidence from own cases"
  ON public.case_evidence FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_evidence.case_id
    AND cases.user_id = auth.uid()
  ));

-- Case notes policies
CREATE POLICY "Users can view notes from own cases"
  ON public.case_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_notes.case_id
    AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can add notes to own cases"
  ON public.case_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_notes.case_id
    AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own notes"
  ON public.case_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.case_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Monitoring schedules policies
CREATE POLICY "Users can view own monitoring schedules"
  ON public.monitoring_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monitoring schedules"
  ON public.monitoring_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitoring schedules"
  ON public.monitoring_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitoring schedules"
  ON public.monitoring_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Monitoring alerts policies
CREATE POLICY "Users can view own alerts"
  ON public.monitoring_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.monitoring_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.monitoring_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_case_notes_updated_at
  BEFORE UPDATE ON public.case_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_monitoring_schedules_updated_at
  BEFORE UPDATE ON public.monitoring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();