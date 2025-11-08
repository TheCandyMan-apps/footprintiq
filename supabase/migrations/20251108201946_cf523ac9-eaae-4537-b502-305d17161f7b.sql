-- Function to automatically add workspace owner as admin member
CREATE OR REPLACE FUNCTION public.add_owner_as_workspace_member()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert owner as admin member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at)
  VALUES (NEW.id, NEW.owner_id, 'admin', NOW())
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after workspace insert
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.add_owner_as_workspace_member();

-- Backfill: Add all workspace owners as admin members where missing
INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at)
SELECT 
  w.id as workspace_id,
  w.owner_id as user_id,
  'admin' as role,
  NOW() as created_at
FROM public.workspaces w
LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id AND w.owner_id = wm.user_id
WHERE wm.id IS NULL
ON CONFLICT (workspace_id, user_id) DO NOTHING;