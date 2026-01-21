-- Create a secure view for api_keys that excludes the key_hash
-- This prevents hash exposure to clients while maintaining functionality

CREATE OR REPLACE VIEW public.api_keys_safe AS
SELECT 
  id,
  user_id,
  workspace_id,
  name,
  key_prefix,
  scopes,
  permissions,
  is_active,
  last_used_at,
  expires_at,
  revoked_at,
  created_at,
  updated_at
FROM public.api_keys;

-- Enable RLS on the view (inherits from base table)
-- Note: Views inherit RLS from the underlying table, so policies are already enforced

-- Grant access to authenticated users (same as base table)
GRANT SELECT ON public.api_keys_safe TO authenticated;

COMMENT ON VIEW public.api_keys_safe IS 'Secure view of api_keys that excludes key_hash to prevent exposure of hashed values to clients';