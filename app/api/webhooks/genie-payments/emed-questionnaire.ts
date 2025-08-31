import { createServiceRoleClient } from '@/lib/supabase/server'
import { medplumService } from '@/lib/emed/emed-service'
import { getDecryptedImageAsBase64FromSupabase } from '@/lib/storage/encrypted-image-retrieval'

export async function submitQuestionnaireToEmed(userId: string, cartItems: any[], orderId?: string): Promise<void> {
    console.log('📋 Submitting questionnaire to emed for user:', userId)

    const supabase = createServiceRoleClient()

    const healthVerticals = await getHealthVerticalsFromCart(cartItems)
    console.log('🏥 Detected health verticals:', healthVerticals)

    if (healthVerticals.length === 0) {
        console.warn('⚠️ No health verticals detected from cart items')
        return
    }

    // Get user profile to access emed_patient_id
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('emed_patient_id')
        .eq('id', userId)
        .single()

    if (profileError || !profile?.emed_patient_id) {
        console.warn('⚠️ No emed_patient_id found for user:', userId)
        return
    }

    const emed_patient_id = profile.emed_patient_id

    for (const healthVertical of healthVerticals) {
        try {
            console.log(`📋 Processing questionnaire for ${healthVertical}`)
            
            const { data: userResponse } = await supabase
                .from('user_responses')
                .select(`
                    responses,
                    questionnaires!inner(
                        health_verticals!inner(slug)
                    )
                `)
                .eq('user_id', userId)
                .eq('questionnaires.health_verticals.slug', healthVertical)
                .order('completed_at', { ascending: false })
                .limit(1)
                .single()

            if (!userResponse?.responses) {
                console.warn(`⚠️ No questionnaire responses found for ${healthVertical}`)
                continue
            }

            const { data: questions } = await supabase
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
                .eq('questionnaires.health_verticals.slug', healthVertical)
                .order('order_index', { ascending: true })

            if (!questions || questions.length === 0) {
                console.warn(`⚠️ No questions found for ${healthVertical}`)
                continue
            }

            console.log('🔍 DEBUG: User responses before photo extraction:', JSON.stringify(userResponse.responses, null, 2))
            const photos = await extractPhotosFromResponses(userResponse.responses, supabase)
            console.log('📸 DEBUG: Extracted photos:', photos.length, 'photos found')
            
            // Convert encrypted photos to base64 data for emed using decryption service
            const photosWithData = await Promise.all(photos.map(async (photo, index) => {
                try {
                    // Extract the storage path from the URL or use the original supabasePath if available
                    const storagePath = photo.supabasePath || photo.url.split('/').pop()
                    console.log(`📸 DEBUG: Downloading and decrypting image ${index + 1}/${photos.length} from storage path:`, storagePath)
                    
                    // Download and decrypt the image using the dedicated service
                    const base64 = await getDecryptedImageAsBase64FromSupabase(storagePath)
                    
                    console.log(`📸 DEBUG: Decrypted and converted image ${index + 1} to base64, size: ${Math.round(base64.length * 0.75 / 1024)}KB`)
                    
                    return {
                        ...photo,
                        dataBase64: base64,
                        size: Buffer.from(base64, 'base64').length
                    }
                } catch (error) {
                    console.error(`📸 ERROR: Failed to download/decrypt image ${index + 1}:`, error)
                    return null
                }
            }))
            
            const validPhotos = photosWithData.filter(photo => photo !== null)
            console.log('📸 DEBUG: Successfully converted', validPhotos.length, 'photos to base64')
            
            // Get cart items for this specific health vertical
            const verticalCartItems = await getCartItemsForHealthVertical(cartItems, healthVertical, supabase)

            console.log(`🛒 Found ${verticalCartItems.length} cart items for ${healthVertical}`)
            
            const result = await medplumService.saveQuestionnaireAndCart(
                emed_patient_id,
                validPhotos,
                {
                    quizResponses: userResponse.responses,
                    questions: questions
                },
                verticalCartItems.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.productName
                })),
                healthVertical,
                orderId
            )

            if (result.success) {
                console.log(`✅ ${healthVertical} questionnaire submitted to emed successfully`)
            } else {
                console.error(`❌ ${healthVertical} emed submission failed:`, result.error)
            }

        } catch (error) {
            console.error(`❌ Error submitting ${healthVertical} questionnaire:`, error)
        }
    }
}

async function getHealthVerticalsFromCart(cartItems: any[]): Promise<string[]> {
    const supabase = createServiceRoleClient()
    
    const productIds = [...new Set(cartItems.map(item => item.product_id))]
    
    const { data: productMetadata, error } = await supabase
        .from('product_metadata')
        .select(`
            genie_product_id,
            health_verticals!inner(slug)
        `)
        .in('genie_product_id', productIds)
    
    if (error || !productMetadata) {
        console.error('Error fetching product metadata:', error)
        return ['hair-loss']
    }
    
    const verticals = [...new Set(
        productMetadata.map((item: any) => item.health_verticals.slug)
    )] as string[]
    
    return verticals.length > 0 ? verticals : ['hair-loss']
}

async function getCartItemsForHealthVertical(cartItems: any[], healthVertical: string, supabase: any): Promise<any[]> {
    const productIds = cartItems.map(item => item.product_id)
    
    const { data: productMetadata, error } = await supabase
        .from('product_metadata')
        .select(`
            genie_product_id,
            health_verticals!inner(slug)
        `)
        .in('genie_product_id', productIds)
        .eq('health_verticals.slug', healthVertical)
    
    if (error || !productMetadata) {
        console.error('Error fetching product metadata for health vertical:', error)
        return []
    }
    
    const healthVerticalProductIds = new Set(
        productMetadata.map((item: any) => item.genie_product_id)
    )
    
    return cartItems.filter(item => healthVerticalProductIds.has(item.product_id))
}

async function extractPhotosFromResponses(responses: Record<string, any>, supabase: any): Promise<any[]> {
    const photos: any[] = []
    
    console.log('📸 DEBUG: Starting photo extraction from responses...')
    console.log('📸 DEBUG: Total response entries:', Object.keys(responses).length)
    
    for (const [questionId, response] of Object.entries(responses)) {
        console.log(`📸 DEBUG: Processing questionId: ${questionId}, response type: ${typeof response}, value:`, response)
        
        if (Array.isArray(response)) {
            console.log(`📸 DEBUG: Found array response with ${response.length} items`)
            for (const [index, item] of response.entries()) {
                console.log(`📸 DEBUG: Array item ${index}: type=${typeof item}, value=${item}`)
                
                // Handle image_reference objects
                if (typeof item === 'object' && item !== null && item.type === 'image_reference' && item.supabasePath) {
                    console.log(`📸 DEBUG: Found image_reference object with supabasePath: ${item.supabasePath}`)
                    const { data } = supabase.storage
                        .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                        .getPublicUrl(item.supabasePath)
                    
                    console.log(`📸 DEBUG: Generated public URL for image_reference:`, data?.publicUrl)
                    if (data?.publicUrl) {
                        const photo = {
                            questionId: questionId,
                            description: `${questionId}_${index}`,
                            url: data.publicUrl,
                            contentType: item.metadata?.fileType || 'image/jpeg',
                            originalName: item.metadata?.name,
                            imageId: item.imageId,
                            supabasePath: item.supabasePath
                        }
                        photos.push(photo)
                        console.log(`📸 DEBUG: Added photo from image_reference:`, photo)
                    }
                }
            }
        } else if (typeof response === 'object' && response !== null && response.type === 'image_reference' && response.supabasePath) {
            console.log(`📸 DEBUG: Found image_reference object with supabasePath: ${response.supabasePath}`)
            const { data } = supabase.storage
                .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                .getPublicUrl(response.supabasePath)
            
            console.log(`📸 DEBUG: Generated public URL for image_reference:`, data?.publicUrl)
            if (data?.publicUrl) {
                const photo = {
                    questionId: questionId,
                    description: questionId,
                    url: data.publicUrl,
                    contentType: response.metadata?.fileType || 'image/jpeg',
                    originalName: response.metadata?.name,
                    imageId: response.imageId,
                    supabasePath: response.supabasePath
                }
                photos.push(photo)
                console.log(`📸 DEBUG: Added photo from image_reference:`, photo)
            }
        } else {
            console.log(`📸 DEBUG: Response does not match photo criteria - type: ${typeof response}, is image_reference: ${typeof response === 'object' && response !== null && response.type === 'image_reference'}`)
        }
    }
    
    console.log(`📸 DEBUG: Photo extraction complete. Total photos found: ${photos.length}`)
    return photos
}