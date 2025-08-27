import { GeniePaymentService } from './genie-payment-service'
import { CartEnrichmentService, type EnrichedCartItem } from './cart-enrichment'
import { createClient } from '../supabase/server'

export interface PaymentFlowAnalysis {
    flowType: 'consultation_first' | 'full_upfront'
    requiresConsultation: boolean
    consultationFeeTotal: number
    productTotal: number
    grandTotal: number
    consultationItems: EnrichedCartItem[]
    regularItems: EnrichedCartItem[]
}

export interface ConsultationPaymentResult {
    success: boolean
    orderId?: string
    transactionId?: string
    redirectUrl?: string
    error?: string
}

export interface CartItemWithConsultation {
    product_id: string
    quantity: number
    price: number
    productName?: string
    variantName?: string
    consultationRequired?: boolean
    consultationFee?: number
    health_vertical_slug?: string
}

export class PaymentFlowService {

    /**
     * Analyze cart and determine payment flow type
     */
    static async analyzePaymentFlow(
        cartItems: CartItemWithConsultation[]
    ): Promise<PaymentFlowAnalysis> {

        // Enrich cart items with health vertical info
        const enrichedItems = await CartEnrichmentService.enrichCartItemsWithHealthVerticals(cartItems)

        // Separate consultation items from regular items
        const consultationItems = enrichedItems.filter(item => item.consultationRequired)
        const regularItems = enrichedItems.filter(item => !item.consultationRequired)

        // Calculate product totals (no consultation fee calculations)
        const productTotal = enrichedItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)

        // Determine flow type
        const flowType = consultationItems.length > 0 ? 'consultation_first' : 'full_upfront'

        return {
            flowType,
            requiresConsultation: consultationItems.length > 0,
            consultationFeeTotal: 0, // Not used - consultation is a product
            productTotal,
            grandTotal: productTotal, // Only product total
            consultationItems,
            regularItems
        }
    }

    /**
     * Get consultation product ID from environment
     */
    static getConsultationProductId(): string {
        const consultationProductId = process.env.NEXT_PUBLIC_GENIE_CONSULTATION_PRODUCT_ID
        if (!consultationProductId) {
            throw new Error('CONSULTATION_PRODUCT_ID environment variable not set')
        }

        return consultationProductId
    }

    /**
     * Create payment flow (supports both consultation_first and full_upfront)
     */
    static async createPayment(
        userId: string,
        cartItems: CartItemWithConsultation[],
        paymentMethodId: string,
        deliveryAddress: any,
        sessionId?: string
    ): Promise<ConsultationPaymentResult> {

        try {
            // Analyze payment flow
            const analysis = await this.analyzePaymentFlow(cartItems)
            
            console.log(`🏥 Starting ${analysis.flowType} payment flow for user:`, userId)

            if (analysis.flowType === 'consultation_first') {
                return await this.createConsultationFirstPayment(userId, cartItems, paymentMethodId, deliveryAddress, sessionId, analysis)
            } else {
                return await this.createFullUpfrontPayment(userId, cartItems, paymentMethodId, deliveryAddress, sessionId, analysis)
            }

        } catch (error) {
            console.error('❌ Error in payment flow:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment flow failed'
            }
        }
    }

    /**
     * Create consultation-first payment flow (consultation product only)
     */
    private static async createConsultationFirstPayment(
        userId: string,
        cartItems: CartItemWithConsultation[],
        paymentMethodId: string,
        deliveryAddress: any,
        sessionId: string | undefined,
        analysis: PaymentFlowAnalysis
    ): Promise<ConsultationPaymentResult> {

        try {
            console.log('🏥 Creating consultation-first payment flow')

            // Create order first with payment_pending status
            const order = await this.createPendingOrder(userId, cartItems, paymentMethodId, deliveryAddress, sessionId, analysis)
            console.log('📦 Created pending order:', order.id)

            // Create Genie transaction for consultation product only
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            const redirectUrl = sessionId
                ? `${baseUrl}/checkout/${sessionId}/processing?type=consultation`
                : `${baseUrl}/checkout/consultation-success`
            const webhookUrl = `${baseUrl}/api/webhooks/genie-payments`

            // Get user's Genie customer ID
            const { customerResult } = await this.getUserGenieCustomer(userId)
            console.log('Using Genie customer ID:', customerResult)
            if (!customerResult.success || !customerResult.customerId) {
                return {
                    success: false,
                    error: 'User does not have Genie customer ID'
                }
            }

            // Get consultation product ID from environment
            const consultationProductId = this.getConsultationProductId()

            console.log('💳 Creating Genie transaction for consultation product:', consultationProductId)

            // Use order ID as localId for direct correlation
            const localId = order.id
            const transactionResult = await GeniePaymentService.createTransactionWithProducts(
                customerResult.customerId,
                [{ id: consultationProductId, quantity: 1 }], // Consultation as a product
                webhookUrl,
                redirectUrl,
                localId,
                `customer_${userId}`
            )

            console.log('Transaction result:', transactionResult)

            if (!transactionResult.success || !transactionResult.transaction) {
                return {
                    success: false,
                    error: transactionResult.error || 'Failed to create payment transaction'
                }
            }

            console.log('🔄 Created Genie consultation transaction:', transactionResult.transaction.id)

            // Charge the stored token for consultation product
            const chargeResult = await GeniePaymentService.chargeStoredToken(
                customerResult.customerId,
                transactionResult.transaction.id,
                paymentMethodId
            )

            if (!chargeResult.success) {
                return {
                    success: false,
                    error: chargeResult.error || 'Failed to charge payment method'
                }
            }

            console.log('✅ Consultation payment initiated - order created, awaiting payment confirmation')

            return {
                success: true,
                orderId: order.id,
                transactionId: transactionResult.transaction.id,
                redirectUrl
            }

        } catch (error) {
            console.error('❌ Error in consultation payment flow:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Consultation payment failed'
            }
        }
    }

    /**
     * Create full upfront payment flow (all products at once)
     */
    private static async createFullUpfrontPayment(
        userId: string,
        cartItems: CartItemWithConsultation[],
        paymentMethodId: string,
        deliveryAddress: any,
        sessionId: string | undefined,
        analysis: PaymentFlowAnalysis
    ): Promise<ConsultationPaymentResult> {

        try {
            console.log('💳 Creating full upfront payment flow')

            // Create order first with payment_pending status
            const order = await this.createPendingOrder(userId, cartItems, paymentMethodId, deliveryAddress, sessionId, analysis)
            console.log('📦 Created pending order:', order.id)

            // Create Genie transaction for all cart products
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            const redirectUrl = sessionId
                ? `${baseUrl}/checkout/${sessionId}/processing?type=upfront`
                : `${baseUrl}/checkout/upfront-success`
            const webhookUrl = `${baseUrl}/api/webhooks/genie-payments`

            // Get user's Genie customer ID
            const { customerResult } = await this.getUserGenieCustomer(userId)
            if (!customerResult.success || !customerResult.customerId) {
                return {
                    success: false,
                    error: 'User does not have Genie customer ID'
                }
            }

            console.log('💳 Creating Genie transaction for all cart products')

            // Create transaction with all cart products
            const genieProducts = cartItems.map(item => ({
                id: item.product_id,
                quantity: item.quantity
            }))

            // Use order ID as localId for direct correlation
            const localId = order.id
            const transactionResult = await GeniePaymentService.createTransactionWithProducts(
                customerResult.customerId,
                genieProducts,
                webhookUrl,
                redirectUrl,
                localId,
                `customer_${userId}`
            )

            console.log('Transaction result:', transactionResult)

            if (!transactionResult.success || !transactionResult.transaction) {
                return {
                    success: false,
                    error: transactionResult.error || 'Failed to create payment transaction'
                }
            }

            console.log('🔄 Created Genie upfront transaction:', transactionResult.transaction.id)

            // Charge the stored token for all products
            const chargeResult = await GeniePaymentService.chargeStoredToken(
                customerResult.customerId,
                transactionResult.transaction.id,
                paymentMethodId
            )

            if (!chargeResult.success) {
                return {
                    success: false,
                    error: chargeResult.error || 'Failed to charge payment method'
                }
            }

            console.log('✅ Full upfront payment initiated - order created, awaiting payment confirmation')

            return {
                success: true,
                orderId: order.id,
                transactionId: transactionResult.transaction.id,
                redirectUrl
            }

        } catch (error) {
            console.error('❌ Error in full upfront payment flow:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Full upfront payment failed'
            }
        }
    }


    /**
     * Create pending order in database before payment
     */
    private static async createPendingOrder(
        userId: string,
        cartItems: CartItemWithConsultation[],
        paymentMethodId: string,
        deliveryAddress: any,
        sessionId: string | undefined,
        analysis: PaymentFlowAnalysis
    ): Promise<any> {
        const supabase = await createClient()

        // Calculate total amount from cart items
        const totalAmount = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)

        // Create order with payment_pending status
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                status: 'payment_pending',
                payment_flow_type: analysis.flowType,
                consultation_status: analysis.flowType === 'consultation_first' ? 'pending' : null,
                payment_status: 'pending',
                total_amount: totalAmount,
                consultation_fee_total: 0, // Consultation is now a product, not a separate fee
                payment_method_id: paymentMethodId,
                delivery_address: deliveryAddress || {
                    type: analysis.flowType === 'consultation_first' ? 'consultation_pending' : 'address_required',
                    note: analysis.flowType === 'consultation_first' 
                        ? 'Address will be collected after physician approval'
                        : 'Address will be collected separately'
                },
                session_id: sessionId,
                cart_snapshot: cartItems,
                metadata: {
                    flow_analysis: analysis,
                    created_via: 'payment_flow_service'
                }
            })
            .select()
            .single()

        if (orderError) {
            console.error('❌ Order creation error:', orderError)
            throw new Error(`Failed to create order: ${orderError.message}`)
        }

        // Create order items from cart snapshot
        if (cartItems.length > 0) {
            const orderItemsData = cartItems.map(item => ({
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
                // Cleanup: delete the order if items creation fails
                await supabase.from('orders').delete().eq('id', order.id)
                throw new Error(`Failed to create order items: ${itemsError.message}`)
            }
        }

        return order
    }

    private static async getUserGenieCustomer(userId: string) {
        try {
            const supabase = await createClient()
            const { data, error } = await supabase
                .from('user_profiles')
                .select('genie_customer_id')
                .eq('id', userId)
                .single()

            if (error || !data?.genie_customer_id) {
                return { customerResult: { success: false, error: 'No Genie customer ID found' } }
            }

            return {
                customerResult: {
                    success: true,
                    customerId: data.genie_customer_id
                }
            }
        } catch (err) {
            return {
                customerResult: {
                    success: false,
                    error: err instanceof Error ? err.message : 'Failed to query Supabase'
                }
            }
        }
    }

    /**
     * Create product payment after consultation approval
     */
    static async createProductPayment(
        orderId: string,
        approvedBy: string
    ): Promise<ConsultationPaymentResult> {

        try {
            console.log('🛍️ Creating product payment for approved order:', orderId, 'approved by:', approvedBy)

            // This function is now implemented in the physician approval API endpoint
            // The /api/orders/[orderId]/approve endpoint handles:
            // 1. Get order details
            // 2. Calculate product amount (total - consultation fee)
            // 3. Create Genie transaction for product amount
            // 4. Charge the stored payment method
            // 5. Update order status to processing/shipped

            // For direct programmatic access, you would call the approval API or implement similar logic here

            return {
                success: true,
                orderId
            }

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Product payment failed'
            }
        }
    }
}