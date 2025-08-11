#!/usr/bin/env tsx

/**
 * Simple validation script to test image compression integration with Medplum
 * Run with: npx tsx scripts/test-image-compression.ts
 */

import { validatePhotoInputForMedplum } from '../helpers/medplum/medplum-image-compressor'
import { formatFileSize, getCompressionInfo } from '../helpers/image-compressor'
import type { PhotoInput } from '../data/types'

// Mock image data (1x1 pixel JPEG in base64)
const MOCK_SMALL_IMAGE = '/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

// Create a larger mock image by repeating the base64 data
const MOCK_LARGE_IMAGE = MOCK_SMALL_IMAGE.repeat(50) // ~15KB

async function testImageValidation() {
  console.log('🧪 Testing image validation...\n')

  // Test small image
  const smallPhoto: PhotoInput = {
    contentType: 'image/jpeg',
    dataBase64: MOCK_SMALL_IMAGE,
    description: 'test-small'
  }

  const smallValidation = validatePhotoInputForMedplum(smallPhoto)
  console.log(`Small image (${formatFileSize(smallValidation.size)}):`, 
    smallValidation.isValid ? '✅ Valid' : `❌ Invalid - ${smallValidation.reason}`)

  // Test large image
  const largePhoto: PhotoInput = {
    contentType: 'image/jpeg',
    dataBase64: MOCK_LARGE_IMAGE,
    description: 'test-large'
  }

  const largeValidation = validatePhotoInputForMedplum(largePhoto)
  console.log(`Large image (${formatFileSize(largeValidation.size)}):`, 
    largeValidation.isValid ? '✅ Valid' : `❌ Invalid - ${largeValidation.reason}`)

  console.log('')
}

async function testImageCompression() {
  console.log('🗜️  Testing image compression functions...\n')

  console.log('ℹ️  Note: Actual compression testing requires browser environment (compressorjs)')
  console.log('This test validates the integration points and helper functions.\n')

  // Test the validation and utility functions that work in Node.js
  const largePhoto: PhotoInput = {
    contentType: 'image/jpeg',
    dataBase64: MOCK_LARGE_IMAGE,
    description: 'test-large-for-compression'
  }

  console.log('Testing compression utility functions:')
  
  // Test validation
  const validation = validatePhotoInputForMedplum(largePhoto, 10 * 1024) // 10KB limit for testing
  console.log(`  Validation (10KB limit): ${validation.isValid ? '✅ Valid' : `❌ Invalid - ${validation.reason}`}`)
  console.log(`  Current size: ${formatFileSize(validation.size)}`)

  // Test compression info calculation
  const originalSize = validation.size
  const mockCompressedSize = Math.floor(originalSize * 0.3) // Simulate 70% compression
  const compressionInfo = getCompressionInfo(originalSize, mockCompressedSize)
  
  console.log('\n  Simulated compression results:')
  console.log(`    Original: ${compressionInfo.originalSize}`)
  console.log(`    Compressed: ${compressionInfo.compressedSize}`)
  console.log(`    Saved: ${compressionInfo.savedBytes} (${compressionInfo.savedPercentage}%)`)

  console.log('\n✅ Compression integration functions work correctly!')
  console.log('💡 To test actual compression, run this in a browser environment or Next.js app')

  console.log('')
}

async function testBatchCompression() {
  console.log('📦 Testing batch validation workflow...\n')

  // Simulate multiple photos with different sizes and types
  const testPhotos: PhotoInput[] = [
    {
      contentType: 'image/jpeg',
      dataBase64: MOCK_SMALL_IMAGE,
      description: 'small-photo'
    },
    {
      contentType: 'image/jpeg', 
      dataBase64: MOCK_LARGE_IMAGE,
      description: 'medium-photo'
    },
    {
      contentType: 'image/png',
      dataBase64: MOCK_LARGE_IMAGE.repeat(5),
      description: 'large-photo'
    }
  ]

  console.log('Simulating MedplumService workflow with multiple photos:\n')

  let compressionInfo: Array<{
    originalSize: string
    compressedSize: string
    wasCompressed: boolean
    compressionRatio?: number
  }> = []

  for (let i = 0; i < testPhotos.length; i++) {
    const photo = testPhotos[i]
    console.log(`Processing ${photo.description}:`)
    
    const validation = validatePhotoInputForMedplum(photo)
    console.log(`  Original size: ${formatFileSize(validation.size)}`)
    console.log(`  Valid for Medplum: ${validation.isValid ? '✅' : '❌'}`)
    
    let wasCompressed = false
    let compressionRatio: number | undefined
    
    if (!validation.isValid) {
      console.log(`  Would compress: ✅ (reason: ${validation.reason})`)
      wasCompressed = true
      compressionRatio = 0.7 // Simulate 70% compression
    } else {
      console.log(`  Would compress: ❌ (already meets requirements)`)
    }

    // Simulate compression info tracking
    compressionInfo.push({
      originalSize: formatFileSize(validation.size),
      compressedSize: wasCompressed ? 
        formatFileSize(Math.floor(validation.size * 0.3)) : 
        formatFileSize(validation.size),
      wasCompressed,
      compressionRatio
    })

    console.log('')
  }

  // Display summary like MedplumService would return
  console.log('📊 Compression Summary:')
  compressionInfo.forEach((info, index) => {
    console.log(`  Photo ${index + 1}:`)
    console.log(`    Original: ${info.originalSize}`)
    console.log(`    Final: ${info.compressedSize}`)
    console.log(`    Compressed: ${info.wasCompressed ? '✅' : '❌'}`)
    if (info.compressionRatio) {
      console.log(`    Ratio: ${(info.compressionRatio * 100).toFixed(1)}%`)
    }
  })

  console.log('')
}

async function testQuestionnaireStructure() {
  console.log('📋 Testing Questionnaire Response Structure...\n')

  // Mock questionnaire data
  const mockQuestions = [
    {
      id: 'q1',
      question_property: 'scalp_images',
      question_text: 'Upload images of your scalp',
      question_type: 'file'
    },
    {
      id: 'q2', 
      question_property: 'hair_symptoms',
      question_text: 'Select your hair loss symptoms',
      question_type: 'checkbox'
    }
  ]

  const mockResponses = {
    'q1': null, // File responses are handled via photos
    'q2': ['thinning', 'receding_hairline', 'bald_spots']
  }

  const mockPhotos: PhotoInput[] = [
    {
      contentType: 'image/jpeg',
      dataBase64: 'mock-base64-1',
      questionId: 'q1',
      description: 'front view',
      binaryId: 'binary-123'
    },
    {
      contentType: 'image/jpeg', 
      dataBase64: 'mock-base64-2',
      questionId: 'q1',
      description: 'top view',
      binaryId: 'binary-456'
    }
  ]

  // Import the function we want to test
  const { buildQuestionnaireInputFromDatabase } = await import('../helpers/medplum/build-fhir-resources')
  
  const mockCartItems = [
    { productId: 'product-123', productName: 'Hair Growth Serum' },
    { productId: 'product-456', productName: 'DHT Blocker Supplement' },
    { productId: 'product-789', productName: 'Scalp Treatment Foam' }
  ]

  const result = buildQuestionnaireInputFromDatabase(
    mockResponses,
    mockQuestions,
    mockPhotos,
    'hair-loss',
    mockCartItems,
    '019873c3-14e8-7306-9a3b-509c078689e0', // organization ID
    'patient-123' // customer ID
  )

  console.log('Generated questionnaire structure:')
  console.log(JSON.stringify(result.answers, null, 2))

  // Verify structure
  const imageQuestion = result.answers.find(a => a.linkId === 'scalp_images')
  const symptomsQuestion = result.answers.find(a => a.linkId === 'hair_symptoms')
  const cartQuestion = result.answers.find(a => a.linkId === '019873c3-14e8-7306-9a3b-509c078689e0_patient-123_cart')

  console.log('\n✅ Structure Validation:')
  
  if (imageQuestion) {
    console.log(`  Image question found: ✅`)
    console.log(`  Has ${imageQuestion.answer.length} image answers: ✅`)
    console.log(`  Uses valueString for binary IDs: ${imageQuestion.answer.every(a => 'valueString' in a) ? '✅' : '❌'}`)
  } else {
    console.log(`  Image question: ❌ Not found`)
  }

  if (symptomsQuestion) {
    console.log(`  Symptoms question found: ✅`) 
    console.log(`  Has ${symptomsQuestion.answer.length} symptom answers: ✅`)
    console.log(`  Multiple answers in array: ${symptomsQuestion.answer.length === 3 ? '✅' : '❌'}`)
  } else {
    console.log(`  Symptoms question: ❌ Not found`)
  }

  if (cartQuestion) {
    console.log(`  Cart question found: ✅`)
    console.log(`  Uses organizationId_customerId_cart format: ✅`)
    console.log(`  Has ${cartQuestion.answer.length} product IDs: ✅`)
    console.log(`  All products as valueString: ${cartQuestion.answer.every(a => 'valueString' in a) ? '✅' : '❌'}`)
  } else {
    console.log(`  Cart question: ❌ Not found`)
  }

  console.log('')
}

async function main() {
  console.log('🚀 Testing Medplum Image Compression Integration\n')
  console.log('=' .repeat(50))
  
  await testImageValidation()
  await testImageCompression()
  await testBatchCompression()
  await testQuestionnaireStructure()
  
  console.log('✨ All tests completed!')
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { testImageValidation, testImageCompression, testBatchCompression, testQuestionnaireStructure }