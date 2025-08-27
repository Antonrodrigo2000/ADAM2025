import { getBrowserSessionId } from '../utils/browser-session'

export async function uploadImageToSupabase(
    questionId: string,
    imageData: string | File | { name: string, size: number, type: string, data: string },
    userId?: string,
    browserSessionId?: string
): Promise<string> {
    try {
        // Convert various formats to File
        let fileToUpload: File
        
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            // Base64 data URL
            fileToUpload = base64ToFile(imageData, 'image.png')
        } else if (imageData instanceof File) {
            // Already a File object
            fileToUpload = imageData
        } else if (typeof imageData === 'object' && imageData !== null && 'data' in imageData && 'name' in imageData) {
            // Quiz component format: { name, size, type, data }
            fileToUpload = base64ToFile((imageData as any).data, (imageData as any).name)
        } else {
            console.error('Invalid image data format:', typeof imageData, imageData)
            throw new Error('Invalid image data format')
        }

        // Get session ID for anonymous users
        const sessionId = browserSessionId || (!userId ? getBrowserSessionId() : undefined)

        // Create form data for API request
        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('questionId', questionId)
        if (sessionId) {
            formData.append('browserSessionId', sessionId)
        }

        // Upload via server-side API (handles encryption securely)
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Upload failed')
        }

        console.log('✅ Image uploaded successfully:', result.supabasePath)
        return result.supabasePath

    } catch (error) {
        console.error('❌ Upload failed:', error)
        throw error
    }
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