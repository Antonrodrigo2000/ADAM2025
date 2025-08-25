import { NextRequest, NextResponse } from 'next/server'
import { handleTransactionWebhook } from '../payment-handlers'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    // Only allow in debug mode
    if (process.env.DEBUG !== 'true') {
        return NextResponse.json(
            { error: 'Mock webhook only available in debug mode' }, 
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const { sessionId, userId, transactionId, state = 'CONFIRMED' } = body

        if (!sessionId || !userId) {
            return NextResponse.json(
                { error: 'sessionId and userId are required' }, 
                { status: 400 }
            )
        }

        console.log('🧪 DEBUG: Mock endpoint received request with session ID:', sessionId)

        // Find the pending order for this user/session to get the order ID
        const supabase = createServiceRoleClient()
        const { data: order, error } = await supabase
            .from('orders')
            .select('id, payment_flow_type, status, total_amount')
            .eq('user_id', userId)
            .eq('status', 'payment_pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !order) {
            console.error('🧪 DEBUG: No pending order found for user:', userId)
            return NextResponse.json(
                { error: 'No pending order found for user. Create an order first.' }, 
                { status: 404 }
            )
        }

        console.log('🧪 DEBUG: Found pending order:', {
            orderId: order.id,
            flowType: order.payment_flow_type,
            totalAmount: order.total_amount
        })

        // Use realistic amounts based on flow type
        const CONSULTATION_FEE = 1000
        const mockAmount = state === 'CONFIRMED' ? 
            (order.payment_flow_type === 'consultation_first' ? CONSULTATION_FEE : order.total_amount || 2500) : 
            0

        console.log('🧪 DEBUG: Using mock amount:', mockAmount, 'LKR for', state, 'payment')

        // Create mock webhook data using order ID correlation (but keep same API)
        const mockWebhookData = {
            eventType: 'NOTIFY_TRANSACTION_CHANGE' as const,
            transactionId: transactionId || `mock_${Date.now()}`,
            state: state as 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'VOIDED',
            localId: order.id, // Use order ID internally
            amount: mockAmount,
            currency: 'LKR',
            provider: 'mock_genie',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        }

        // Process the mock webhook
        await handleTransactionWebhook(mockWebhookData)

        return NextResponse.json({ 
            success: true, 
            message: `Mock payment ${state.toLowerCase()} processed`,
            data: mockWebhookData,
            redirect_url: `/checkout/${sessionId}/processing?type=${order.payment_flow_type === 'consultation_first' ? 'consultation' : 'upfront'}&tx=${mockWebhookData.transactionId}`
        })

    } catch (error) {
        console.error('🧪 DEBUG: Mock webhook error:', error)
        return NextResponse.json(
            { error: 'Mock webhook processing failed' },
            { status: 500 }
        )
    }
}

// Health check for mock endpoint
export async function GET() {
    if (process.env.DEBUG !== 'true') {
        return NextResponse.json(
            { error: 'Mock webhook only available in debug mode' }, 
            { status: 403 }
        )
    }

    return NextResponse.json({
        status: 'ok',
        service: 'genie-payments-mock-webhook',
        debug_mode: true,
        timestamp: new Date().toISOString(),
        usage: {
            endpoint: 'POST /api/webhooks/genie-payments/mock',
            description: 'Mock payment webhook for testing both consultation_first and full_upfront flows',
            payload: {
                sessionId: 'required - checkout session ID',
                userId: 'required - user ID',
                transactionId: 'optional - will generate if not provided',
                state: 'optional - CONFIRMED (default), FAILED, CANCELLED, or VOIDED'
            },
            example: {
                sessionId: 'session_123',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                state: 'CONFIRMED'
            }
        }
    })
}