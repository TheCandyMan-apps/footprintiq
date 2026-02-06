-- Update workspaces SELECT policy to include admin bypass
DROP POLICY IF EXISTS "ws_select_owner_or_member" ON workspaces;

CREATE POLICY "ws_select_owner_or_member" ON workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR is_workspace_member(id, auth.uid())
    OR has_role(auth.uid(), 'admin'::text)
  );

-- Update email_notifications SELECT policy to include admin bypass
DROP POLICY IF EXISTS "Users can view own workspace notifications" ON email_notifications;

CREATE POLICY "Users can view own workspace notifications" ON email_notifications
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::text)
  );