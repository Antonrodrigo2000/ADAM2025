-- Example of registering your actual project IDs
-- Replace with your actual Supabase project references

-- Method 1: Register projects manually (recommended)
-- Replace 'your-dev-project-ref' and 'your-prod-project-ref' with actual values

-- Example registrations (replace with your actual project refs):
-- SELECT register_project_environment('abcdefghijklmnopqrst', 'dev', 'Development environment');
-- SELECT register_project_environment('zyxwvutsrqponmlkjihg', 'prod', 'Production environment');

-- Method 2: Check current project and register if needed
-- This will show you the current project reference
SELECT 
  get_current_project_ref() as current_project_ref,
  'Run this to register as prod: SELECT register_project_environment(''' || 
  get_current_project_ref() || 
  ''', ''prod'', ''Production environment'');' as register_as_prod_command
WHERE get_current_project_ref() IS NOT NULL;

-- Method 3: Bulk register multiple projects at once
-- Uncomment and modify as needed:
/*
SELECT register_project_environment('your-dev-project-ref-here', 'dev', 'Development environment');
SELECT register_project_environment('your-prod-project-ref-here', 'prod', 'Production environment');
*/

-- View all registered projects
SELECT 
  project_ref,
  environment,
  description,
  created_at
FROM project_environment_config
ORDER BY environment, created_at;