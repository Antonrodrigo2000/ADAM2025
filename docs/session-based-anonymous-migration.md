# Session-Based Anonymous Image Migration

## 🎯 Problem Solved

**Issue**: Multiple anonymous users uploading to the same folder causes migration conflicts.

```
Device A: anonymous/image1.enc  
Device B: anonymous/image2.enc  ← User A signs up → Takes both images!
Device C: anonymous/image3.enc  ← User B signs up → No images left!
```

**Solution**: Browser session-specific folders ensure each user only gets their own images.

## 📁 New Folder Structure

```
medical-questionnaire-uploads/
├── anonymous/
│   ├── session_1703123456_abc123/
│   │   ├── photo_1703123500_def456.enc    ← Device A uploads
│   │   └── photo_1703123600_ghi789.enc
│   ├── session_1703123500_xyz789/
│   │   └── photo_1703123700_jkl012.enc    ← Device B uploads
│   └── session_1703123600_mno345/
│       └── photo_1703123800_pqr678.enc    ← Device C uploads
├── user-uuid-1/
│   ├── photo_1703123500_def456.enc        ← Migrated from Device A
│   └── photo_1703123600_ghi789.enc
└── user-uuid-2/
    └── photo_1703123700_jkl012.enc        ← Migrated from Device B
```

## 🔧 How It Works

### 1. Browser Session Generation
```typescript
// lib/utils/browser-session.ts
function getBrowserSessionId(): string {
    // Generates: session_1703123456_abc123
    // Stored in sessionStorage (survives page refresh, cleared on browser close)
}
```

### 2. Anonymous Upload with Session
```typescript
// Anonymous user uploads image
const sessionId = getBrowserSessionId() // session_1703123456_abc123
const imagePath = await uploadImageToSupabase('photo-question', imageFile)
// Result: anonymous/session_1703123456_abc123/photo_1703123500_def456.enc
```

### 3. Migration on Signup
```typescript
// User signs up
const sessionId = getBrowserSessionId() // Same session ID
const result = await ImageMigrationService.migrateAnonymousImagesToUser(
    userId, 
    sessionId
)
// Migrates ONLY images from anonymous/session_1703123456_abc123/ → userId/
```

## 💻 Integration Code

### Frontend Quiz Component
```typescript
import { getBrowserSessionId, setSessionData, getSessionData } from '@/lib/utils/browser-session'
import { uploadImageToSupabase } from '@/lib/storage/supabase-image-upload'

async function handleImageUpload(questionId: string, imageFile: File) {
    // Upload with session tracking
    const imagePath = await uploadImageToSupabase(questionId, imageFile)
    
    // Store reference with session-specific key
    const responses = getSessionData('quiz-responses') || {}
    responses[questionId] = {
        type: 'image_reference',
        supabasePath: imagePath,
        imageId: `${questionId}_${Date.now()}`,
        metadata: {
            name: imageFile.name,
            fileType: imageFile.type
        }
    }
    setSessionData('quiz-responses', responses)
    
    console.log('📸 Image uploaded:', imagePath)
    // Result: anonymous/session_1703123456_abc123/photo_1703123500_def456.enc
}
```

### Signup Integration
```typescript
import { getBrowserSessionId, clearBrowserSession, clearSessionData } from '@/lib/utils/browser-session'
import ImageMigrationService from '@/lib/services/image-migration-service'

async function handleSignupComplete(userId: string) {
    const sessionId = getBrowserSessionId()
    
    // Check if this session has images to migrate
    const hasImages = await ImageMigrationService.hasAnonymousImages(sessionId)
    
    if (hasImages) {
        console.log('📸 Migrating questionnaire images to user account...')
        
        const migrationResult = await ImageMigrationService.migrateAnonymousImagesToUser(
            userId, 
            sessionId
        )
        
        if (migrationResult.success) {
            console.log(`✅ Migration successful:`)
            console.log(`   - ${migrationResult.migratedCount} images migrated`)
            console.log(`   - ${migrationResult.updatedResponsesCount} responses updated`)
            
            // Update browser localStorage paths to match
            updateLocalStorageImagePaths(userId, sessionId)
            
            // Clear session data
            clearSessionData()
            clearBrowserSession()
        }
    }
}

function updateLocalStorageImagePaths(userId: string, sessionId: string) {
    const responses = getSessionData('quiz-responses')
    if (responses) {
        // Replace anonymous/sessionId/ with userId/
        const updatedResponses = JSON.stringify(responses)
            .replace(new RegExp(`anonymous/${sessionId}/`, 'g'), `${userId}/`)
        
        // Store with regular key (no longer session-specific)
        localStorage.setItem('quiz-responses', updatedResponses)
    }
}
```

### Authenticated Direct Upload
```typescript
// Authenticated users don't need session tracking
async function handleAuthenticatedImageUpload(questionId: string, imageFile: File) {
    const imagePath = await uploadImageToSupabase(questionId, imageFile)
    // Result: userId/photo_1703123500_def456.enc (no session folder)
}
```

## 🗄️ Database Functions

### Migration Function
```sql
-- Migrates images from specific session to user
SELECT * FROM migrate_anonymous_images_to_user(
    'user-uuid-123'::uuid, 
    'session_1703123456_abc123'
);
-- Returns: migrated_count, failed_count, updated_responses_count
```

### Cleanup Function  
```sql
-- Cleans up old anonymous images (all sessions)
SELECT cleanup_orphaned_anonymous_images();
```

## 🔒 Security Benefits

✅ **Session Isolation**: Each browser gets its own anonymous folder  
✅ **Precise Migration**: Only migrates images from the specific device that signed up  
✅ **No Cross-Contamination**: Device A can't accidentally get Device B's images  
✅ **RLS Compatible**: Folder structure works with existing Row Level Security policies  
✅ **Automatic Cleanup**: Orphaned sessions are cleaned up after 7 days  

## 🧪 Test Scenario

```typescript
// Device A (Chrome)
const sessionA = getBrowserSessionId() // session_A_123
await uploadImage('photo1.jpg') 
// → anonymous/session_A_123/photo1.enc

// Device B (Firefox) 
const sessionB = getBrowserSessionId() // session_B_456
await uploadImage('photo2.jpg')
// → anonymous/session_B_456/photo2.enc

// Device A user signs up
await migrateAnonymousImagesToUser(userA, sessionA)
// → Migrates only anonymous/session_A_123/* to userA/

// Device B user signs up  
await migrateAnonymousImagesToUser(userB, sessionB)
// → Migrates only anonymous/session_B_456/* to userB/

// ✅ Each user gets only their own images!
```

## 🔄 Flow Summary

1. **Anonymous Upload** → `anonymous/sessionId/filename.enc`
2. **Store Reference** → Session-specific localStorage key
3. **User Signup** → Migrate specific session images to user folder
4. **Update References** → Fix localStorage paths 
5. **Clear Session** → Remove temporary session data
6. **Future Uploads** → Direct to `userId/filename.enc`

This ensures perfect isolation between anonymous users while maintaining a seamless transition to authenticated storage!