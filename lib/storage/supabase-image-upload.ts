import { compressImage, getCompressionInfo, getOptimalCompressionOptions, needsCompression } from '@/helpers/image-compressor'
import { createClient } from '../supabase/client'

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_QUESTIONNAIRE_BUCKET!

export async function uploadImageToSupabase(
    sessionId: string,
    questionId: string,
    imageData: string | File
): Promise<string> {
    const supabase = createClient()

    const imageId = `${sessionId}_${questionId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const fileName = `${imageId}.${getFileExtension(imageData)}`

    let fileToUpload: File

    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        fileToUpload = base64ToFile(imageData, fileName)
    } else if (imageData instanceof File) {
        fileToUpload = new File([imageData], fileName, { type: imageData.type })
    } else {
        throw new Error('Invalid image data format')
    }

    // Compress file if needed
    if (needsCompression(fileToUpload, 100 * 1024)) {
        // Get optimal compression options based on original size
        const options = getOptimalCompressionOptions(fileToUpload.size, 100 * 1024);
        const compressionResult = await compressImage(fileToUpload, options);
        fileToUpload = compressionResult.file;
        console.log('Compressed image:', getCompressionInfo(compressionResult.originalSize, compressionResult.compressedSize));
    }

    // Try to upload to the bucket
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        // If bucket doesn't exist, try to create it first
        if (error.message.includes('Bucket not found')) {
            console.warn('bucket not found, attempting to create it...')

            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
                fileSizeLimit: 10485760 // 10MB
            })

            if (createError) {
                console.error('Failed to create bucket:', createError)
                throw new Error(`Failed to create bucket: ${createError.message}. Please create the '${BUCKET_NAME}' bucket manually in Supabase Dashboard.`)
            }

            // Retry upload after creating bucket
            const { data: retryData, error: retryError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (retryError) {
                console.error('Failed to upload after creating bucket:', retryError)
                throw new Error(`Failed to upload image after creating bucket: ${retryError.message}. You may need to set up storage policies manually.`)
            }

            return retryData.path
        }

        // Handle other common errors
        if (error.message.includes('The resource was not found')) {
            throw new Error(`Storage bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard.`)
        }

        if (error.message.includes('insufficient_privilege') || error.message.includes('access denied')) {
            throw new Error(`Access denied to storage bucket. Please check your storage policies for the '${BUCKET_NAME}' bucket.`)
        }

        throw new Error(`Failed to upload image: ${error.message}`)
    }

    return data.path
}

function getFileExtension(imageData: string | File): string {
    if (imageData instanceof File) {
        const extension = imageData.name.split('.').pop()
        if (extension) return extension

        if (imageData.type.includes('png')) return 'png'
        if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) return 'jpg'
        if (imageData.type.includes('webp')) return 'webp'
        if (imageData.type.includes('gif')) return 'gif'
        return 'png'
    }

    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
        if (imageData.includes('png')) return 'png'
        if (imageData.includes('jpeg') || imageData.includes('jpg')) return 'jpg'
        if (imageData.includes('webp')) return 'webp'
        if (imageData.includes('gif')) return 'gif'
        return 'png'
    }

    return 'png'
}

function base64ToFile(base64String: string, fileName: string): File {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], fileName, { type: mime })
}