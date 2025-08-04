import { NextRequest, NextResponse } from 'next/server'

interface PaymentVerifyRequest {
  token: string
  status: string
  orderRef: string
  transactionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentVerifyRequest = await request.json()
    const { token, status, orderRef, transactionId } = body

    // Validate required fields
    if (!token || !status || !orderRef) {
      return NextResponse.json(
        { success: false, error: 'Missing required verification parameters' },
        { status: 400 }
      )
    }

    // Get Genie IPG configuration
    const genieApiKey = process.env.GENIE_BUSINESS_API_KEY
    const genieIPGUrl = process.env.GENIE_IPG_URL

    if (!genieApiKey || !genieIPGUrl) {
      console.error('Missing Genie IPG configuration')
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error' },
        { status: 500 }
      )
    }

    console.log('Verifying payment:', { token, status, orderRef, transactionId })

    // Verify payment status with Genie IPG
    const verifyResponse = await fetch(`${genieIPGUrl}/api/v1/payment/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${genieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        orderRef,
        transactionId
      }),
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.text()
      console.error('Payment verification failed:', {
        status: verifyResponse.status,
        error: errorData
      })
      
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed'
      })
    }

    const verificationData = await verifyResponse.json()
    
    console.log('Payment verification response:', {
      orderRef,
      status: verificationData.status,
      amount: verificationData.amount,
      transactionId: verificationData.transactionId
    })

    // Check if payment was successful
    if (verificationData.status === 'COMPLETED' || verificationData.status === 'SUCCESS') {
      // Payment successful
      return NextResponse.json({
        success: true,
        orderRef: orderRef,
        transactionId: verificationData.transactionId,
        amount: verificationData.amount,
        currency: verificationData.currency || 'LKR',
        status: verificationData.status,
        paymentMethod: verificationData.paymentMethod,
        paidAt: verificationData.paidAt || new Date().toISOString(),
        token: token
      })
    } else {
      // Payment failed or pending
      return NextResponse.json({
        success: false,
        error: getPaymentErrorMessage(verificationData.status),
        status: verificationData.status,
        orderRef: orderRef
      })
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during payment verification' },
      { status: 500 }
    )
  }
}

function getPaymentErrorMessage(status: string): string {
  switch (status) {
    case 'FAILED':
      return 'Payment failed. Please check your payment details and try again.'
    case 'CANCELLED':
      return 'Payment was cancelled. You can try again when ready.'
    case 'EXPIRED':
      return 'Payment session expired. Please start a new checkout process.'
    case 'PENDING':
      return 'Payment is still being processed. Please wait or contact support.'
    case 'DECLINED':
      return 'Payment was declined by your bank. Please try a different payment method.'
    case 'INSUFFICIENT_FUNDS':
      return 'Insufficient funds. Please check your account balance.'
    case 'INVALID_CARD':
      return 'Invalid card details. Please check your card information.'
    default:
      return `Payment could not be completed. Status: ${status}`
  }
}

/*
USAGE NOTES:

This API route handles payment verification with Genie IPG:

1. Receives payment return parameters from the client
2. Calls Genie IPG's verification endpoint to confirm payment status
3. Returns structured response indicating success/failure
4. Provides user-friendly error messages for different failure scenarios

PAYMENT STATUSES:
- SUCCESS/COMPLETED: Payment successful
- FAILED: Payment failed
- CANCELLED: User cancelled payment
- EXPIRED: Payment session expired
- PENDING: Payment still processing
- DECLINED: Bank declined payment
- INSUFFICIENT_FUNDS: Not enough balance
- INVALID_CARD: Card details invalid

SECURITY NOTES:
- Always verify payments server-side, never trust client-side data
- Use the verification token provided by Genie IPG
- Log all payment attempts for audit purposes
- Handle PCI compliance according to Genie IPG requirements
*/