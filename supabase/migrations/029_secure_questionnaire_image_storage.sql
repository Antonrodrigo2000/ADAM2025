-- Migration: Medical Questionnaire Image Storage Functions
-- This migration creates database functions for image migration and cleanup.
-- 
-- NOTE: RLS policies for storage.objects must be created manually in Supabase Dashboard
-- due to permission restrictions. See setup instructions below.

-- RLS POLICIES TO CREATE MANUALLY IN SUPABASE DASHBOARD:
-- Go to Storage > Policies and create these policies for storage.objects:
--
-- Policy 1: Upload Policy
-- CREATE POLICY "Allow questionnaire image uploads" ON storage.objects
-- FOR INSERT TO anon, authenticated
-- WITH CHECK (
--   bucket_id = 'medical-questionnaire-uploads' AND 
--   (
--     ((storage.foldername(name))[1] = auth.uid()::text) OR
--     ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon')
--   )
-- );
--
-- Policy 2: Download Policy  
-- CREATE POLICY "Allow questionnaire image downloads" ON storage.objects
-- FOR SELECT TO anon, authenticated, service_role
-- USING (
--   bucket_id = 'medical-questionnaire-uploads' AND 
--   (
--     ((storage.foldername(name))[1] = auth.uid()::text) OR 
--     ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
--     (auth.role() = 'service_role')
--   )
-- );
--
-- Policy 3: Delete Policy
-- CREATE POLICY "Allow questionnaire image deletion" ON storage.objects
-- FOR DELETE TO anon, authenticated, service_role
-- USING (
--   bucket_id = 'medical-questionnaire-uploads' AND 
--   (
--     ((storage.foldername(name))[1] = auth.uid()::text) OR
--     ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
--     (auth.role() = 'service_role')
--   )
-- );
--
-- Policy 4: Service Role Policy
-- CREATE POLICY "Service role can access all questionnaire images" ON storage.objects
-- FOR ALL TO service_role
-- USING (bucket_id = 'medical-questionnaire-uploads')
-- WITH CHECK (bucket_id = 'medical-questionnaire-uploads');

-- DATABASE FUNCTIONS (these will be created by this migration):

-- Function to migrate anonymous user images to their authenticated folder after signup
-- Also updates user_responses table to fix image path references
-- Session-specific: anonymous/sessionId/filename -> userId/filename
CREATE OR REPLACE FUNCTION migrate_anonymous_images_to_user(
  p_new_user_id uuid,
  p_session_id text
)
RETURNS TABLE(
  migrated_count int,
  failed_count int,
  updated_responses_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  migration_count int := 0;
  failure_count int := 0;
  responses_updated int := 0;
  image_record record;
  response_record record;
  updated_responses jsonb;
BEGIN
  -- Step 1: Get anonymous images for this specific session and migrate them
  FOR image_record IN 
    SELECT name, id, created_at
    FROM storage.objects 
    WHERE bucket_id = 'medical-questionnaire-uploads' 
    AND (storage.foldername(name))[1] = 'anonymous'
    AND (storage.foldername(name))[2] = p_session_id
  LOOP
    BEGIN
      -- Update the object path to move it to user's folder
      -- From: anonymous/sessionId/filename.enc
      -- To:   userId/filename.enc
      UPDATE storage.objects 
      SET name = p_new_user_id::text || '/' || split_part(name, '/', 3)
      WHERE id = image_record.id;
      
      migration_count := migration_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        failure_count := failure_count + 1;
    END;
  END LOOP;
  
  -- Step 2: Update user_responses to fix supabasePath references
  FOR response_record IN 
    SELECT ur.id, ur.responses
    FROM user_responses ur
    WHERE ur.user_id = p_new_user_id
    AND ur.responses::text LIKE '%anonymous/' || p_session_id || '%'
  LOOP
    BEGIN
      -- Update the responses JSON to replace session-specific anonymous paths
      updated_responses := response_record.responses;
      
      -- Replace all occurrences of anonymous/sessionId/ with userId/
      updated_responses := jsonb_set_recursive(
        updated_responses,
        'anonymous/' || p_session_id || '/',
        p_new_user_id::text || '/'
      );
      
      -- Update the user_responses record
      UPDATE user_responses 
      SET responses = updated_responses,
          updated_at = now()
      WHERE id = response_record.id;
      
      responses_updated := responses_updated + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log but continue
        NULL;
    END;
  END LOOP;
  
  -- Log migration action
  INSERT INTO public.system_logs (action, details, created_at)
  VALUES ('image_migration', 
          format('Migrated %s images and updated %s response records for session %s to user %s, %s failed', 
                 migration_count, responses_updated, p_session_id, p_new_user_id, failure_count), 
          now());
  
  RETURN QUERY SELECT migration_count, failure_count, responses_updated;
END;
$$;

-- Helper function to recursively replace strings in JSONB
CREATE OR REPLACE FUNCTION jsonb_set_recursive(
  target jsonb,
  old_value text,
  new_value text
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result jsonb := target;
  key text;
  value jsonb;
BEGIN
  -- Handle different JSONB types
  CASE jsonb_typeof(target)
    WHEN 'object' THEN
      FOR key IN SELECT jsonb_object_keys(target)
      LOOP
        value := target -> key;
        
        -- If the value is a string containing the old_value, replace it
        IF jsonb_typeof(value) = 'string' AND value #>> '{}' LIKE '%' || old_value || '%' THEN
          result := jsonb_set(result, ARRAY[key], to_jsonb(REPLACE(value #>> '{}', old_value, new_value)));
        -- If the value is an object or array, recurse
        ELSIF jsonb_typeof(value) IN ('object', 'array') THEN
          result := jsonb_set(result, ARRAY[key], jsonb_set_recursive(value, old_value, new_value));
        END IF;
      END LOOP;
      
    WHEN 'array' THEN
      FOR key IN SELECT generate_series(0, jsonb_array_length(target) - 1)::text
      LOOP
        value := target -> key::int;
        
        -- If the value is a string containing the old_value, replace it
        IF jsonb_typeof(value) = 'string' AND value #>> '{}' LIKE '%' || old_value || '%' THEN
          result := jsonb_set(result, ARRAY[key], to_jsonb(REPLACE(value #>> '{}', old_value, new_value)));
        -- If the value is an object or array, recurse
        ELSIF jsonb_typeof(value) IN ('object', 'array') THEN
          result := jsonb_set(result, ARRAY[key], jsonb_set_recursive(value, old_value, new_value));
        END IF;
      END LOOP;
      
    WHEN 'string' THEN
      -- Replace in string values
      IF target #>> '{}' LIKE '%' || old_value || '%' THEN
        result := to_jsonb(REPLACE(target #>> '{}', old_value, new_value));
      END IF;
  END CASE;
  
  RETURN result;
END;
$$;

-- Function to cleanup orphaned anonymous images (older than 7 days with no associated user)
CREATE OR REPLACE FUNCTION cleanup_orphaned_anonymous_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count int := 0;
BEGIN
  -- Delete anonymous images older than 7 days
  WITH deleted AS (
    DELETE FROM storage.objects 
    WHERE bucket_id = 'medical-questionnaire-uploads' 
    AND (storage.foldername(name))[1] = 'anonymous'
    AND created_at < now() - interval '7 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO cleanup_count FROM deleted;
  
  -- Log cleanup action
  INSERT INTO public.system_logs (action, details, created_at)
  VALUES ('anonymous_cleanup', 
          format('Cleaned up %s orphaned anonymous images', cleanup_count), 
          now());
EXCEPTION
  WHEN OTHERS THEN
    -- Log errors but don't fail
    INSERT INTO public.system_logs (action, details, created_at)
    VALUES ('anonymous_cleanup_error', SQLERRM, now());
END;
$$;

-- Create system_logs table if it doesn't exist (for logging cleanup actions)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;