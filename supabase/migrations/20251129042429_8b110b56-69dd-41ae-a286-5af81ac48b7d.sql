-- Create function to get RLS policies for a table
-- This is used by the system audit to verify RLS is properly configured

CREATE OR REPLACE FUNCTION public.pg_get_table_policies(table_name text)
RETURNS TABLE (
  policyname name,
  cmd text,
  permissive text,
  roles name[],
  qual text,
  with_check text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.policyname,
    p.cmd::text,
    p.permissive::text,
    p.roles,
    p.qual::text,
    p.with_check::text
  FROM pg_policies p
  WHERE p.tablename = table_name
    AND p.schemaname = 'public';
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.pg_get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pg_get_table_policies(text) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.pg_get_table_policies(text) IS 'Returns RLS policies for a given table name. Used by system audit to verify security configuration.';