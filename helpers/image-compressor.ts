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
 * Compress an image file to approximately 100KB
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

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      maxWidth,
      maxHeight,
      quality,
      mimeType,
      success: (compressedFile) => {
        // If the file is still too large, compress further
        if (compressedFile.size > targetSize) {
          const newQuality = Math.max(0.1, quality * (targetSize / compressedFile.size))
          
          new Compressor(file, {
            maxWidth,
            maxHeight,
            quality: newQuality,
            mimeType,
            success: (finalFile) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                // const dataBase64 = dataUrl.split(',')[1]
                
                resolve({
                  file: finalFile as File,
                  originalSize: file.size,
                  compressedSize: finalFile.size,
                  compressionRatio: (file.size - finalFile.size) / file.size,
                  dataUrl
                })
              }
              reader.readAsDataURL(finalFile)
            },
            error: reject
          })
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            // const dataBase64 = dataUrl.split(',')[1]
            
            resolve({
              file: compressedFile as File,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: (file.size - compressedFile.size) / file.size,
              dataUrl
            })
          }
          reader.readAsDataURL(compressedFile)
        }
      },
      error: reject
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