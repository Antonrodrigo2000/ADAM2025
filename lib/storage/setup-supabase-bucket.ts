import { createClient } from '../supabase/client'

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_QUESTIONNAIRE_BUCKET!

export async function createTempImagesBucket(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return { success: false, message: `Failed to list buckets: ${listError.message}` }
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (bucketExists) {
      return { success: true, message: 'Bucket already exists' }
    }
    
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
      fileSizeLimit: 10485760 // 10MB
    })
    
    if (createError) {
      return { success: false, message: `Failed to create bucket: ${createError.message}` }
    }
    
    return { success: true, message: 'Bucket created successfully' }
  } catch (error) {
    return { success: false, message: `Unexpected error: ${error}` }
  }
}

// Function to test bucket access
export async function testBucketAccess(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  try {
    // Try to list files in the bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 })
    
    if (error) {
      return { success: false, message: `Bucket access failed: ${error.message}` }
    }
    
    return { success: true, message: 'Bucket access successful' }
  } catch (error) {
    return { success: false, message: `Unexpected error: ${error}` }
  }
}

// For browser console testing
if (typeof window !== 'undefined') {
  (window as any).createTempImagesBucket = createTempImagesBucket;
  (window as any).testBucketAccess = testBucketAccess;
}