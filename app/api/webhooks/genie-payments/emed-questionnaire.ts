import { createServiceRoleClient } from '@/lib/supabase/server'
import { medplumService } from '@/lib/emed/emed-service'

export async function submitQuestionnaireToEmed(userId: string, cartItems: any[]): Promise<void> {
    console.log('📋 Submitting questionnaire to emed for user:', userId)

    const supabase = createServiceRoleClient()

    const healthVerticals = await getHealthVerticalsFromCart(cartItems)
    console.log('🏥 Detected health verticals:', healthVerticals)

    if (healthVerticals.length === 0) {
        console.warn('⚠️ No health verticals detected from cart items')
        return
    }

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

            const photos = await extractPhotosFromResponses(userResponse.responses, supabase)
            
            const verticalCartItems = cartItems.filter(item => 
                item.health_vertical_slug === healthVertical
            )

            const result = await medplumService.saveQuestionnaireAndCart(
                userId,
                photos,
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
                healthVertical
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

async function extractPhotosFromResponses(responses: Record<string, any>, supabase: any): Promise<any[]> {
    const photos: any[] = []
    
    for (const [questionId, response] of Object.entries(responses)) {
        if (Array.isArray(response)) {
            for (const [index, item] of response.entries()) {
                if (typeof item === 'string' && item.includes('storage/')) {
                    const { data } = supabase.storage
                        .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                        .getPublicUrl(item)
                    
                    if (data?.publicUrl) {
                        photos.push({
                            questionId: questionId,
                            description: `${questionId}_${index}`,
                            url: data.publicUrl,
                            contentType: 'image/jpeg'
                        })
                    }
                }
            }
        } else if (typeof response === 'string' && response.includes('storage/')) {
            const { data } = supabase.storage
                .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                .getPublicUrl(response)
            
            if (data?.publicUrl) {
                photos.push({
                    questionId: questionId,
                    description: questionId,
                    url: data.publicUrl,
                    contentType: 'image/jpeg'
                })
            }
        }
    }
    
    return photos
}