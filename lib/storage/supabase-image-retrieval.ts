import { createClient } from '../supabase/client'

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_QUESTIONNAIRE_BUCKET!

export async function getImageFromSupabase(imagePath: string): Promise<string> {
    const supabase = createClient()

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(imagePath, 3600) // 1 hour expiry

    if (error) {
        if (error.message.includes('The resource was not found')) {
            throw new Error(`Image not found in storage. It may have been deleted or expired.`)
        }
        throw new Error(`Failed to retrieve image: ${error.message}`)
    }

    return data.signedUrl
}

export async function getImageAsBase64FromSupabase(imagePath: string): Promise<string> {
    const supabase = createClient()

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(imagePath)

    if (error) {
        if (error.message.includes('The resource was not found')) {
            throw new Error(`Image not found in storage. It may have been deleted or expired.`)
        }
        throw new Error(`Failed to download image: ${error.message}`)
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
            } else {
                reject(new Error('Failed to convert image to base64'))
            }
        }
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(data)
    })
}