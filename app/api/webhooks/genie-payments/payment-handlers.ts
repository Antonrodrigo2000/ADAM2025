import { createServiceRoleClient } from '@/lib/supabase/server'
import { GenieTransactionWebhook } from './types'

export async function handleTransactionWebhook(data: GenieTransactionWebhook): Promise<void> {
    console.log('Transaction state changed:', data.transactionId, data.state)

    const supabase = createServiceRoleClient()

    switch (data.state) {
        case 'CONFIRMED':
            console.log('Payment confirmed for transaction:', data.transactionId)
            await handlePaymentConfirmed(supabase, data)
            break

        case 'VOIDED':
            console.log('Payment voided for transaction:', data.transactionId)
            await handlePaymentVoided(supabase, data)
            break

        case 'CANCELLED':
            console.log('Payment cancelled for transaction:', data.transactionId)
            await handlePaymentCancelled(supabase, data)
            break

        case 'FAILED':
            console.log('Payment failed for transaction:', data.transactionId)
            await handlePaymentFailed(supabase, data)
            break

        case 'INITIATED':
            console.log('Payment initiated for transaction:', data.transactionId)
            break

        case 'QR_CODE_GENERATED':
            console.log('QR code generated for transaction:', data.transactionId)
            break

        default:
            console.log('Unknown transaction state:', data.state, 'for transaction:', data.transactionId)
    }
}

export async function handlePaymentConfirmed(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        // Direct order correlation using order ID as localId
        if (!data.localId) {
            console.error('❌ No localId found in webhook data')
            return
        }

        console.log('🏥 Payment confirmed, looking up order:', data.localId)

        // Find order by ID
        const { data: order } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', data.localId)
            .eq('status', 'payment_pending')
            .single()

        if (!order) {
            console.error('❌ No pending order found for ID:', data.localId)
            return
        }

        console.log('📦 Found pending order, confirming payment for', order.payment_flow_type, 'flow')

        // Handle different flow types
        let updateData: any = {
            updated_at: new Date().toISOString(),
            payment_metadata: {
                confirmed_at: new Date().toISOString(),
                amount: data.amount,
                currency: data.currency,
                provider: data.provider
            }
        }

        if (order.payment_flow_type === 'consultation_first') {
            // Consultation flow: payment success → physician review
            updateData = {
                ...updateData,
                consultation_payment_id: data.transactionId,
                consultation_status: 'paid',
                payment_status: 'consultation_paid',
                status: 'physician_review'
            }
        } else {
            // Full upfront flow: payment success → processing (ready to ship)
            updateData = {
                ...updateData,
                genie_transaction_id: data.transactionId,
                payment_status: 'confirmed',
                status: 'processing'
            }
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order.id)

        if (updateError) {
            console.error('❌ Error updating order:', updateError)
            return
        }

        // Create payment phase record
        const phaseType = order.payment_flow_type === 'consultation_first' ? 'consultation' : 'products'
        await supabase
            .from('order_payment_phases')
            .insert({
                order_id: order.id,
                phase_type: phaseType,
                phase_status: 'completed',
                genie_transaction_id: data.transactionId,
                payment_method_id: order.payment_method_id,
                amount: data.amount || 0,
                currency: data.currency || 'LKR',
                initiated_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                payment_metadata: {
                    confirmed_at: new Date().toISOString(),
                    amount: data.amount,
                    currency: data.currency,
                    provider: data.provider
                }
            })

        // Update checkout session status if exists
        if (order.session_id) {
            await supabase
                .from('checkout_sessions')
                .update({
                    status: 'active',
                    current_step: 'processing',
                    updated_at: new Date().toISOString()
                })
                .eq('session_token', order.session_id)
                .eq('user_id', order.user_id)
        }

        console.log(`✅ ${order.payment_flow_type} payment confirmed for order:`, order.id, `amount: ${data.amount} ${data.currency}`)

        // Submit emed questionnaire only for consultation flow after payment success
        if (order.payment_flow_type === 'consultation_first') {
            try {
                const { submitQuestionnaireToEmed } = await import('./emed-questionnaire')
                await submitQuestionnaireToEmed(order.user_id, order.cart_snapshot || [])
                console.log('✅ Emed questionnaire submitted for consultation order')
            } catch (emedError) {
                console.error('❌ Emed submission failed (order still confirmed):', emedError)
            }
        } else {
            console.log('ℹ️ Upfront payment - no emed questionnaire submission needed')
        }

    } catch (error) {
        console.error('Error handling payment confirmation:', error)
    }
}

export async function handlePaymentVoided(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        console.log('Payment voided - marking order as failed')

        if (!data.localId) {
            console.error('❌ No localId found in webhook data')
            return
        }

        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'voided',
                status: 'payment_failed',
                updated_at: new Date().toISOString()
            })
            .eq('id', data.localId)
            .eq('status', 'payment_pending')

        console.log('✅ Payment voided - order marked as failed')

    } catch (error) {
        console.error('Error handling payment void:', error)
    }
}

export async function handlePaymentCancelled(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        console.log('Payment cancelled - marking order as cancelled')

        if (!data.localId) {
            console.error('❌ No localId found in webhook data')
            return
        }

        await supabase
            .from('orders')
            .update({
                consultation_status: 'cancelled',
                payment_status: 'cancelled',
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', data.localId)
            .eq('status', 'payment_pending')

        console.log('✅ Payment cancelled - order marked as cancelled')

    } catch (error) {
        console.error('Error handling payment cancellation:', error)
    }
}

export async function handlePaymentFailed(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        console.log('Payment failed - marking order as failed')

        if (!data.localId) {
            console.error('❌ No localId found in webhook data')
            return
        }

        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'failed',
                status: 'payment_failed',
                updated_at: new Date().toISOString()
            })
            .eq('id', data.localId)
            .eq('status', 'payment_pending')

        console.log('✅ Payment failed - order marked as failed')

    } catch (error) {
        console.error('Error handling payment failure:', error)
    }
}