// Test script for complete anonymous → authenticated → eMed submission flow
// This tests the critical path you identified

import { uploadImageToSupabase } from '../lib/storage/supabase-image-upload'
import { createClient } from '../lib/supabase/client'
import { createServiceRoleClient } from '../lib/supabase/server'
import ImageMigrationService from '../lib/services/image-migration-service'
import { getDecryptedImageAsBase64FromSupabase } from '../lib/storage/encrypted-image-retrieval'

// Test image data
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

interface TestContext {
    sessionId: string
    questionId: string
    userId?: string
    imagePath?: string
    userResponseId?: number
}

async function testCompleteFlow() {
    console.log('🧪 Testing Complete Anonymous → Auth → eMed Flow\n')
    
    const ctx: TestContext = {
        sessionId: `test_${Date.now()}_flow`,
        questionId: 'photo-upload-question'
    }
    
    try {
        // Step 1: Anonymous user uploads image
        console.log('1️⃣ Testing anonymous image upload...')
        await testAnonymousImageUpload(ctx)
        
        // Step 2: Save questionnaire response with image path
        console.log('\n2️⃣ Saving questionnaire response with image path...')
        await saveQuestionnaireResponse(ctx)
        
        // Step 3: User signs up and migration happens
        console.log('\n3️⃣ Testing user signup and migration...')
        await testUserSignupAndMigration(ctx)
        
        // Step 4: Verify image paths in user_responses are updated
        console.log('\n4️⃣ Verifying updated questionnaire responses...')
        await verifyUpdatedResponses(ctx)
        
        // Step 5: Test eMed-style image retrieval
        console.log('\n5️⃣ Testing eMed-style image retrieval...')
        await testEmedImageRetrieval(ctx)
        
        console.log('\n🎉 COMPLETE FLOW TEST PASSED!')
        console.log('✅ Anonymous upload → Questionnaire save → User signup → Migration → eMed retrieval')
        
    } catch (error) {
        console.error('❌ COMPLETE FLOW TEST FAILED:', error)
        throw error
    }
}

async function testAnonymousImageUpload(ctx: TestContext): Promise<void> {
    const supabase = createClient()
    
    // Ensure we're not authenticated
    await supabase.auth.signOut()
    
    // Upload image as anonymous user
    ctx.imagePath = await uploadImageToSupabase(ctx.sessionId, ctx.questionId, TEST_IMAGE_BASE64)
    
    console.log('📁 Image uploaded to:', ctx.imagePath)
    
    // Verify it's in the anonymous folder
    if (!ctx.imagePath.startsWith('anonymous/')) {
        throw new Error('Image not uploaded to anonymous folder')
    }
    
    console.log('✅ Anonymous image upload successful')
}

async function saveQuestionnaireResponse(ctx: TestContext): Promise<void> {
    const supabase = createServiceRoleClient()
    
    // Create a temporary user for testing (this would normally happen during signup)
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
        email_confirm: true
    })
    
    if (createError || !authData.user) {
        throw new Error(`Failed to create test user: ${createError?.message}`)
    }
    
    ctx.userId = authData.user.id
    console.log('👤 Created test user:', ctx.userId)
    
    // Save questionnaire response with the anonymous image path
    const responseData = {
        [ctx.questionId]: {
            type: 'image_reference',
            supabasePath: ctx.imagePath,
            imageId: `${ctx.sessionId}_${ctx.questionId}_test`,
            metadata: {
                name: 'test-image.png',
                fileType: 'image/png'
            }
        }
    }
    
    const { data, error } = await supabase
        .from('user_responses')
        .insert({
            user_id: ctx.userId,
            questionnaire_id: 1, // Assuming questionnaire ID 1 exists
            responses: responseData,
            completed_at: new Date().toISOString()
        })
        .select()
        .single()
    
    if (error) {
        throw new Error(`Failed to save questionnaire response: ${error.message}`)
    }
    
    ctx.userResponseId = data.id
    console.log('💾 Questionnaire response saved with anonymous path:', ctx.imagePath)
    console.log('✅ Response contains anonymous image reference')
}

async function testUserSignupAndMigration(ctx: TestContext): Promise<void> {
    if (!ctx.userId) {
        throw new Error('User ID not set')
    }
    
    // Run migration (this would normally happen in your signup flow)
    const migrationResult = await ImageMigrationService.migrateAnonymousImagesToUser(
        ctx.sessionId,
        ctx.userId
    )
    
    if (!migrationResult.success) {
        throw new Error(`Migration failed: ${migrationResult.error}`)
    }
    
    console.log(`📦 Migration results:`)
    console.log(`   - Images migrated: ${migrationResult.migratedCount}`)
    console.log(`   - Responses updated: ${migrationResult.updatedResponsesCount}`)
    console.log(`   - Failures: ${migrationResult.failedCount}`)
    
    if (migrationResult.migratedCount === 0) {
        throw new Error('No images were migrated')
    }
    
    if (migrationResult.updatedResponsesCount === 0) {
        throw new Error('No responses were updated')
    }
    
    console.log('✅ Migration completed successfully')
}

async function verifyUpdatedResponses(ctx: TestContext): Promise<void> {
    const supabase = createServiceRoleClient()
    
    // Get the updated user response
    const { data, error } = await supabase
        .from('user_responses')
        .select('responses')
        .eq('id', ctx.userResponseId)
        .single()
    
    if (error || !data) {
        throw new Error(`Failed to fetch updated response: ${error?.message}`)
    }
    
    const responses = data.responses
    const imageRef = responses[ctx.questionId]
    
    console.log('🔍 Updated image reference:', imageRef)
    
    // Check that the path has been updated from anonymous to user folder
    if (!imageRef?.supabasePath) {
        throw new Error('No supabasePath found in updated response')
    }
    
    if (imageRef.supabasePath.includes('anonymous/')) {
        throw new Error('Response still contains anonymous path - migration failed')
    }
    
    if (!imageRef.supabasePath.includes(ctx.userId)) {
        throw new Error('Response does not contain user ID - migration failed')
    }
    
    console.log('✅ Response paths successfully updated to user folder')
    
    // Update context with new path for next test
    ctx.imagePath = imageRef.supabasePath
}

async function testEmedImageRetrieval(ctx: TestContext): Promise<void> {
    if (!ctx.imagePath) {
        throw new Error('Image path not available for retrieval test')
    }
    
    try {
        // This simulates what happens in the eMed questionnaire submission
        console.log('📸 Attempting to retrieve and decrypt image:', ctx.imagePath)
        
        const base64Image = await getDecryptedImageAsBase64FromSupabase(ctx.imagePath)
        
        if (!base64Image) {
            throw new Error('No decrypted image data received')
        }
        
        console.log(`📊 Retrieved decrypted image, size: ${Math.round(base64Image.length * 0.75 / 1024)}KB`)
        console.log('✅ eMed-style image retrieval successful')
        
    } catch (error) {
        throw new Error(`eMed image retrieval failed: ${error}`)
    }
}

// Cleanup function to remove test data
async function cleanup(ctx: TestContext) {
    console.log('\n🧹 Cleaning up test data...')
    
    const supabase = createServiceRoleClient()
    
    try {
        // Delete test user response
        if (ctx.userResponseId) {
            await supabase
                .from('user_responses')
                .delete()
                .eq('id', ctx.userResponseId)
        }
        
        // Delete test user
        if (ctx.userId) {
            await supabase.auth.admin.deleteUser(ctx.userId)
        }
        
        // Delete test image (if it still exists)
        if (ctx.imagePath) {
            await supabase.storage
                .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                .remove([ctx.imagePath])
        }
        
        console.log('✅ Cleanup completed')
        
    } catch (error) {
        console.warn('⚠️ Cleanup failed (this is okay):', error)
    }
}

// Run the complete test
async function runCompleteFlowTest() {
    const ctx: TestContext = {
        sessionId: `test_${Date.now()}_flow`,
        questionId: 'photo-upload-question'
    }
    
    try {
        await testCompleteFlow()
    } catch (error) {
        console.error('Test failed:', error)
        throw error
    } finally {
        await cleanup(ctx)
    }
}

// Export for use in other scripts
export { testCompleteFlow, runCompleteFlowTest }

// Run if called directly
if (require.main === module) {
    runCompleteFlowTest()
        .then(() => {
            console.log('\n🎊 All tests passed!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('\n💥 Test suite failed:', error)
            process.exit(1)
        })
}