-- Create extensions schema for security best practices
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move existing extensions to dedicated schema
-- Note: Only move extensions that support SET SCHEMA
-- Some extensions like pg_graphql cannot be moved
DO $$
BEGIN
  -- Move pg_stat_statements if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
  END IF;
  
  -- Move pgcrypto if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
  
  -- Move uuid-ossp if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
  
  -- Move pgsodium if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgsodium') THEN
    ALTER EXTENSION pgsodium SET SCHEMA extensions;
  END IF;
  
  -- Skip pg_graphql - does not support SET SCHEMA
  
  -- Move pg_stat_monitor if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_monitor') THEN
    ALTER EXTENSION pg_stat_monitor SET SCHEMA extensions;
  END IF;
END $$;

-- Grant usage on extensions schema to all roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Add comment for documentation
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security posture (excludes extensions that do not support SET SCHEMA)';