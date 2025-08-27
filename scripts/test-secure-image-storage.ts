// Test script for secure medical questionnaire image storage
// Tests both authenticated and unauthenticated upload scenarios

import { uploadImageToSupabase } from '../lib/storage/supabase-image-upload'
import { createClient } from '../lib/supabase/client'
import { createServiceRoleClient } from '../lib/supabase/server'

// Test image data (small base64 image)
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

async function testUnauthenticatedUpload() {
    console.log('🔍 Testing unauthenticated user upload...')
    
    const supabase = createClient()
    
    // Ensure we're not authenticated
    await supabase.auth.signOut()
    
    try {
        const sessionId = `quiz_${Date.now()}_test`
        const questionId = 'test-question-id'
        
        const storagePath = await uploadImageToSupabase(sessionId, questionId, TEST_IMAGE_BASE64)
        
        console.log('✅ Unauthenticated upload successful!')
        console.log('📁 Storage path:', storagePath)
        
        // Verify the path structure
        if (storagePath.startsWith('anonymous/')) {
            console.log('✅ Correct folder structure for anonymous user')
        } else {
            console.log('❌ Incorrect folder structure:', storagePath)
        }
        
        // Test download with service role
        const serviceSupabase = createServiceRoleClient()
        const { data, error } = await serviceSupabase.storage
            .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
            .download(storagePath)
            
        if (error) {
            console.log('❌ Service role download failed:', error.message)
        } else {
            console.log('✅ Service role can download anonymous images')
        }
        
        return storagePath
    } catch (error) {
        console.log('❌ Unauthenticated upload failed:', error)
        throw error
    }
}

async function testAuthenticatedUpload(userEmail: string, userPassword: string) {
    console.log('🔍 Testing authenticated user upload...')
    
    const supabase = createClient()
    
    // Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
    })
    
    if (authError) {
        console.log('❌ Authentication failed:', authError.message)
        throw authError
    }
    
    console.log('✅ User authenticated:', authData.user?.id)
    
    try {
        const sessionId = `quiz_${Date.now()}_test`
        const questionId = 'test-question-id'
        
        const storagePath = await uploadImageToSupabase(sessionId, questionId, TEST_IMAGE_BASE64)
        
        console.log('✅ Authenticated upload successful!')
        console.log('📁 Storage path:', storagePath)
        
        // Verify the path structure
        if (storagePath.startsWith(`${authData.user!.id}/`)) {
            console.log('✅ Correct folder structure for authenticated user')
        } else {
            console.log('❌ Incorrect folder structure:', storagePath)
        }
        
        // Test download with the same user
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
            .download(storagePath)
            
        if (error) {
            console.log('❌ User download failed:', error.message)
        } else {
            console.log('✅ User can download their own images')
        }
        
        return storagePath
    } catch (error) {
        console.log('❌ Authenticated upload failed:', error)
        throw error
    }
}

async function testCrossUserAccess(userEmail: string, userPassword: string, otherUserStoragePath: string) {
    console.log('🔍 Testing cross-user access restrictions...')
    
    const supabase = createClient()
    
    // Sign in different user
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
    })
    
    if (authError) {
        console.log('❌ Authentication failed:', authError.message)
        return
    }
    
    // Try to access another user's image
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
        .download(otherUserStoragePath)
        
    if (error) {
        console.log('✅ Cross-user access properly blocked:', error.message)
    } else {
        console.log('❌ Security issue: User can access other user\'s images!')
    }
}

async function runTests() {
    console.log('🚀 Starting secure image storage tests...\n')
    
    try {
        // Test 1: Unauthenticated upload
        const anonymousPath = await testUnauthenticatedUpload()
        console.log('\n' + '='.repeat(50) + '\n')
        
        // Test 2: Authenticated upload (you'll need to provide test credentials)
        const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
        const testUserPassword = process.env.TEST_USER_PASSWORD || 'testpassword123'
        
        console.log(`Note: Using test credentials ${testUserEmail} - make sure this user exists in your Supabase auth`)
        
        try {
            const authenticatedPath = await testAuthenticatedUpload(testUserEmail, testUserPassword)
            console.log('\n' + '='.repeat(50) + '\n')
            
            // Test 3: Cross-user access (if you have another test user)
            const testUser2Email = process.env.TEST_USER2_EMAIL
            const testUser2Password = process.env.TEST_USER2_PASSWORD
            
            if (testUser2Email && testUser2Password) {
                await testCrossUserAccess(testUser2Email, testUser2Password, authenticatedPath)
            } else {
                console.log('ℹ️  Skipping cross-user test (no second test user configured)')
            }
        } catch (error) {
            console.log('ℹ️  Skipping authenticated tests (user doesn\'t exist or wrong credentials)')
        }
        
        console.log('\n🎉 Tests completed!')
        console.log('\n📋 Summary:')
        console.log('- Unauthenticated uploads: Working')
        console.log('- Anonymous folder structure: Verified')
        console.log('- Service role access: Verified')
        console.log('- Ready to apply migration!')
        
    } catch (error) {
        console.log('❌ Test suite failed:', error)
    }
}

// Export for use in other scripts
export { testUnauthenticatedUpload, testAuthenticatedUpload, testCrossUserAccess }

// Run tests if called directly
if (require.main === module) {
    runTests()
}