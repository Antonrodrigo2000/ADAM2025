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

export async function deleteImagesBySessionFromSupabase(sessionId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', {
      limit: 1000,
      search: sessionId
    })
  
  if (listError) {
    throw new Error(`Failed to list session images: ${listError.message}`)
  }
  
  if (files && files.length > 0) {
    const imagePaths = files
      .filter(file => file.name.includes(sessionId))
      .map(file => file.name)
    
    if (imagePaths.length > 0) {
      await deleteMultipleImagesFromSupabase(imagePaths)
    }
  }
}