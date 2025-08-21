import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GeniePaymentService } from '@/lib/services/genie-payment-service'
import { medplumService } from '@/lib/emed/emed-service'
import crypto from 'crypto'

interface GenieWebhookData {
    eventType: 'NOTIFY_TOKENISATION_STATUS' | 'NOTIFY_TRANSACTION_CHANGE'
    customerId?: string
    transactionId?: string
    tokenisationStatus?: 'TOKENISATION_SUCCESS' | 'TOKENISATION_FAILED'
    state?: 'INITIATED' | 'QR_CODE_GENERATED' | 'CONFIRMED' | 'VOIDED' | 'FAILED' | 'CANCELLED'
    amount?: number
    currency?: string
    provider?: string
    created?: string
    updated?: string
}

interface GenieTokenizationWebhook extends GenieWebhookData {
    eventType: 'NOTIFY_TOKENISATION_STATUS'
    customerId: string
    transactionId: string
    tokenisationStatus: 'TOKENISATION_SUCCESS' | 'TOKENISATION_FAILED'
}

interface GenieTransactionWebhook extends GenieWebhookData {
    eventType: 'NOTIFY_TRANSACTION_CHANGE'
    transactionId: string
    state: 'INITIATED' | 'QR_CODE_GENERATED' | 'CONFIRMED' | 'VOIDED' | 'FAILED' | 'CANCELLED'
    localId?: string
}

interface ConsultationOrderData {
    userId: string
    cartItems: any[]
    paymentMethodId: string
    deliveryAddress: any
    consultationTransactionId: string
    paymentMetadata: any
    sessionId: string
}

function verifyWebhookSignature(headers: Headers, body: string): boolean {
    try {
        const nonce = headers.get('X-Signature-Nonce')
        const timestamp = headers.get('X-Signature-Timestamp')
        const signature = headers.get('X-Signature')
        const apiKey = process.env.GENIE_BUSINESS_API_KEY

        if (!nonce || !timestamp || !signature || !apiKey) {
            console.log('Missing signature headers or API key')
            return false
        }

        const signString = `${nonce}${timestamp}${apiKey}`
        const generatedSignature = crypto.createHash('sha256').update(signString).digest('hex')

        return signature === generatedSignature
    } catch (error) {
        console.error('Error verifying webhook signature:', error)
        return false
    }
}

async function handleTokenizationWebhook(data: GenieTokenizationWebhook): Promise<void> {
    if (data.tokenisationStatus !== 'TOKENISATION_SUCCESS') {
        console.log('Tokenization failed for customer:', data.customerId)
        return
    }

    try {
        const supabase = createServiceRoleClient()

        // Find the user by genie_customer_id
        const { data: userProfile, error: userError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('genie_customer_id', data.customerId)
            .single()

        if (userError || !userProfile) {
            console.error('User not found for genie customer ID:', data.customerId, userError)
            return
        }

        // Get the tokens for this customer from Genie
        const tokensResult = await GeniePaymentService.getCustomerTokens(data.customerId)

        if (!tokensResult.success || !tokensResult.tokens) {
            console.error('Failed to fetch customer tokens:', tokensResult.error)
            return
        }

        // Process each token
        for (const token of tokensResult.tokens) {
            // Check if we already have this token stored
            const { data: existingPaymentMethod } = await supabase
                .from('user_payment_methods')
                .select('id')
                .eq('payment_token', token.token)
                .eq('user_id', userProfile.id)
                .single()

            if (!existingPaymentMethod) {
                // Extract last 4 digits from padded card number (format: 5444******5118)
                const last4 = token.paddedCardNumber.slice(-4)

                // Convert 2-digit year to 4-digit year (25 -> 2025)
                const twoDigitYear = parseInt(token.tokenExpiryYear)
                const currentYear = new Date().getFullYear()
                const currentCentury = Math.floor(currentYear / 100) * 100

                // If 2-digit year is less than current year's last 2 digits, assume next century
                let fullYear = currentCentury + twoDigitYear
                if (twoDigitYear < (currentYear % 100)) {
                    fullYear += 100
                }

                console.log('Converting expiry year:', {
                    tokenExpiryYear: token.tokenExpiryYear,
                    twoDigitYear,
                    fullYear,
                    currentYear
                })

                // Insert new payment method
                const { error: insertError } = await supabase
                    .from('user_payment_methods')
                    .insert({
                        user_id: userProfile.id,
                        payment_token: token.token,
                        gateway_provider: 'genie_business',
                        card_last_four: last4,
                        card_brand: token.brand.toLowerCase(),
                        expiry_month: parseInt(token.tokenExpiryMonth),
                        expiry_year: fullYear,
                        is_default: token.defaultToken,
                        is_active: true,
                        gateway_metadata: {
                            genie_token_id: token.id,
                            genie_customer_id: data.customerId,
                            token_type: token.tokenType,
                            provider: token.provider,
                            created_at: token.createdAt,
                            updated_at: token.updatedAt
                        }
                    })

                if (insertError) {
                    console.error('Error inserting payment method:', insertError)
                } else {
                    console.log('Successfully stored payment method for user:', userProfile.id)
                }
            }
        }
    } catch (error) {
        console.error('Error handling tokenization webhook:', error)
    }
}

async function handleTransactionWebhook(data: GenieTransactionWebhook): Promise<void> {
    console.log('Transaction state changed:', data.transactionId, data.state)

    const supabase = createServiceRoleClient()

    switch (data.state) {
        case 'CONFIRMED':
            console.log('✅ Payment confirmed for transaction:', data.transactionId)
            await handlePaymentConfirmed(supabase, data)
            break

        case 'VOIDED':
            console.log('⚡ Payment voided for transaction:', data.transactionId)
            await handlePaymentVoided(supabase, data)
            break

        case 'CANCELLED':
            console.log('❌ Payment cancelled for transaction:', data.transactionId)
            await handlePaymentCancelled(supabase, data)
            break

        case 'FAILED':
            console.log('🚫 Payment failed for transaction:', data.transactionId)
            await handlePaymentFailed(supabase, data)
            break

        case 'INITIATED':
            console.log('🔄 Payment initiated for transaction:', data.transactionId)
            // Payment started, user is in payment flow - no action needed
            break

        case 'QR_CODE_GENERATED':
            console.log('📱 QR code generated for transaction:', data.transactionId)
            // For QR-based payments - no action needed
            break

        default:
            console.log('❓ Unknown transaction state:', data.state, 'for transaction:', data.transactionId)
    }
}

async function handlePaymentConfirmed(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        // Check if this is a consultation payment
        if (data.localId?.startsWith('consul_')) {
            console.log('🏥 Consultation payment confirmed, creating order')

            // Extract userId from localId pattern: consul_<userId>_<sessionId>
            const parts = data.localId.split('_')
            if (parts.length >= 3) {
                const userId = parts[1]
                const sessionId = parts[2]

                // Get session data
                const { data: session } = await supabase
                    .from('checkout_sessions')
                    .select('*')
                    .eq('session_token', sessionId)
                    .eq('user_id', userId)
                    .single()

                if (session) {
                    console.log('📦 Found checkout session, creating order')

                    const orderResult = await createOrderFromConsultationPayment(supabase, {
                        userId: session.user_id,
                        cartItems: session.cart_items,
                        paymentMethodId: session.payment_method_id,
                        deliveryAddress: session.shipping_address,
                        consultationTransactionId: data.transactionId,
                        sessionId: session.session_token,
                        paymentMetadata: {
                            confirmed_at: new Date().toISOString(),
                            amount: data.amount,
                            currency: data.currency,
                            provider: data.provider
                        }
                    })

                    if (orderResult.success) {
                        console.log('✅ Order created:', orderResult.orderId)
                    } else {
                        console.error('❌ Order creation failed:', orderResult.error)
                    }
                } else {
                    console.error('❌ Session not found for:', { userId, sessionId })
                }
            }
            return
        }

        // Check if this is a consultation payment for existing order
        const { data: consultationOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('consultation_payment_id', data.transactionId)
            .single()

        if (consultationOrder) {
            console.log('🏥 Updating existing consultation order:', consultationOrder.id)

            const { error } = await supabase.rpc('confirm_consultation_payment', {
                genie_trans_id: data.transactionId,
                payment_metadata: {
                    confirmed_at: new Date().toISOString(),
                    amount: data.amount,
                    currency: data.currency,
                    provider: data.provider
                }
            })

            if (!error) {
                console.log('✅ Consultation payment confirmed')
            }
            return
        }

        // Check if this is a product payment (second phase)
        const { data: productOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('product_payment_id', data.transactionId)
            .single()

        if (productOrder) {
            console.log('🛍️ Confirming product payment for order:', productOrder.id)

            // Update product payment phase
            await supabase
                .from('order_payment_phases')
                .update({
                    phase_status: 'completed',
                    completed_at: new Date().toISOString(),
                    payment_metadata: {
                        confirmed_at: new Date().toISOString(),
                        amount: data.amount,
                        currency: data.currency,
                        provider: data.provider
                    }
                })
                .eq('genie_transaction_id', data.transactionId)
                .eq('phase_type', 'products')

            // Update order status
            await supabase
                .from('orders')
                .update({
                    product_payment_status: 'paid',
                    payment_status: 'fully_paid',
                    status: 'processing'
                })
                .eq('id', productOrder.id)

            console.log('✅ Product payment confirmed')
            return
        }

        console.log('⚠️ No order found for transaction:', data.transactionId)

    } catch (error) {
        console.error('❌ Error handling payment confirmation:', error)
    }
}

async function handlePaymentVoided(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        console.log('🚫 Payment voided - cleaning up records')

        // Update payment phases
        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'failed',
                error_details: 'Payment was voided by gateway',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        // Update consultation orders
        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'voided',
                status: 'cancelled'
            })
            .eq('consultation_payment_id', data.transactionId)

        // Update product orders
        await supabase
            .from('orders')
            .update({
                product_payment_status: 'failed',
                payment_status: 'voided',
                status: 'cancelled'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('✅ Payment voided - orders cancelled')

    } catch (error) {
        console.error('❌ Error handling payment void:', error)
    }
}

async function handlePaymentCancelled(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        // Update payment phases
        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'cancelled',
                error_details: 'Payment was cancelled',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        // Update consultation orders
        await supabase
            .from('orders')
            .update({
                consultation_status: 'cancelled',
                payment_status: 'cancelled',
                status: 'cancelled'
            })
            .eq('consultation_payment_id', data.transactionId)

        // Update product orders
        await supabase
            .from('orders')
            .update({
                product_payment_status: 'cancelled',
                payment_status: 'cancelled',
                status: 'cancelled'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('✅ Payment cancelled - orders cancelled')

    } catch (error) {
        console.error('❌ Error handling payment cancellation:', error)
    }
}

async function handlePaymentFailed(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        // Update payment phases
        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'failed',
                error_details: 'Payment failed at gateway',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        // Update consultation orders
        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'failed',
                status: 'payment_failed'
            })
            .eq('consultation_payment_id', data.transactionId)

        // Update product orders
        await supabase
            .from('orders')
            .update({
                product_payment_status: 'failed',
                payment_status: 'failed',
                status: 'payment_failed'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('✅ Payment failed - orders marked as failed')

    } catch (error) {
        console.error('❌ Error handling payment failure:', error)
    }
}

async function createOrderFromConsultationPayment(
    supabase: any,
    data: ConsultationOrderData
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        console.log('🏥 Creating consultation order for user:', data.userId)

        // Calculate total amount from cart items
        const totalAmount = data.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)

        // Create order record
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: data.userId,
                total_amount: totalAmount,
                payment_flow_type: 'consultation_first',
                payment_method_id: data.paymentMethodId,
                consultation_payment_id: data.consultationTransactionId,
                consultation_status: 'paid',
                payment_status: 'consultation_paid',
                status: 'physician_review',
                delivery_address: data.deliveryAddress,
                payment_metadata: data.paymentMetadata
            })
            .select()
            .single()

        if (orderError) {
            console.error('❌ Order creation error:', orderError)
            return { success: false, error: 'Failed to create order' }
        }

        // Create order items
        if (data.cartItems?.length > 0) {
            const orderItemsData = data.cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsData)

            if (itemsError) {
                console.error('❌ Order items creation error:', itemsError)
                await supabase.from('orders').delete().eq('id', order.id)
                return { success: false, error: 'Failed to save order items' }
            }
        }

        // Create payment phase record
        await supabase
            .from('order_payment_phases')
            .insert({
                order_id: order.id,
                phase_type: 'consultation',
                phase_status: 'completed',
                genie_transaction_id: data.consultationTransactionId,
                payment_method_id: data.paymentMethodId,
                amount: data.paymentMetadata.amount || 0,
                currency: 'LKR',
                initiated_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                payment_metadata: data.paymentMetadata
            })

        // Submit questionnaire to emed service
        try {
            await submitQuestionnaireToEmed(data.userId, data.cartItems)
        } catch (emedError) {
            console.error('❌ Emed submission failed (order still created):', emedError)
        }

        console.log('✅ Order created successfully:', order.id)
        return { success: true, orderId: order.id }

    } catch (error) {
        console.error('❌ Error creating order:', error)
        return { success: false, error: 'Failed to create order' }
    }
}

async function submitQuestionnaireToEmed(userId: string, cartItems: any[]): Promise<void> {
    console.log('📋 Submitting questionnaire to emed for user:', userId)

    const supabase = createServiceRoleClient()

    // First, get health verticals from cart items to know which questionnaires to submit
    const healthVerticals = await getHealthVerticalsFromCart(cartItems)
    console.log('🏥 Detected health verticals:', healthVerticals)

    if (healthVerticals.length === 0) {
        console.warn('⚠️ No health verticals detected from cart items')
        return
    }

    // Submit questionnaire for each health vertical
    for (const healthVertical of healthVerticals) {
        try {
            console.log(`📋 Processing questionnaire for ${healthVertical}`)
            
            // Get user responses for this health vertical from database
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

            // Get questions for this health vertical
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

            // Extract photos from responses (stored as paths to storage bucket)
            const photos = await extractPhotosFromResponses(userResponse.responses, supabase)
            
            // Filter cart items for this health vertical
            const verticalCartItems = cartItems.filter(item => 
                item.health_vertical_slug === healthVertical
            )

            // Use existing emed service to save questionnaire and cart for this vertical
            const result = await medplumService.saveQuestionnaireAndCart(
                userId, // Use userId as patientId since customer is already a patient
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
                healthVertical // Pass the health vertical explicitly
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

/**
 * Get health verticals from cart items
 */
async function getHealthVerticalsFromCart(cartItems: any[]): Promise<string[]> {
    const supabase = createServiceRoleClient()
    
    // Get unique product IDs
    const productIds = [...new Set(cartItems.map(item => item.product_id))]
    
    // Fetch health vertical information for products
    const { data: productMetadata, error } = await supabase
        .from('product_metadata')
        .select(`
            genie_product_id,
            health_verticals!inner(slug)
        `)
        .in('genie_product_id', productIds)
    
    if (error || !productMetadata) {
        console.error('Error fetching product metadata:', error)
        return ['hair-loss'] // Default fallback
    }
    
    const verticals = [...new Set(
        productMetadata.map((item: any) => item.health_verticals.slug)
    )] as string[]
    
    return verticals.length > 0 ? verticals : ['hair-loss']
}

/**
 * Extract photos from responses (convert storage paths to PhotoInput format)
 */
async function extractPhotosFromResponses(responses: Record<string, any>, supabase: any): Promise<any[]> {
    const photos: any[] = []
    
    for (const [questionId, response] of Object.entries(responses)) {
        if (Array.isArray(response)) {
            for (const [index, item] of response.entries()) {
                if (typeof item === 'string' && item.includes('storage/')) {
                    // This is a storage path - convert to downloadable URL
                    const { data } = supabase.storage
                        .from('questionnaire-uploads')
                        .getPublicUrl(item)
                    
                    if (data?.publicUrl) {
                        photos.push({
                            questionId: questionId,
                            description: `${questionId}_${index}`,
                            url: data.publicUrl,
                            contentType: 'image/jpeg' // Default, could be enhanced
                        })
                    }
                }
            }
        } else if (typeof response === 'string' && response.includes('storage/')) {
            // Single image response
            const { data } = supabase.storage
                .from('questionnaire-uploads')
                .getPublicUrl(response)
            
            if (data?.publicUrl) {
                photos.push({
                    questionId: questionId,
                    description: questionId,
                    url: data.publicUrl,
                    contentType: 'image/jpeg' // Default, could be enhanced
                })
            }
        }
    }
    
    return photos
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const body = await request.text()

        // Verify webhook signature
        if (!verifyWebhookSignature(request.headers, body)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse the webhook data
        const webhookData: GenieWebhookData = JSON.parse(body)

        console.log('Received Genie webhook:', webhookData.eventType, {
            customerId: webhookData.customerId,
            transactionId: webhookData.transactionId,
            state: webhookData.state,
            tokenisationStatus: webhookData.tokenisationStatus
        })

        // Handle different webhook types
        switch (webhookData.eventType) {
            case 'NOTIFY_TOKENISATION_STATUS':
                await handleTokenizationWebhook(webhookData as GenieTokenizationWebhook)
                break

            case 'NOTIFY_TRANSACTION_CHANGE':
                await handleTransactionWebhook(webhookData as GenieTransactionWebhook)
                break

            default:
                console.log('Unknown webhook event type:', webhookData.eventType)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error processing Genie webhook:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'genie-payments-webhook',
        timestamp: new Date().toISOString()
    })
}