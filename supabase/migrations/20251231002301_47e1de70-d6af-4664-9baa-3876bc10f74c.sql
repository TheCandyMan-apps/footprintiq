-- Add email tracking columns for Resend webhook events
ALTER TABLE public.email_notifications 
  ADD COLUMN IF NOT EXISTS resend_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subject TEXT;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON public.email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_resend_id ON public.email_notifications(resend_id);

-- Comment on columns for documentation
COMMENT ON COLUMN public.email_notifications.resend_id IS 'Resend API message ID for tracking';
COMMENT ON COLUMN public.email_notifications.delivered_at IS 'Timestamp when email was delivered (from Resend webhook)';
COMMENT ON COLUMN public.email_notifications.opened_at IS 'Timestamp when email was first opened (from Resend webhook)';
COMMENT ON COLUMN public.email_notifications.clicked_at IS 'Timestamp when email link was first clicked (from Resend webhook)';
COMMENT ON COLUMN public.email_notifications.bounced_at IS 'Timestamp when email bounced (from Resend webhook)';