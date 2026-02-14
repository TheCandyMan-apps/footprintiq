
-- Table for tracking exposure resolution statuses
CREATE TABLE public.exposure_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  finding_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'in_progress', 'ignored')),
  previous_status TEXT,
  score_before INTEGER,
  score_after INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, finding_id)
);

-- History table for Pro users - tracks all status changes
CREATE TABLE public.exposure_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  finding_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  score_change INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exposure_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exposure_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for exposure_statuses
CREATE POLICY "Users can view their own exposure statuses"
ON public.exposure_statuses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exposure statuses"
ON public.exposure_statuses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exposure statuses"
ON public.exposure_statuses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exposure statuses"
ON public.exposure_statuses FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for exposure_status_history
CREATE POLICY "Users can view their own status history"
ON public.exposure_status_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own status history"
ON public.exposure_status_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_exposure_statuses_updated_at
BEFORE UPDATE ON public.exposure_statuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
