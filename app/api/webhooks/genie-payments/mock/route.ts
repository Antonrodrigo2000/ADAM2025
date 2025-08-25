import { NextRequest, NextResponse } from 'next/server'
import { handleTransactionWebhook } from '../payment-handlers'

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
        const { sessionId, userId, transactionId } = body

        if (!sessionId || !userId) {
            return NextResponse.json(
                { error: 'sessionId and userId are required' }, 
                { status: 400 }
            )
        }

        console.log('🧪 DEBUG: Mock endpoint received request with session ID:', sessionId)
        console.log('🧪 DEBUG: Simulating successful consultation payment', {
            sessionId,
            userId,
            transactionId: transactionId || `mock_${Date.now()}`
        })

        // Create mock webhook data
        const mockWebhookData = {
            eventType: 'NOTIFY_TRANSACTION_CHANGE' as const,
            transactionId: transactionId || `mock_consultation_${Date.now()}`,
            state: 'CONFIRMED' as const,
            localId: `consul_${userId}_${sessionId}`,
            amount: 500, // Mock consultation fee
            currency: 'LKR',
            provider: 'mock_genie',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        }

        // Process the mock webhook
        await handleTransactionWebhook(mockWebhookData)

        return NextResponse.json({ 
            success: true, 
            message: 'Mock consultation payment processed',
            data: mockWebhookData,
            redirect_url: `/checkout/${sessionId}/processing?type=consultation&tx=${mockWebhookData.transactionId}`
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
            payload: {
                sessionId: 'required - checkout session ID',
                userId: 'required - user ID',
                transactionId: 'optional - will generate if not provided'
            }
        }
    })
}