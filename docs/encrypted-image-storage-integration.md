# Encrypted Medical Questionnaire Image Storage Integration Guide

## Overview

The system now supports encrypted image storage for medical questionnaire uploads with the following features:

- **🔐 AES-256-GCM Encryption**: All images are encrypted before storage
- **👤 Simple folder structure**: `userId/filename.enc`
- **🎭 Anonymous support**: Unauthenticated users upload to `anonymous/filename.enc`
- **🔄 Auto-migration**: Anonymous images move to user folder after signup
- **🧹 Smart cleanup**: Only orphaned anonymous images expire (7 days)
- **🔒 RLS Security**: Row-level security policies control access

## How to Integrate

### 1. Apply the Migration

```bash
npx supabase db push
```

This creates the new `medical-questionnaire-uploads` bucket and RLS policies.

### 2. Update Signup Flow

Add image migration to your signup completion:

```typescript
import ImageMigrationService from '@/lib/services/image-migration-service'

// In your signup completion handler
async function handleSignupComplete(userId: string) {
    // ... existing signup logic ...
    
    // Check if there are anonymous images to migrate
    const hasImages = await ImageMigrationService.hasAnonymousImages()
    
    if (hasImages) {
        console.log('📸 Migrating questionnaire images to user account...')
        
        const migrationResult = await ImageMigrationService.migrateAnonymousImagesToUser(userId)
        
        if (migrationResult.success) {
            console.log(`✅ Migration successful:`)
            console.log(`   - ${migrationResult.migratedCount} images migrated`)
            console.log(`   - ${migrationResult.updatedResponsesCount} questionnaire responses updated`)
        } else {
            console.error('❌ Image migration failed:', migrationResult.error)
            // Handle migration failure - maybe show user a warning
        }
    }
    
    // Continue with normal signup flow...
}
```

### 3. Update Environment Variables

The bucket name has been updated:
- `SUPABASE_QUESTIONNAIRE_BUCKET=medical-questionnaire-uploads`
- `NEXT_PUBLIC_SUPABASE_QUESTIONNAIRE_BUCKET=medical-questionnaire-uploads`

### 4. Setup Cleanup Job (Optional)

Create a cron job or scheduled function to cleanup orphaned images:

```typescript
// Add to your scheduled tasks (e.g., Vercel Cron, AWS Lambda)
import ImageMigrationService from '@/lib/services/image-migration-service'

export async function cleanupOrphanedImages() {
    const result = await ImageMigrationService.cleanupOrphanedAnonymousImages()
    
    if (result.success) {
        console.log('✅ Cleanup completed successfully')
    } else {
        console.error('❌ Cleanup failed:', result.error)
    }
}
```

## How It Works

### Image Upload Flow

1. **User uploads image** → Image gets compressed if needed
2. **Image encrypted** → AES-256-GCM with unique IV and auth tag
3. **Stored as JSON** → Encrypted data stored in secure filename
4. **Folder structure**:
   - Authenticated: `userId/filename.enc`
   - Anonymous: `anonymous/filename.enc`

### Image Download/Submission Flow

1. **eMed submission** → Service role downloads encrypted file
2. **Decryption** → Image decrypted back to original format
3. **Base64 conversion** → Sent to eMed API as base64

### User Signup Flow

1. **Anonymous user** → Uploads images to `anonymous/filename.enc`
2. **Questionnaire submitted** → `user_responses` contains `anonymous/filename.enc` paths
3. **User signs up** → Migration service:
   - Moves images: `anonymous/filename.enc` → `userId/filename.enc`
   - Updates `user_responses`: Fixes all path references
4. **eMed submission** → Uses correct `userId/filename.enc` paths

### Cleanup Flow

1. **Daily cleanup job** → Runs `cleanup_orphaned_anonymous_images()`
2. **Finds orphaned images** → Anonymous images older than 7 days
3. **Safe deletion** → Only deletes images without associated users

## Security Features

✅ **End-to-end encryption** - Images encrypted before leaving client  
✅ **User isolation** - Users can only access their own images  
✅ **Anonymous support** - Unauthenticated users can upload securely  
✅ **Service role access** - eMed submission works with full access  
✅ **Auto-migration** - No manual intervention needed  
✅ **Smart cleanup** - Only orphaned images expire  

## File Structure Changes

### New Files Created:
- `lib/encryption/image-encryption.ts` - Encryption/decryption logic
- `lib/services/image-migration-service.ts` - Migration service
- `lib/storage/encrypted-image-retrieval.ts` - Encrypted download logic
- `supabase/migrations/029_secure_questionnaire_image_storage.sql` - Database setup

### Modified Files:
- `lib/storage/supabase-image-upload.ts` - Added encryption support
- `app/api/webhooks/genie-payments/emed-questionnaire.ts` - Added decryption
- `.env.local` - Updated bucket name

## Testing

Use the test script to verify everything works:

```bash
npx ts-node scripts/test-secure-image-storage.ts
```

This tests:
- ✅ Anonymous user uploads
- ✅ Authenticated user uploads  
- ✅ Folder structure verification
- ✅ Cross-user access restrictions
- ✅ Service role access

## Database Functions Available

- `migrate_anonymous_images_to_user(userId)` - Migrate images to user folder
- `cleanup_orphaned_anonymous_images()` - Cleanup old anonymous images

Both functions log their actions to the `system_logs` table for monitoring.