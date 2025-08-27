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
    
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(imagePath)
    
    if (error) {
        throw new Error(`Failed to download encrypted image: ${error.message}`)
    }
    
    if (!data) {
        throw new Error('No encrypted data received from storage')
    }
    
    // Decrypt the downloaded file
    const decryptedBuffer = await decryptDownloadedFile(data)
    return decryptedBuffer
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
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(imagePath)
    
    if (error) {
        throw new Error(`Failed to download encrypted image: ${error.message}`)
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