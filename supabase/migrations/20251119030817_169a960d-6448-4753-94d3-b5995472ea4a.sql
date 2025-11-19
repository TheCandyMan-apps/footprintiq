-- Drop incomplete tables from failed migrations
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.system_errors CASCADE;

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'billing', 'data', 'feature', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ticket_number TEXT UNIQUE,
  assigned_to UUID,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support messages table
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System errors log
CREATE TABLE public.system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  function_name TEXT,
  workspace_id UUID,
  user_id UUID,
  scan_id UUID,
  provider TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warn', 'error', 'critical')),
  stack_trace TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_workspace ON public.support_tickets(workspace_id);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_created ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_messages_ticket ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_created ON public.support_messages(created_at DESC);
CREATE INDEX idx_system_errors_created ON public.system_errors(created_at DESC);
CREATE INDEX idx_system_errors_function ON public.system_errors(function_name);
CREATE INDEX idx_system_errors_severity ON public.system_errors(severity);

-- Ticket number generation
CREATE FUNCTION public.generate_support_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_number TEXT;
  counter INT := 0;
BEGIN
  LOOP
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.support_tickets WHERE ticket_number = new_number);
    counter := counter + 1;
    IF counter > 100 THEN RAISE EXCEPTION 'Could not generate unique ticket number'; END IF;
  END LOOP;
  RETURN new_number;
END;
$$;

CREATE FUNCTION public.set_support_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_support_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_support_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_support_ticket_number();

CREATE FUNCTION public.update_support_ticket_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_ticket_timestamp();

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_tickets_user_select ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY support_tickets_user_insert ON public.support_tickets FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY support_tickets_user_update ON public.support_tickets FOR UPDATE
  USING (user_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY support_tickets_admin_all ON public.support_tickets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY support_messages_user_select ON public.support_messages FOR SELECT
  USING (NOT is_internal AND ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid() OR created_by = auth.uid()));

CREATE POLICY support_messages_user_insert ON public.support_messages FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY support_messages_admin_all ON public.support_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY system_errors_admin_select ON public.system_errors FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY system_errors_service_insert ON public.system_errors FOR INSERT WITH CHECK (true);

-- Error logging function
CREATE FUNCTION public.log_system_error(
  p_error_code TEXT,
  p_error_message TEXT,
  p_function_name TEXT DEFAULT NULL,
  p_workspace_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_scan_id UUID DEFAULT NULL,
  p_provider TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'error',
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_error_id UUID;
BEGIN
  INSERT INTO public.system_errors (
    error_code, error_message, function_name, workspace_id,
    user_id, scan_id, provider, severity, metadata
  ) VALUES (
    p_error_code, p_error_message, p_function_name, p_workspace_id,
    p_user_id, p_scan_id, p_provider, p_severity, p_metadata
  ) RETURNING id INTO v_error_id;
  RETURN v_error_id;
END;
$$;