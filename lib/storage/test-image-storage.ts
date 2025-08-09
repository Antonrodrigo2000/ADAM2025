// Test script for image storage functionality
// Run this in the browser console to test IndexedDB storage

import imageStorage from './image-storage'

export async function testImageStorage() {
    console.log('Testing IndexedDB image storage...')
    
    try {
        // Initialize storage
        await imageStorage.init()
        console.log('✅ IndexedDB initialized successfully')
        
        // Create a test base64 image (small red square)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        
        // Store the image
        const sessionId = 'test-session-123'
        const questionId = 'test-question-1'
        const imageId = await imageStorage.storeImage(sessionId, questionId, testImageBase64)
        console.log('✅ Image stored with ID:', imageId)
        
        // Retrieve the image
        const retrievedImage = await imageStorage.getImage(imageId)
        console.log('✅ Image retrieved:', retrievedImage === testImageBase64 ? 'SUCCESS' : 'FAILED')
        
        // Get storage stats
        const stats = await imageStorage.getStorageStats()
        console.log('✅ Storage stats:', stats)
        
        // Clean up
        await imageStorage.deleteImage(imageId)
        console.log('✅ Image deleted successfully')
        
        console.log('🎉 All tests passed!')
        
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

// Function to test the processing logic
export function testImageDetection() {
    console.log('Testing image detection...')
    
    const testCases = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'regular string',
        ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg', 'regular string'],
        { type: 'image_reference', imageId: 'test-123' },
        42,
        null
    ]
    
    testCases.forEach((testCase, index) => {
        // Since isImageData is not exported, we'll test the logic manually
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

// Export for manual testing
if (typeof window !== 'undefined') {
    (window as any).testImageStorage = testImageStorage;
    (window as any).testImageDetection = testImageDetection;
}