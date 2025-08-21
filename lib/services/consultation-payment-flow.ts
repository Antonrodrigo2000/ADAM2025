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
    prescriptionRequired?: boolean
    consultationFee?: number
    health_vertical_slug?: string
}

export class ConsultationPaymentFlowService {

    /**
     * Analyze cart and determine payment flow type
     */
    static async analyzePaymentFlow(
        cartItems: CartItemWithConsultation[]
    ): Promise<PaymentFlowAnalysis> {

        // Enrich cart items with health vertical info
        const enrichedItems = await CartEnrichmentService.enrichCartItemsWithHealthVerticals(cartItems)

        // Separate consultation items from regular items
        const consultationItems = enrichedItems.filter(item => item.prescriptionRequired)
        const regularItems = enrichedItems.filter(item => !item.prescriptionRequired)

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
     * Create consultation-first payment flow
     */
    static async createConsultationPayment(
        userId: string,
        cartItems: CartItemWithConsultation[],
        paymentMethodId: string,
        deliveryAddress: any,
        sessionId?: string
    ): Promise<ConsultationPaymentResult> {

        try {
            console.log('🏥 Starting consultation payment flow for user:', userId)

            // Analyze payment flow
            const analysis = await this.analyzePaymentFlow(cartItems)

            if (analysis.flowType !== 'consultation_first') {
                return {
                    success: false,
                    error: 'Cart does not require consultation payment flow'
                }
            }

            // DON'T create order in database yet - only create after consultation payment succeeds
            console.log('🏥 Starting consultation payment (order will be saved after payment confirmation)')

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

            // Create transaction with consultation product only
            // Use simple localId format: consul_<userId>_<sessionId>
            const localId = `consul_${userId}_${sessionId || 'no_session'}`
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

            console.log('✅ Consultation payment initiated - order will be created when payment confirms')

            return {
                success: true,
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
     * Create order in database for consultation flow
     */
    private static async createConsultationOrder(
        userId: string,
        cartItems: CartItemWithConsultation[],
        analysis: PaymentFlowAnalysis,
        paymentMethodId: string,
        deliveryAddress: any
    ): Promise<{ success: boolean; orderId?: string; error?: string }> {

        try {
            // This would integrate with your order creation service
            // For now, I'll outline the structure

            const orderData = {
                user_id: userId,
                payment_flow_type: 'consultation_first',
                total_amount: analysis.grandTotal,
                consultation_fee_total: analysis.consultationFeeTotal,
                payment_method_id: paymentMethodId,
                delivery_address: deliveryAddress,
                status: 'pending',
                consultation_status: 'pending',
                payment_status: 'consultation_pending'
            }

            // Call your order creation API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderData,
                    items: cartItems.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        total_price: item.price * item.quantity
                    }))
                })
            })

            if (!response.ok) {
                throw new Error(`Order creation failed: ${response.status}`)
            }

            const result = await response.json()
            return {
                success: true,
                orderId: result.orderId
            }

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create order'
            }
        }
    }

    /**
     * Link Genie transaction to order and create payment phase
     */
    private static async linkTransactionToOrder(
        orderId: string,
        transactionId: string,
        paymentMethodId: string
    ): Promise<void> {

        try {
            const response = await fetch('/api/orders/link-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    transactionId,
                    paymentMethodId,
                    phaseType: 'consultation'
                })
            })

            if (!response.ok) {
                throw new Error(`Failed to link transaction to order: ${response.status}`)
            }

        } catch (error) {
            console.error('Error linking transaction to order:', error)
            throw error
        }
    }

    /**
     * Cancel order if payment setup fails
     */
    private static async cancelOrder(orderId: string, reason: string): Promise<void> {
        try {
            await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })
        } catch (error) {
            console.error('Error cancelling order:', error)
        }
    }

    /**
     * Get user's Genie customer ID
     */
    // private static async getUserGenieCustomer(userId: string): Promise<{
    //   customerResult: { success: boolean; customerId?: string; error?: string }
    // }> {
    //   // This would fetch from your user profile
    //   // Placeholder implementation
    //   try {
    //     const response = await fetch(`/api/users/${userId}/genie-customer`)
    //     if (!response.ok) {
    //       throw new Error('Failed to get Genie customer ID')
    //     }

    //     const data = await response.json()
    //     console.log('Retrieved Genie customer ID:', data)
    //     return {
    //       customerResult: {
    //         success: true,
    //         customerId: data.genieCustomerId
    //       }
    //     }
    //   } catch (error) {
    //     return {
    //       customerResult: {
    //         success: false,
    //         error: error instanceof Error ? error.message : 'Failed to get customer'
    //       }
    //     }
    //   }
    // }
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