-- Add workspace_id column to existing ai_logs table
ALTER TABLE public.ai_logs 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Add index for workspace_id
CREATE INDEX IF NOT EXISTS idx_ai_logs_workspace_id ON public.ai_logs(workspace_id);

-- Drop existing RLS policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view their own AI logs" ON public.ai_logs;
DROP POLICY IF EXISTS "System can insert AI logs" ON public.ai_logs;

-- RLS Policy: Users can view their own logs or workspace logs
CREATE POLICY "Users can view their own AI logs"
  ON public.ai_logs
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: System can insert logs (service role)
CREATE POLICY "System can insert AI logs"
  ON public.ai_logs
  FOR INSERT
  WITH CHECK (true);