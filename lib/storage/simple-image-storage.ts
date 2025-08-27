import { uploadImageToSupabase } from './supabase-image-upload'
import { getDecryptedImageFromSupabaseClient, getEncryptedImagePublicUrl } from './encrypted-image-retrieval'
import { getBrowserSessionId } from '../utils/browser-session'

/**
 * Simplified image storage service for session-based uploads
 * No complex localStorage tracking - just direct upload/download
 */
class SimpleImageStorageService {
    
    /**
     * Upload an image and return the storage path
     */
    async uploadImage(
        questionId: string, 
        imageData: string | File, 
        userId?: string
    ): Promise<string> {
        
        // Get session ID for anonymous users
        const browserSessionId = !userId ? getBrowserSessionId() : undefined
        
        try {
            const supabasePath = await uploadImageToSupabase(
                questionId, 
                imageData, 
                userId, 
                browserSessionId
            )
            
            console.log('📸 Image uploaded successfully:', {
                questionId,
                path: supabasePath,
                isAnonymous: !userId,
                sessionId: browserSessionId
            })
            
            return supabasePath
            
        } catch (error) {
            console.error('❌ Image upload failed:', error)
            throw error
        }
    }
    
    /**
     * Download and decrypt an image
     */
    async downloadImage(imagePath: string): Promise<Buffer> {
        try {
            return await getDecryptedImageFromSupabaseClient(imagePath)
        } catch (error) {
            console.error('❌ Image download failed:', error)
            throw error
        }
    }
    
    /**
     * Get public URL for an encrypted image (client-side decryption needed)
     */
    getImagePublicUrl(imagePath: string): string {
        return getEncryptedImagePublicUrl(imagePath)
    }
    
    /**
     * Create image reference object for questionnaire responses
     */
    createImageReference(
        questionId: string,
        imagePath: string,
        metadata?: {
            name?: string
            size?: number
            fileType?: string
        }
    ) {
        return {
            type: 'image_reference',
            supabasePath: imagePath,
            imageId: `${questionId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            metadata: metadata || {}
        }
    }
    
    /**
     * Get current browser session ID (for anonymous users)
     */
    getBrowserSessionId(): string {
        return getBrowserSessionId()
    }
}

// Export singleton instance
const simpleImageStorage = new SimpleImageStorageService()
export default simpleImageStorage

// Named exports for convenience
export { SimpleImageStorageService }