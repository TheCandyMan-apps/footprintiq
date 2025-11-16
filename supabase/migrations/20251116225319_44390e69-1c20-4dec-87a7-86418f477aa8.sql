-- Allow workspace members to insert dark web monitoring targets (not just admins)
DROP POLICY IF EXISTS "Workspace admins can manage targets" ON darkweb_targets;

-- Create new policy allowing workspace members to insert and manage their own workspace targets
CREATE POLICY "Workspace members can manage targets"
ON darkweb_targets
FOR ALL
TO public
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);