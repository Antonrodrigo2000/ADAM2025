# Manual Supabase Storage Setup Commands

After running the database migration (`npx supabase db push`), you need to manually create the storage bucket and RLS policies in your Supabase Dashboard.

## 🗂️ Step 1: Create Storage Bucket

**Location**: Supabase Dashboard → Storage → New Bucket

**Settings**:
- **Name**: `medical-questionnaire-uploads`
- **Public**: ❌ **NO** (Keep it private - we use RLS)
- **File size limit**: `15728640` (15MB)
- **Allowed MIME types**: `application/json`
- **Enable RLS**: ✅ **YES**

## 🔒 Step 2: Create RLS Policies

**Location**: Supabase Dashboard → Storage → Policies → New Policy

Create these **4 policies** for the `storage.objects` table:

### Policy 1: Upload Policy
**Dashboard Settings:**
- **Policy Name**: `Allow questionnaire image uploads`
- **Allowed Operations**: ✅ INSERT (only)
- **Target Roles**: ✅ anon, ✅ authenticated
- **Policy Definition** (paste this in the text field):
```sql
bucket_id = 'medical-questionnaire-uploads' AND 
(
  ((storage.foldername(name))[1] = auth.uid()::text) OR
  ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon')
)
```

**❌ Do NOT paste the full CREATE POLICY statement - only the condition above!**

### Policy 2: Download Policy  
**Dashboard Settings:**
- **Policy Name**: `Allow questionnaire image downloads`
- **Allowed Operations**: ✅ SELECT (only)
- **Target Roles**: ✅ anon, ✅ authenticated, ✅ service_role
- **Policy Definition** (USING condition):
```sql
bucket_id = 'medical-questionnaire-uploads' AND 
(
  ((storage.foldername(name))[1] = auth.uid()::text) OR 
  ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
  (auth.role() = 'service_role')
)
```

### Policy 3: Delete Policy
**Dashboard Settings:**
- **Policy Name**: `Allow questionnaire image deletion`
- **Allowed Operations**: ✅ DELETE (only)
- **Target Roles**: ✅ anon, ✅ authenticated, ✅ service_role
- **Policy Definition** (USING condition):
```sql
bucket_id = 'medical-questionnaire-uploads' AND 
(
  ((storage.foldername(name))[1] = auth.uid()::text) OR
  ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
  (auth.role() = 'service_role')
)
```

### Policy 4: Service Role Policy
**Dashboard Settings:**
- **Policy Name**: `Service role can access all questionnaire images`
- **Allowed Operations**: ✅ SELECT, ✅ INSERT, ✅ UPDATE, ✅ DELETE (all operations)
- **Target Roles**: ✅ service_role (only)
- **Policy Definition** (both USING and WITH CHECK):
```sql
bucket_id = 'medical-questionnaire-uploads'
```
**Note**: For this policy, use the same condition for both USING and WITH CHECK fields in the Dashboard.

## 📝 Alternative: SQL Editor Method

If you prefer, you can run all policies at once in **SQL Editor**:

**Location**: Supabase Dashboard → SQL Editor

```sql
-- Create all RLS policies for medical questionnaire image storage

-- Policy 1: Upload Policy
CREATE POLICY "Allow questionnaire image uploads" ON storage.objects
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  bucket_id = 'medical-questionnaire-uploads' AND 
  (
    ((storage.foldername(name))[1] = auth.uid()::text) OR
    ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon')
  )
);

-- Policy 2: Download Policy  
CREATE POLICY "Allow questionnaire image downloads" ON storage.objects
FOR SELECT 
TO anon, authenticated, service_role
USING (
  bucket_id = 'medical-questionnaire-uploads' AND 
  (
    ((storage.foldername(name))[1] = auth.uid()::text) OR 
    ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
    (auth.role() = 'service_role')
  )
);

-- Policy 3: Delete Policy
CREATE POLICY "Allow questionnaire image deletion" ON storage.objects
FOR DELETE 
TO anon, authenticated, service_role
USING (
  bucket_id = 'medical-questionnaire-uploads' AND 
  (
    ((storage.foldername(name))[1] = auth.uid()::text) OR
    ((storage.foldername(name))[1] = 'anonymous' AND auth.role() = 'anon') OR
    (auth.role() = 'service_role')
  )
);

-- Policy 4: Service Role Policy
CREATE POLICY "Service role can access all questionnaire images" ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'medical-questionnaire-uploads')
WITH CHECK (bucket_id = 'medical-questionnaire-uploads');
```

## ✅ Verification Steps

After creating the bucket and policies, verify:

1. **Bucket exists**: `medical-questionnaire-uploads` appears in Storage
2. **RLS enabled**: Bucket shows "RLS enabled" badge
3. **4 policies**: All policies appear in Storage → Policies
4. **Test upload**: Run test script to verify functionality

## 🧪 Test Commands

After setup, test with:

```bash
# Test the complete setup
npx ts-node scripts/test-secure-image-storage.ts

# Or test specific functionality
npx ts-node scripts/test-complete-migration-flow.ts
```

## 🚨 Troubleshooting

**If policies fail to create**:
- Check bucket name is exactly `medical-questionnaire-uploads`
- Ensure RLS is enabled on the bucket
- Try creating policies one by one instead of all at once
- Check you're in the correct project/organization

**If uploads fail**:
- Verify bucket exists and RLS is enabled
- Check all 4 policies are created and active
- Confirm environment variables are set correctly

## 📋 Summary Checklist

- [ ] Run migration: `npx supabase db push`
- [ ] Create storage bucket: `medical-questionnaire-uploads`
- [ ] Enable RLS on bucket
- [ ] Create 4 RLS policies (upload, download, delete, service role)
- [ ] Test functionality with test scripts
- [ ] Verify anonymous and authenticated uploads work
- [ ] Test migration functionality

Once all steps are complete, your secure encrypted medical questionnaire image storage system will be fully operational!