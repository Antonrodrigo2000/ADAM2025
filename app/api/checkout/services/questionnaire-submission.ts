import { createClient } from '@/lib/supabase/server'
import type { CheckoutRequest } from './validation'
import { medplumService } from '@/helpers/medplum/emed'
import type { PhotoInput } from '@/data/types'

/**
 * Submit questionnaire and cart data to eMed system
 */
export async function submitQuestionnaireAndCart(
    patientId: string, 
    checkoutData: CheckoutRequest
): Promise<void> {
    try {
        const quizResponses = getQuizDataFromCheckout(checkoutData)
        
        if (!quizResponses || Object.keys(quizResponses).length === 0) {
            return
        }

        // Get questions from database to map question properties and text
        const supabase = await createClient()
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select(`
                id,
                question_property,
                question_text,
                question_type,
                questionnaires!inner(
                    health_verticals!inner(slug)
                )
            `)
            .eq('questionnaires.health_verticals.slug', 'hair-loss')
            .order('order_index', { ascending: true })

        if (questionsError) {
            throw new Error(`Failed to fetch questions: ${questionsError.message}`)
        }

        if (!questions || questions.length === 0) {
            return
        }

        // Convert quiz responses to photos array for binary creation
        const photos: PhotoInput[] = await extractPhotosFromQuizResponses(quizResponses)

        // Use the saveQuestionnaireAndCart method
        const response = await medplumService.saveQuestionnaireAndCart(
            patientId,
            photos,
            { quizResponses, questions },
            checkoutData.cartItems
        )

        if (!response.success) {
            throw new Error(response.error || 'Failed to submit questionnaire')
        }

    } catch (error) {
        // Don't throw the error to avoid breaking the checkout flow
        // The patient creation was successful, questionnaire submission is supplementary
    }
}

/**
 * Extract quiz data from checkout request
 */
function getQuizDataFromCheckout(checkoutData: CheckoutRequest): Record<string, any> | null {
    return checkoutData.quizResponses || null
}

/**
 * Extract photos from quiz responses and convert to PhotoInput format
 */
async function extractPhotosFromQuizResponses(quizResponses: Record<string, any>): Promise<PhotoInput[]> {
    const photos: PhotoInput[] = []
    
    for (const [questionId, response] of Object.entries(quizResponses)) {
        if (Array.isArray(response)) {
            // Handle array of responses (could include images)
            for (const [index, item] of response.entries()) {
                if (isImageResponse(item)) {
                    const photo = await convertToPhotoInput(item, `${questionId}_${index}`)
                    if (photo) photos.push(photo)
                }
            }
        } else if (isImageResponse(response)) {
            // Handle single image response
            const photo = await convertToPhotoInput(response, questionId)
            if (photo) photos.push(photo)
        }
    }
    
    return photos
}

/**
 * Check if a response contains image data
 */
function isImageResponse(response: any): boolean {
    // Check for image reference from IndexedDB
    if (response?.type === 'image_reference') {
        return true
    }
    
    // Check for base64 image data
    if (typeof response === 'string' && response.startsWith('data:image/')) {
        return true
    }
    
    // Check for file object with image data
    if (response && typeof response === 'object' && 
        response.name && response.type && response.data &&
        typeof response.type === 'string' && response.type.startsWith('image/') &&
        typeof response.data === 'string' && response.data.startsWith('data:image/')) {
        return true
    }
    
    return false
}

/**
 * Convert image response to PhotoInput format
 */
async function convertToPhotoInput(imageResponse: any, description: string): Promise<PhotoInput | null> {
    try {
        if (imageResponse?.type === 'image_reference') {
            // Image references should be resolved on the client side before sending to server
            return null
        }
        
        if (typeof imageResponse === 'string' && imageResponse.startsWith('data:image/')) {
            // Extract content type and base64 data
            const [header, base64Data] = imageResponse.split(',')
            const contentType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg'
            
            return {
                contentType,
                dataBase64: base64Data,
                description
            }
        }
        
        if (imageResponse && typeof imageResponse === 'object' && 
            imageResponse.name && imageResponse.type && imageResponse.data) {
            // Extract base64 data from file object
            const [, base64Data] = imageResponse.data.split(',')
            
            return {
                contentType: imageResponse.type,
                dataBase64: base64Data,
                description: `${description} - ${imageResponse.name}`
            }
        }
        
        return null
    } catch (error) {
        return null
    }
}