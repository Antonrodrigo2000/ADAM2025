import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GeniePaymentService } from '@/lib/services/genie-payment-service'
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
  
  // You can add logic here to update checkout sessions or order status
  // based on transaction state changes
  
  if (data.state === 'CONFIRMED') {
    console.log('Payment confirmed for transaction:', data.transactionId)
    // Update order status, send confirmation emails, etc.
  } else if (data.state === 'FAILED' || data.state === 'CANCELLED') {
    console.log('Payment failed/cancelled for transaction:', data.transactionId)
    // Handle failed payment logic
  }
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