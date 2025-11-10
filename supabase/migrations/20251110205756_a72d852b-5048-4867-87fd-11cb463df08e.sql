-- Table: maigret_profile_snapshots
-- Stores historical snapshots of Maigret scan results for change tracking
CREATE TABLE IF NOT EXISTS public.maigret_profile_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  site TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL, -- 'found', 'not_found', 'error'
  confidence NUMERIC,
  raw_data JSONB,
  scan_id UUID,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_snapshot UNIQUE(username, site, created_at)
);

-- Index for fast lookups by username and workspace
CREATE INDEX idx_maigret_snapshots_username ON public.maigret_profile_snapshots(username, workspace_id);
CREATE INDEX idx_maigret_snapshots_site ON public.maigret_profile_snapshots(site);
CREATE INDEX idx_maigret_snapshots_created_at ON public.maigret_profile_snapshots(created_at DESC);

-- Table: maigret_monitored_usernames
-- Tracks which usernames users want to monitor for changes
CREATE TABLE IF NOT EXISTS public.maigret_monitored_usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alerts_enabled BOOLEAN DEFAULT true,
  alert_email TEXT,
  check_frequency_hours INTEGER DEFAULT 24, -- How often to check for changes
  last_checked_at TIMESTAMPTZ,
  sites_filter TEXT[], -- Optional: only monitor specific sites
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_monitored_username UNIQUE(username, workspace_id)
);

-- Index for efficient monitoring queries
CREATE INDEX idx_monitored_usernames_workspace ON public.maigret_monitored_usernames(workspace_id);
CREATE INDEX idx_monitored_usernames_last_checked ON public.maigret_monitored_usernames(last_checked_at);

-- Table: maigret_profile_changes
-- Records detected changes in profiles
CREATE TABLE IF NOT EXISTS public.maigret_profile_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  site TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'created', 'deleted', 'modified', 'status_changed'
  old_snapshot_id UUID REFERENCES public.maigret_profile_snapshots(id),
  new_snapshot_id UUID REFERENCES public.maigret_profile_snapshots(id),
  change_details JSONB, -- Details about what changed
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT now(),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ
);

-- Index for change history queries
CREATE INDEX idx_maigret_changes_username ON public.maigret_profile_changes(username, workspace_id);
CREATE INDEX idx_maigret_changes_detected_at ON public.maigret_profile_changes(detected_at DESC);
CREATE INDEX idx_maigret_changes_email_sent ON public.maigret_profile_changes(email_sent) WHERE email_sent = false;

-- RLS Policies
ALTER TABLE public.maigret_profile_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maigret_monitored_usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maigret_profile_changes ENABLE ROW LEVEL SECURITY;

-- Snapshots: Users can view snapshots for their workspace
CREATE POLICY "Users can view snapshots in their workspace"
  ON public.maigret_profile_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = maigret_profile_snapshots.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Snapshots: Service role can insert snapshots
CREATE POLICY "Service role can insert snapshots"
  ON public.maigret_profile_snapshots
  FOR INSERT
  WITH CHECK (true);

-- Monitored usernames: Users can manage monitored usernames in their workspace
CREATE POLICY "Users can view monitored usernames in their workspace"
  ON public.maigret_monitored_usernames
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = maigret_monitored_usernames.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert monitored usernames in their workspace"
  ON public.maigret_monitored_usernames
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = maigret_monitored_usernames.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their monitored usernames"
  ON public.maigret_monitored_usernames
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their monitored usernames"
  ON public.maigret_monitored_usernames
  FOR DELETE
  USING (user_id = auth.uid());

-- Changes: Users can view changes in their workspace
CREATE POLICY "Users can view changes in their workspace"
  ON public.maigret_profile_changes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = maigret_profile_changes.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Changes: Service role can insert changes
CREATE POLICY "Service role can insert changes"
  ON public.maigret_profile_changes
  FOR INSERT
  WITH CHECK (true);

-- Changes: Service role can update email_sent status
CREATE POLICY "Service role can update changes"
  ON public.maigret_profile_changes
  FOR UPDATE
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_maigret_monitored_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_maigret_monitored_updated_at
  BEFORE UPDATE ON public.maigret_monitored_usernames
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maigret_monitored_timestamp();