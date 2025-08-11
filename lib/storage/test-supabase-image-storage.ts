import supabaseImageStorage from './supabase-image-storage'

export async function testSupabaseImageStorage() {
    try {
        const sessionId = 'test-session-123'
        const questionId = 'test-question-1'
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        
        const imageId = await supabaseImageStorage.storeImage(sessionId, questionId, testImageBase64)
        
        const retrievedImageUrl = await supabaseImageStorage.getImage(imageId)
        
        const retrievedBase64 = await supabaseImageStorage.getImageAsBase64(imageId)
        
        const stats = await supabaseImageStorage.getStorageStats()
        
        await supabaseImageStorage.deleteImage(imageId)
        
        return {
            success: true,
            imageId,
            imageUrl: retrievedImageUrl,
            base64Retrieved: !!retrievedBase64,
            stats
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export function testImageDetection() {
    const testCases = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'regular string',
        ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg', 'regular string'],
        { type: 'image_reference', imageId: 'test-123' },
        42,
        null
    ]
    
    testCases.forEach((testCase, index) => {
        let isImage = false
        
        if (typeof testCase === 'string' && testCase.startsWith('data:image/')) {
            isImage = true
        } else if (Array.isArray(testCase)) {
            isImage = testCase.some(item => 
                typeof item === 'string' && item.startsWith('data:image/')
            )
        }
        
        console.log(`Test ${index + 1}:`, testCase, '→', isImage ? 'IMAGE' : 'NOT IMAGE')
    })
}

if (typeof window !== 'undefined') {
    (window as any).testSupabaseImageStorage = testSupabaseImageStorage;
    (window as any).testImageDetection = testImageDetection;
}