import { NextRequest, NextResponse } from 'next/server'
import { GenieWebhookData, GenieTokenizationWebhook, GenieTransactionWebhook } from './types'
import { verifyWebhookSignature } from './signature-verification'
import { handleTokenizationWebhook } from './tokenization-handler'
import { handleTransactionWebhook } from './payment-handlers'

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