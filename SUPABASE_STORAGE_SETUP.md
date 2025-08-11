# Supabase Storage Setup Guide

## 1. Manual Setup (Recommended)

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New Bucket**
4. Enter bucket name: `temp-images`
5. Check **Public bucket** (allows public access)
6. Set **File size limit**: 10MB (10485760 bytes)
7. Add **Allowed MIME types**:
   - `image/jpeg`
   - `image/jpg` 
   - `image/png`
   - `image/webp`
   - `image/gif`
8. Click **Save**

### Step 2: Set Storage Policies
1. Go to **Storage** → **Policies**
2. Click **New Policy** for each of the following:

#### Upload Policy:
```sql
CREATE POLICY "Allow public uploads to temp-images" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'temp-images');
```

#### Download Policy:
```sql
CREATE POLICY "Allow public access to temp-images" ON storage.objects
FOR SELECT 
USING (bucket_id = 'temp-images');
```

#### Delete Policy:
```sql
CREATE POLICY "Allow public deletes from temp-images" ON storage.objects
FOR DELETE 
USING (bucket_id = 'temp-images');
```

#### Update Policy:
```sql
CREATE POLICY "Allow public updates to temp-images" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'temp-images')
WITH CHECK (bucket_id = 'temp-images');
```

## 2. Semi-Automated Setup (Using Migration)

### Step 1: Create the Bucket via Migration
Run the SQL migration to create the bucket:

```bash
supabase db push
```

This will create the `temp-images` bucket automatically.

### Step 2: Add Policies Manually
Storage policies require system-level permissions, so you must add them via the Supabase Dashboard:

1. Go to **Storage** → **Policies** 
2. Create the policies listed in Step 2 of the Manual Setup above

Note: The migration file (`supabase/migrations/009_setup_temp_images_storage.sql`) includes the bucket creation and comments with the exact policies to create.

## 3. Test Setup

Open your browser console on the app and run:

```javascript
// Test bucket creation
createTempImagesBucket().then(console.log)

// Test bucket access
testBucketAccess().then(console.log)

// Test full image storage workflow
testSupabaseImageStorage().then(console.log)
```

## 4. Troubleshooting

### Common Errors:

**"Bucket not found"**
- Solution: Create the `temp-images` bucket manually

**"Access denied" or "insufficient_privilege"**
- Solution: Add the storage policies listed above

**"File size too large"**
- Solution: Increase bucket file size limit to 10MB+

**"MIME type not allowed"**
- Solution: Add image MIME types to bucket allowlist

## 5. Security Considerations

- The bucket is public for temporary storage only
- Images are automatically cleaned up after 24 hours
- File size is limited to 10MB
- Only image MIME types are allowed
- Consider adding rate limiting for production use

## 6. Environment Variables

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```