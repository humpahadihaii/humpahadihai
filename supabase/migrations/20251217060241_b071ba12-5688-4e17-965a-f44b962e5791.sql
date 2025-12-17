-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Move vector (pgvector) extension to extensions schema  
ALTER EXTENSION vector SET SCHEMA extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;