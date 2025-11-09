-- Create email_notifications table for tracking low credit alerts
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_workspace 
  ON public.email_notifications(workspace_id, type, sent_at DESC);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workspace notifications
CREATE POLICY "Users can view own workspace notifications"
  ON public.email_notifications
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy: Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON public.email_notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE public.email_notifications IS 'Tracks automated email notifications sent to users';
