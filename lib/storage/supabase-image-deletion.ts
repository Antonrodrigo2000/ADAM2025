import { createClient } from '../supabase/client'

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_QUESTIONNAIRE_BUCKET!

export async function deleteImageFromSupabase(imagePath: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([imagePath])
  
  if (error) {
    // Don't throw error if image doesn't exist (already deleted)
    if (error.message.includes('The resource was not found')) {
      return // Image was already deleted, consider this success
    }
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

export async function deleteMultipleImagesFromSupabase(imagePaths: string[]): Promise<void> {
  if (imagePaths.length === 0) return
  
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(imagePaths)
  
  if (error) {
    // Don't throw error if images don't exist (already deleted)
    if (error.message.includes('The resource was not found')) {
      return // Images were already deleted, consider this success
    }
    throw new Error(`Failed to delete images: ${error.message}`)
  }
}

export async function deleteImagesBySessionFromSupabase(sessionId: string, userId?: string): Promise<void> {
  const supabase = createClient()
  
  // If userId provided, search in their specific folder, otherwise search globally
  if (userId) {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${userId}/${sessionId}`, {
        limit: 1000
      })
    
    if (listError) {
      throw new Error(`Failed to list session images: ${listError.message}`)
    }
    
    if (files && files.length > 0) {
      const imagePaths = files.map(file => `${userId}/${sessionId}/${file.name}`)
      await deleteMultipleImagesFromSupabase(imagePaths)
    }
  } else {
    // Fallback: search all folders for session (less efficient but maintains backward compatibility)
    const { data: users, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 100 })
    
    if (listError) {
      throw new Error(`Failed to list user folders: ${listError.message}`)
    }
    
    const imagePaths: string[] = []
    
    for (const user of users || []) {
      if (user.id) { // user.id is the userId folder
        const { data: sessions } = await supabase.storage
          .from(BUCKET_NAME)
          .list(user.id, { limit: 100 })
        
        const sessionFolder = sessions?.find(s => s.name === sessionId)
        if (sessionFolder) {
          const { data: files } = await supabase.storage
            .from(BUCKET_NAME)
            .list(`${user.id}/${sessionId}`, { limit: 1000 })
          
          if (files) {
            imagePaths.push(...files.map(file => `${user.id}/${sessionId}/${file.name}`))
          }
        }
      }
    }
    
    if (imagePaths.length > 0) {
      await deleteMultipleImagesFromSupabase(imagePaths)
    }
  }
}