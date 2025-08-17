/**
 * Get environment-specific image URL
 */
export function getEnvironmentImageUrl(imagePath: string): string {
  // If already a full URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // Check custom environment variable first, then fall back to NODE_ENV
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV
  const isProduction = environment === 'production'
  
  if (isProduction) {
    // Production: dialog-production, simple format
    return `https://res.cloudinary.com/dialog-production/image/upload/${imagePath}`
  } else {
    // Development/Staging: pomelo-pay with version and .jpg
    return `https://res.cloudinary.com/pomelo-pay/image/upload/v1755423869/${imagePath}.jpg`
  }
}

/**
 * Process array of image URLs for environment-specific URLs
 */
export function processImageUrls(imageUrls: string[]): string[] {
  return imageUrls.map(url => getEnvironmentImageUrl(url))
}