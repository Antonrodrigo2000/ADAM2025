-- Project ID-based environment detection for bulletproof environment detection
-- This approach uses your actual Supabase project references to determine environment

-- Create table to store project environment mappings
CREATE TABLE IF NOT EXISTS project_environment_config (
  id SERIAL PRIMARY KEY,
  project_ref TEXT UNIQUE NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('dev', 'prod')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to get current project reference from Supabase
CREATE OR REPLACE FUNCTION get_current_project_ref() RETURNS TEXT AS $$
BEGIN
  -- Try to get project reference from various Supabase system settings
  -- This works by checking the database host or connection string patterns
  RETURN CASE
    -- Extract project ref from connection info if available
    WHEN current_setting('cluster_name', true) IS NOT NULL 
      THEN current_setting('cluster_name', true)
    -- Fallback: try to extract from connection host patterns
    WHEN inet_server_addr()::text ~ '^.*\.supabase\.co$'
      THEN split_part(inet_server_addr()::text, '.', 1)
    -- Another fallback: check for project patterns in current_database
    WHEN current_database() ~ '^[a-z0-9]{20}$'
      THEN current_database()
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql;

-- Updated environment detection function using project ID
CREATE OR REPLACE FUNCTION get_env_genie_id_v2(
  product_key TEXT,
  dev_id TEXT DEFAULT NULL,
  prod_id TEXT DEFAULT NULL,
  dev_project_ref TEXT DEFAULT NULL,
  prod_project_ref TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  current_env TEXT;
  current_project TEXT;
BEGIN
  -- Method 1: Check if environment is explicitly set in config table
  SELECT environment INTO current_env 
  FROM project_environment_config 
  WHERE project_ref = get_current_project_ref()
  LIMIT 1;
  
  -- Method 2: If no config table entry, check direct project ref match
  IF current_env IS NULL AND dev_project_ref IS NOT NULL AND prod_project_ref IS NOT NULL THEN
    current_project := get_current_project_ref();
    current_env := CASE
      WHEN current_project = dev_project_ref THEN 'dev'
      WHEN current_project = prod_project_ref THEN 'prod'
      ELSE NULL
    END;
  END IF;
  
  -- Method 3: Fallback to old detection method
  IF current_env IS NULL THEN
    BEGIN
      current_env := current_setting('app.environment');
    EXCEPTION
      WHEN undefined_object THEN
        current_env := 'dev'; -- Default fallback
    END;
  END IF;
  
  -- Return appropriate ID based on environment
  RETURN CASE 
    WHEN current_env = 'dev' THEN COALESCE(dev_id, product_key || '_dev')
    ELSE COALESCE(prod_id, product_key || '_prod')
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function to register project environment
CREATE OR REPLACE FUNCTION register_project_environment(
  project_ref_param TEXT,
  environment_param TEXT,
  description_param TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO project_environment_config (project_ref, environment, description)
  VALUES (project_ref_param, environment_param, description_param)
  ON CONFLICT (project_ref) 
  DO UPDATE SET 
    environment = EXCLUDED.environment,
    description = EXCLUDED.description,
    updated_at = NOW();
  
  RAISE NOTICE 'Registered project % as % environment', project_ref_param, environment_param;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-detect and register current project
CREATE OR REPLACE FUNCTION auto_register_current_project() RETURNS TEXT AS $$
DECLARE
  current_project TEXT;
  detected_env TEXT;
BEGIN
  current_project := get_current_project_ref();
  
  IF current_project IS NULL THEN
    RAISE WARNING 'Could not detect current project reference. Manual registration required.';
    RETURN 'unknown';
  END IF;
  
  -- Check if already registered
  SELECT environment INTO detected_env 
  FROM project_environment_config 
  WHERE project_ref = current_project;
  
  IF detected_env IS NOT NULL THEN
    RAISE NOTICE 'Project % already registered as % environment', current_project, detected_env;
    RETURN detected_env;
  END IF;
  
  -- Auto-register as dev (safer default)
  PERFORM register_project_environment(
    current_project, 
    'dev', 
    'Auto-registered during migration'
  );
  
  RAISE WARNING 'Project % auto-registered as DEV. If this is PROD, run: SELECT register_project_environment(''%'', ''prod'', ''Production environment'');', 
    current_project, current_project;
  
  RETURN 'dev';
END;
$$ LANGUAGE plpgsql;

-- Auto-register current project
SELECT auto_register_current_project() as registration_result;

-- Display current project info
SELECT 
  get_current_project_ref() as current_project_ref,
  COALESCE(
    (SELECT environment FROM project_environment_config WHERE project_ref = get_current_project_ref()),
    'not_registered'
  ) as detected_environment;