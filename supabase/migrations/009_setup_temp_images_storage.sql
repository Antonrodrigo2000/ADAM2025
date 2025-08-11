-- Create the temp-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'temp-images',
  'temp-images',
  true,
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- Note: The following policies should be created via the Supabase Dashboard 
-- because they require system-level permissions

-- Storage policies to create manually in Supabase Dashboard:
-- 
-- 1. Allow public uploads to temp-images:
-- CREATE POLICY "Allow public uploads to temp-images" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'temp-images');
--
-- 2. Allow public access to temp-images:
-- CREATE POLICY "Allow public access to temp-images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'temp-images');
--
-- 3. Allow public deletes from temp-images:
-- CREATE POLICY "Allow public deletes from temp-images" ON storage.objects
-- FOR DELETE USING (bucket_id = 'temp-images');
--
-- 4. Allow public updates to temp-images:
-- CREATE POLICY "Allow public updates to temp-images" ON storage.objects
-- FOR UPDATE USING (bucket_id = 'temp-images') WITH CHECK (bucket_id = 'temp-images');