import { ConsultationOrderData } from './types'
import { submitQuestionnaireToEmed } from './emed-questionnaire'

export async function createOrderFromConsultationPayment(
    supabase: any,
    data: ConsultationOrderData
): Promise<{ success: boolean; orderId?: string; sessionId?: string; error?: string }> {
    try {
        console.log('🏥 Creating consultation order for user:', data.userId)

        const totalAmount = data.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: data.userId,
                total_amount: totalAmount,
                payment_flow_type: 'consultation_first',
                payment_method_id: data.paymentMethodId,
                consultation_payment_id: data.consultationTransactionId,
                consultation_status: 'paid',
                payment_status: 'pending',
                status: 'physician_review',
                delivery_address: data.deliveryAddress || {
                    type: 'consultation_pending',
                    note: 'Address will be collected after physician approval'
                },
                payment_metadata: data.paymentMetadata
            })
            .select()
            .single()

        if (orderError) {
            console.error('❌ Order creation error:', orderError)
            return { success: false, error: 'Failed to create order' }
        }

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

        // Update checkout session to processing status (consultation paid, awaiting physician review)
        console.log('🔄 DEBUG: Updating session to processing:', { sessionId: data.sessionId, userId: data.userId })
        const { error: sessionUpdateError } = await supabase
            .from('checkout_sessions')
            .update({
                status: 'active',
                current_step: 'processing',
                updated_at: new Date().toISOString()
            })
            .eq('session_token', data.sessionId)
            .eq('user_id', data.userId)
        
        if (sessionUpdateError) {
            console.error('❌ Session update error:', sessionUpdateError)
        } else {
            console.log('✅ Session updated to processing status')
        }

        try {
            await submitQuestionnaireToEmed(data.userId, data.cartItems)
        } catch (emedError) {
            console.error('❌ Emed submission failed (order still created):', emedError)
        }

        console.log('✅ Order created successfully:', order.id)
        return { success: true, orderId: order.id, sessionId: data.sessionId }

    } catch (error) {
        console.error('❌ Error creating order:', error)
        return { success: false, error: 'Failed to create order' }
    }
}