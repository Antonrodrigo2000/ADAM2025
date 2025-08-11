import { createClient } from '../supabase/server'

const BUCKET_NAME = 'temp-images'

export async function resolveImageReference(imageReference: any): Promise<string | null> {
  if (!imageReference || imageReference.type !== 'image_reference') {
    return null
  }

  try {
    const supabase = await createClient()
    
    // Get the file extension from metadata, fallback to png
    let extension = 'png'
    if (imageReference.metadata?.fileType) {
      if (imageReference.metadata.fileType.includes('jpeg') || imageReference.metadata.fileType.includes('jpg')) {
        extension = 'jpg'
      } else if (imageReference.metadata.fileType.includes('png')) {
        extension = 'png'
      } else if (imageReference.metadata.fileType.includes('webp')) {
        extension = 'webp'
      } else if (imageReference.metadata.fileType.includes('gif')) {
        extension = 'gif'
      }
    }
        
    // Download the image from Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(imageReference.supabasePath)
    
    if (error) {
      console.error('Failed to download image from Supabase:', error)
      return null
    }
    
    // Convert to base64
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = imageReference.metadata?.fileType || 'image/png'
    
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error resolving image reference:', error)
    return null
  }
}

export async function resolveQuizResponseImages(quizResponses: Record<string, any>): Promise<Record<string, any>> {
  const resolvedResponses: Record<string, any> = {}
  
  for (const [questionId, response] of Object.entries(quizResponses)) {
    if (response?.type === 'image_reference') {
      // Single image reference
      const base64 = await resolveImageReference(response)
      resolvedResponses[questionId] = base64 || response
    } else if (Array.isArray(response)) {
      // Array that might contain image references
      const resolvedArray = await Promise.all(
        response.map(async (item) => {
          if (item?.type === 'image_reference') {
            const base64 = await resolveImageReference(item)
            return base64 || item
          }
          return item
        })
      )
      resolvedResponses[questionId] = resolvedArray
    } else {
      resolvedResponses[questionId] = response
    }
  }
  
  return resolvedResponses
}