import { uploadImageToSupabase } from './supabase-image-upload'
import { getImageFromSupabase, getImageAsBase64FromSupabase } from './supabase-image-retrieval'
import { deleteImageFromSupabase, deleteImagesBySessionFromSupabase } from './supabase-image-deletion'
import {
  storeImageReference,
  getImageReference,
  getImageReferencesForSession,
  removeImageReference,
  removeSessionImageReferences,
  cleanupOldImageReferences
} from './local-storage-references'

interface ImageData {
  id: string
  sessionId: string
  questionId: string
  supabasePath: string
  timestamp: number
  metadata?: {
    name?: string
    size?: number
    fileType?: string
  }
}

class SupabaseImageStorageService {
  async storeImage(sessionId: string, questionId: string, imageData: string | File): Promise<{imageId: string, supabasePath: string}> {
    try {
      const supabasePath = await uploadImageToSupabase(sessionId, questionId, imageData)
      
      const imageId = `${sessionId}_${questionId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      
      let metadata: { name?: string; size?: number; fileType?: string } | undefined
      if (imageData instanceof File) {
        metadata = {
          name: imageData.name,
          size: imageData.size,
          fileType: imageData.type
        }
      }
      
      storeImageReference(sessionId, questionId, imageId, supabasePath, metadata)
      
      return { imageId, supabasePath }
    } catch (error) {
      throw new Error(`Failed to store image: ${error}`)
    }
  }

  async getImage(imageId: string): Promise<string | null> {
    try {
      const parts = imageId.split('_')
      if (parts.length < 6) return null
      
      const sessionId = parts[0] + '_' + parts[1] + '_' + parts[2]
      const questionId = parts[3] + '-' + parts[4] + '-' + parts[5] + '-' + parts[6] + '-' + parts[7]
      
      const reference = getImageReference(sessionId, questionId, imageId)
      if (!reference) return null
      
      return await getImageFromSupabase(reference.supabasePath)
    } catch (error) {
      return null
    }
  }

  async getImageAsBase64(imageId: string): Promise<string | null> {
    try {      
      // Parse imageId: quiz_timestamp_sessionSuffix_questionId_index_timestamp_randomString
      // Example: quiz_1754938053320_foz6gxedg_2d44a2a7-cb99-406d-9953-0624ce67b6df_0_1754938085155_ibqz2nbou
      const parts = imageId.split('_')
      if (parts.length < 6) {
        console.warn('Invalid imageId format:', imageId)
        return null
      }
      
      const sessionId = parts[0] + '_' + parts[1] + '_' + parts[2] // quiz_timestamp_sessionSuffix
      const questionId = parts[3] + '-' + parts[4] + '-' + parts[5] + '-' + parts[6] + '-' + parts[7] // UUID format
            
      const reference = getImageReference(sessionId, questionId, imageId)
      
      if (!reference) {
        console.warn('No reference found for:', { sessionId, questionId, imageId })
        return null
      }
      
      const base64 = await getImageAsBase64FromSupabase(reference.supabasePath)
      
      return base64
    } catch (error) {
      console.error('Error in getImageAsBase64:', error)
      return null
    }
  }

  async getImagesBySession(sessionId: string): Promise<Record<string, string>> {
    const references = getImageReferencesForSession(sessionId)
    const images: Record<string, string> = {}
    
    await Promise.all(
      references.map(async (ref) => {
        try {
          const url = await getImageFromSupabase(ref.supabasePath)
          images[ref.id] = url
        } catch (error) {
          // Skip failed images
        }
      })
    )
    
    return images
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      const parts = imageId.split('_')
      if (parts.length < 6) return
      
      const sessionId = parts[0] + '_' + parts[1] + '_' + parts[2]
      const questionId = parts[3] + '-' + parts[4] + '-' + parts[5] + '-' + parts[6] + '-' + parts[7]
      
      const reference = getImageReference(sessionId, questionId, imageId)
      if (!reference) return
      
      await deleteImageFromSupabase(reference.supabasePath)
      removeImageReference(sessionId, questionId, imageId)
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`)
    }
  }

  async deleteImagesBySession(sessionId: string): Promise<void> {
    try {
      const references = removeSessionImageReferences(sessionId)
      
      if (references.length > 0) {
        await deleteImagesBySessionFromSupabase(sessionId)
      }
    } catch (error) {
      throw new Error(`Failed to delete session images: ${error}`)
    }
  }

  async cleanupOldImages(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const oldReferences = cleanupOldImageReferences(maxAgeMs)
      
      if (oldReferences.length > 0) {
        await Promise.all(
          oldReferences.map(async (ref) => {
            try {
              await deleteImageFromSupabase(ref.supabasePath)
            } catch (error) {
              // Continue cleanup even if some deletions fail
            }
          })
        )
      }
    } catch (error) {
      throw new Error(`Failed to cleanup old images: ${error}`)
    }
  }

  async getStorageStats(): Promise<{ count: number; estimatedSize: number }> {
    try {
      const allReferences = Object.values(
        JSON.parse(localStorage.getItem('adam-image-references') || '{}') as Record<string, Record<string, ImageData[]>>
      ).flatMap(session => Object.values(session).flat())
      
      let estimatedSize = 0
      allReferences.forEach(ref => {
        if (ref.metadata?.size) {
          estimatedSize += ref.metadata.size
        }
      })
      
      return {
        count: allReferences.length,
        estimatedSize
      }
    } catch (error) {
      return { count: 0, estimatedSize: 0 }
    }
  }
}

const supabaseImageStorage = new SupabaseImageStorageService()
export default supabaseImageStorage