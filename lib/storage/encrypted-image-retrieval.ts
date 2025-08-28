import { createServiceRoleClient } from '../supabase/server'
import { createClient } from '../supabase/client'
import { decryptDownloadedFile } from '../encryption/image-encryption'

const BUCKET_NAME = process.env.SUPABASE_QUESTIONNAIRE_BUCKET!

/**
 * Downloads and decrypts an encrypted image from Supabase storage
 * Uses service role client for server-side access
 */
export async function getDecryptedImageFromSupabase(imagePath: string): Promise<Buffer> {
    const supabase = createServiceRoleClient()
    
    try {
        // Create a signed URL for the private file
        const { data: signedUrlData, error: signedError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(imagePath, 600) // 10 minutes
        
        if (signedError) {
            throw new Error(`Failed to create signed URL: ${signedError.message}`)
        }
        
        if (!signedUrlData?.signedUrl) {
            throw new Error('No signed URL returned')
        }
        
        // Fetch using the signed URL
        const response = await fetch(signedUrlData.signedUrl)
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Signed URL fetch failed: ${response.status} - ${errorText}`)
        }
        
        const blob = await response.blob()
        const decryptedBuffer = await decryptDownloadedFile(blob)
        return decryptedBuffer
        
    } catch (error) {
        console.error('Image retrieval failed:', error)
        throw error
    }
}

/**
 * Downloads and decrypts an image as base64 string
 */
export async function getDecryptedImageAsBase64FromSupabase(imagePath: string): Promise<string> {
    const buffer = await getDecryptedImageFromSupabase(imagePath)
    return buffer.toString('base64')
}

/**
 * Downloads and decrypts an image for client-side use
 * Uses regular client for RLS compliance
 */
export async function getDecryptedImageFromSupabaseClient(imagePath: string): Promise<Buffer> {
    console.log(`🔍 CLIENT: Attempting to download encrypted image: "${imagePath}" from bucket: ${BUCKET_NAME}`)
    console.log(`🔍 CLIENT: Path length: ${imagePath.length}, contains URL protocols: ${imagePath.includes('http')}`)
    
    const supabase = createClient()
    
    // Clean the path if it looks like a URL
    let cleanPath = imagePath
    if (imagePath.includes('http')) {
        console.log(`🔧 CLIENT: Path contains HTTP - this looks like a URL instead of a path`)
        // Try to extract just the path part after the bucket name
        const pathParts = imagePath.split('/')
        const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME)
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            cleanPath = pathParts.slice(bucketIndex + 1).join('/')
            console.log(`🔧 CLIENT: Extracted clean path: "${cleanPath}"`)
        }
    }
    
    console.log(`📥 CLIENT: Attempting download with path: "${cleanPath}"`)
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(cleanPath)
    
    if (error) {
        console.error('Supabase storage download error:', error)
        throw new Error(`Failed to download encrypted image: ${error.message || JSON.stringify(error)}`)
    }
    
    if (!data) {
        throw new Error('No encrypted data received from storage')
    }
    
    // Decrypt the downloaded file
    const decryptedBuffer = await decryptDownloadedFile(data)
    return decryptedBuffer
}

/**
 * Gets a public URL for an encrypted image (returns the encrypted JSON file URL)
 * Note: This URL points to encrypted data - decryption must happen client-side
 */
export function getEncryptedImagePublicUrl(imagePath: string): string {
    const supabase = createClient()
    
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(imagePath)
    
    return data.publicUrl
}

/**
 * Creates a data URL from decrypted image buffer
 */
export function createImageDataUrl(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
}