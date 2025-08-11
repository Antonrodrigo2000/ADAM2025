import Compressor from 'compressorjs'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  targetSize?: number // in bytes, default 100KB
  mimeType?: string
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dataUrl: string
}

/**
 * Compress an image file to approximately target size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    targetSize = 100 * 1024, // 100KB
    mimeType = 'image/jpeg'
  } = options

  // Validate input file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  return new Promise((resolve, reject) => {
    const compressWithOptions = (compressionQuality: number) => {
      new Compressor(file, {
        maxWidth,
        maxHeight,
        quality: compressionQuality,
        mimeType,
        success: (compressedFile) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            
            resolve({
              file: compressedFile as File,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: (file.size - compressedFile.size) / file.size,
              dataUrl
            })
          }
          reader.onerror = () => reject(new Error('Failed to read compressed file'))
          reader.readAsDataURL(compressedFile)
        },
        error: (error) => reject(new Error(`Compression failed: ${error.message || error}`))
      })
    }

    // First attempt with original quality
    new Compressor(file, {
      maxWidth,
      maxHeight,
      quality,
      mimeType,
      success: (compressedFile) => {
        // If the file is still too large, try with reduced quality
        if (compressedFile.size > targetSize) {
          const newQuality = Math.max(0.1, quality * (targetSize / compressedFile.size) * 0.9) // 0.9 buffer
          compressWithOptions(newQuality)
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            
            resolve({
              file: compressedFile as File,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: (file.size - compressedFile.size) / file.size,
              dataUrl
            })
          }
          reader.onerror = () => reject(new Error('Failed to read compressed file'))
          reader.readAsDataURL(compressedFile)
        }
      },
      error: (error) => reject(new Error(`Initial compression failed: ${error.message || error}`))
    })
  })
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const results = await Promise.all(
    files.map(file => compressImage(file, options))
  )
  return results
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get compression info for display
 */
export function getCompressionInfo(originalSize: number, compressedSize: number) {
  const savedBytes = originalSize - compressedSize
  const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1)
  
  return {
    originalSize: formatFileSize(originalSize),
    compressedSize: formatFileSize(compressedSize),
    savedBytes: formatFileSize(savedBytes),
    savedPercentage
  }
}

/**
 * Check if file needs compression based on target size
 */
export function needsCompression(file: File, targetSize: number = 100 * 1024): boolean {
  return file.size > targetSize
}

/**
 * Get optimal compression settings based on original file size
 */
export function getOptimalCompressionOptions(
  originalSize: number, 
  targetSize: number = 100 * 1024
): CompressionOptions {
  const ratio = targetSize / originalSize
  
  if (ratio >= 0.8) {
    // File is close to target size, minimal compression needed
    return {
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1080,
      targetSize
    }
  } else if (ratio >= 0.5) {
    // Moderate compression needed
    return {
      quality: 0.7,
      maxWidth: 1600,
      maxHeight: 900,
      targetSize
    }
  } else if (ratio >= 0.2) {
    // Significant compression needed
    return {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 800,
      targetSize
    }
  } else {
    // Heavy compression needed
    return {
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 600,
      targetSize
    }
  }
} 