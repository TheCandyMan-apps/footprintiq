-- Revert the vector extension move that caused build errors
-- The vector extension needs to stay in public schema for compatibility
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;