import { createServiceRoleClient } from '@/lib/supabase/server'
import { GenieTransactionWebhook } from './types'
import { createOrderFromConsultationPayment } from './order-creation'

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
        if (data.localId?.startsWith('consul_')) {
            console.log('🏥 Consultation payment confirmed, creating order')

            const parts = data.localId.split('_')
            if (parts.length >= 3) {
                const userId = parts[1]
                const sessionId = parts[2]

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
                        console.log('Order created:', orderResult.orderId)
                    } else {
                        console.error('Order creation failed:', orderResult.error)
                    }
                } else {
                    console.error('Session not found for:', { userId, sessionId })
                }
            }
            return
        }

        const { data: consultationOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('consultation_payment_id', data.transactionId)
            .single()

        if (consultationOrder) {
            console.log('Updating existing consultation order:', consultationOrder.id)

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
                console.log('Consultation payment confirmed')
            }
            return
        }

        const { data: productOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('product_payment_id', data.transactionId)
            .single()

        if (productOrder) {
            console.log('Confirming product payment for order:', productOrder.id)

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

            await supabase
                .from('orders')
                .update({
                    product_payment_status: 'paid',
                    payment_status: 'fully_paid',
                    status: 'processing'
                })
                .eq('id', productOrder.id)

            console.log('Product payment confirmed')
            return
        }

        console.log('No order found for transaction:', data.transactionId)

    } catch (error) {
        console.error('Error handling payment confirmation:', error)
    }
}

export async function handlePaymentVoided(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        console.log('Payment voided - cleaning up records')

        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'failed',
                error_details: 'Payment was voided by gateway',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'voided',
                status: 'cancelled'
            })
            .eq('consultation_payment_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                product_payment_status: 'failed',
                payment_status: 'voided',
                status: 'cancelled'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('Payment voided - orders cancelled')

    } catch (error) {
        console.error('Error handling payment void:', error)
    }
}

export async function handlePaymentCancelled(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'cancelled',
                error_details: 'Payment was cancelled',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                consultation_status: 'cancelled',
                payment_status: 'cancelled',
                status: 'cancelled'
            })
            .eq('consultation_payment_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                product_payment_status: 'cancelled',
                payment_status: 'cancelled',
                status: 'cancelled'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('Payment cancelled - orders cancelled')

    } catch (error) {
        console.error('Error handling payment cancellation:', error)
    }
}

export async function handlePaymentFailed(supabase: any, data: GenieTransactionWebhook): Promise<void> {
    try {
        await supabase
            .from('order_payment_phases')
            .update({
                phase_status: 'failed',
                error_details: 'Payment failed at gateway',
                failed_at: new Date().toISOString()
            })
            .eq('genie_transaction_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                consultation_status: 'failed',
                payment_status: 'failed',
                status: 'payment_failed'
            })
            .eq('consultation_payment_id', data.transactionId)

        await supabase
            .from('orders')
            .update({
                product_payment_status: 'failed',
                payment_status: 'failed',
                status: 'payment_failed'
            })
            .eq('product_payment_id', data.transactionId)

        console.log('Payment failed - orders marked as failed')

    } catch (error) {
        console.error('Error handling payment failure:', error)
    }
}