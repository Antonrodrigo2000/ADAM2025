import { compressImage, type CompressionOptions, type CompressionResult } from '@/helpers/image-compressor'
import type { PhotoInput } from '@/data/types'

export interface MedplumCompressionOptions extends CompressionOptions {
    /** Maximum file size for Medplum Binary resources (default: 100KB) */
    medplumMaxSize?: number
    /** Whether to validate the compressed image meets Medplum requirements */
    validateForMedplum?: boolean
}

export interface MedplumCompressionResult extends CompressionResult {
    /** Photo input ready for Medplum Binary resource creation */
    photoInput: PhotoInput
    /** Whether the image meets Medplum size requirements */
    meetsRequirements: boolean
}

/**
 * Compress image specifically for Medplum Binary resource creation
 * Ensures the image is under 100KB and properly formatted for FHIR
 */
export async function compressImageForMedplum(
    file: File,
    description?: string,
    options: MedplumCompressionOptions = {}
): Promise<MedplumCompressionResult> {
    const {
        medplumMaxSize = 100 * 1024, // 100KB default
        validateForMedplum = true,
        ...compressionOptions
    } = options

    // Set target size to medplumMaxSize if not specified
    const finalOptions: CompressionOptions = {
        targetSize: medplumMaxSize,
        ...compressionOptions
    }

    // Compress the image
    const compressionResult = await compressImage(file, finalOptions)

    // Extract base64 data from data URL
    const dataBase64 = compressionResult.dataUrl.split(',')[1]
    if (!dataBase64) {
        throw new Error('Failed to extract base64 data from compressed image')
    }

    // Create PhotoInput for Medplum
    const photoInput: PhotoInput = {
        contentType: compressionResult.file.type,
        dataBase64,
        description
    }

    // Validate for Medplum requirements
    let meetsRequirements = true
    if (validateForMedplum) {
        // Check file size (base64 is ~33% larger than binary)
        const approximateBinarySize = dataBase64.length * 0.75
        meetsRequirements = approximateBinarySize <= medplumMaxSize

        // Check content type is supported
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!supportedTypes.includes(photoInput.contentType)) {
            meetsRequirements = false
        }
    }

    return {
        ...compressionResult,
        photoInput,
        meetsRequirements
    }
}

/**
 * Compress multiple images for Medplum Binary resource creation
 */
export async function compressImagesForMedplum(
    files: File[],
    descriptions?: string[],
    options: MedplumCompressionOptions = {}
): Promise<MedplumCompressionResult[]> {
    const results = await Promise.all(
        files.map((file, index) =>
            compressImageForMedplum(
                file,
                descriptions?.[index],
                options
            )
        )
    )
    return results
}

/**
 * Convert existing PhotoInput to compressed version
 * Useful when you have a PhotoInput from form data that needs compression
 */
export async function compressExistingPhotoInput(
    photoInput: PhotoInput,
    options: MedplumCompressionOptions = {}
): Promise<MedplumCompressionResult> {
    // Convert base64 back to File for compression
    const dataUrl = `data:${photoInput.contentType};base64,${photoInput.dataBase64}`
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], 'image', { type: photoInput.contentType })

    return compressImageForMedplum(file, photoInput.description, options)
}

/**
 * Validate if PhotoInput meets Medplum requirements without compression
 */
export function validatePhotoInputForMedplum(
    photoInput: PhotoInput,
    maxSize: number = 100 * 1024
): { isValid: boolean; reason?: string; size: number } {
    // Calculate approximate binary size from base64
    const size = photoInput.dataBase64.length * 0.75

    if (size > maxSize) {
        return {
            isValid: false,
            reason: `File size (${Math.round(size / 1024)}KB) exceeds maximum (${Math.round(maxSize / 1024)}KB)`,
            size
        }
    }

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!supportedTypes.includes(photoInput.contentType)) {
        return {
            isValid: false,
            reason: `Unsupported content type: ${photoInput.contentType}`,
            size
        }
    }

    return { isValid: true, size }
}