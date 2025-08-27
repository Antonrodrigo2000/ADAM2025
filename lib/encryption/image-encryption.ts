import crypto from 'crypto'

// Server-side only encryption - ensure this runs only on server
if (typeof window !== 'undefined') {
    throw new Error('Image encryption must only run on server-side for security')
}

// Use a consistent encryption key derived from environment
function getEncryptionKey(): Buffer {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for image encryption')
    }
    
    return crypto.createHash('sha256').update(serviceRoleKey).digest()
}

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

export interface EncryptedData {
    data: string // base64 encoded encrypted data
    iv: string   // base64 encoded initialization vector
    tag: string  // base64 encoded authentication tag
}

/**
 * Encrypts image buffer data
 */
export function encryptImageData(buffer: Buffer): EncryptedData {
    try {
        // Generate a random initialization vector
        const iv = crypto.randomBytes(IV_LENGTH)
        
        // Create cipher with IV
        const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
        cipher.setAAD(Buffer.from('medical-questionnaire', 'utf8')) // Additional authenticated data
        
        // Encrypt the data
        const encrypted = Buffer.concat([
            cipher.update(buffer),
            cipher.final()
        ])
        
        // Get the authentication tag
        const tag = cipher.getAuthTag()
        
        return {
            data: encrypted.toString('base64'),
            iv: iv.toString('base64'),
            tag: tag.toString('base64')
        }
    } catch (error) {
        throw new Error(`Encryption failed: ${error}`)
    }
}

/**
 * Decrypts image data back to buffer
 */
export function decryptImageData(encryptedData: EncryptedData): Buffer {
    try {
        // Parse the encrypted components
        const data = Buffer.from(encryptedData.data, 'base64')
        const iv = Buffer.from(encryptedData.iv, 'base64')
        const tag = Buffer.from(encryptedData.tag, 'base64')
        
        // Create decipher with IV
        const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
        decipher.setAAD(Buffer.from('medical-questionnaire', 'utf8'))
        decipher.setAuthTag(tag)
        
        // Decrypt the data
        const decrypted = Buffer.concat([
            decipher.update(data),
            decipher.final()
        ])
        
        return decrypted
    } catch (error) {
        throw new Error(`Decryption failed: ${error}`)
    }
}

/**
 * Encrypts a File object
 */
export async function encryptFile(file: File): Promise<{ encryptedData: EncryptedData; originalMetadata: FileMetadata }> {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const originalMetadata: FileMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
    }
    
    const encryptedData = encryptImageData(buffer)
    
    return { encryptedData, originalMetadata }
}

/**
 * Encrypts a base64 data URL
 */
export function encryptBase64DataUrl(dataUrl: string): { encryptedData: EncryptedData; originalMetadata: FileMetadata } {
    // Parse the data URL
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
        throw new Error('Invalid base64 data URL format')
    }
    
    const [, mimeType, base64Data] = matches
    const buffer = Buffer.from(base64Data, 'base64')
    
    const originalMetadata: FileMetadata = {
        name: `image.${getExtensionFromMimeType(mimeType)}`,
        type: mimeType,
        size: buffer.length,
        lastModified: Date.now()
    }
    
    const encryptedData = encryptImageData(buffer)
    
    return { encryptedData, originalMetadata }
}

/**
 * Creates an encrypted File object for upload
 */
export function createEncryptedFile(encryptedData: EncryptedData, filename: string): File {
    // Store encrypted data as JSON
    const encryptedJson = JSON.stringify(encryptedData)
    const blob = new Blob([encryptedJson], { type: 'application/json' })
    
    return new File([blob], filename, { 
        type: 'application/json',
        lastModified: Date.now()
    })
}

/**
 * Decrypts a downloaded encrypted file back to original image
 */
export async function decryptDownloadedFile(encryptedFile: Blob): Promise<Buffer> {
    const jsonText = await encryptedFile.text()
    const encryptedData: EncryptedData = JSON.parse(jsonText)
    
    return decryptImageData(encryptedData)
}

interface FileMetadata {
    name: string
    type: string
    size: number
    lastModified: number
}

function getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg', 
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    }
    return mimeToExt[mimeType] || 'png'
}

/**
 * Generates a secure filename that doesn't reveal the original content
 */
export function generateSecureFilename(questionId: string): string {
    const timestamp = Date.now()
    const random = crypto.randomBytes(8).toString('hex')
    return `${questionId}_${timestamp}_${random}.enc`
}