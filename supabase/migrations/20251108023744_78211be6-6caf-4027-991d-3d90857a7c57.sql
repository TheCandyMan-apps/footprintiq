-- Create bugs table for user-reported issues
CREATE TABLE IF NOT EXISTS public.bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  error_stack TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- Users can create their own bug reports
CREATE POLICY "Users can submit bug reports"
  ON public.bugs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own bug reports
CREATE POLICY "Users can view their bug reports"
  ON public.bugs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all bug reports
CREATE POLICY "Admins can view all bugs"
  ON public.bugs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update bug status
CREATE POLICY "Admins can update bugs"
  ON public.bugs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bugs_user_id ON public.bugs(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON public.bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_created_at ON public.bugs(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();