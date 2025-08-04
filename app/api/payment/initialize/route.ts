import { NextRequest, NextResponse } from 'next/server'

interface PaymentInitRequest {
  amount: number // Amount in cents
  currency: string
  orderItems: any[]
  customerDetails: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentInitRequest = await request.json()
    const { amount, currency, orderItems, customerDetails } = body

    // Validate required fields
    if (!amount || !currency || !orderItems.length || !customerDetails.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Genie IPG configuration
    const genieShopId = process.env.GENIE_BUSINESS_SHOP_ID
    const genieApiKey = process.env.GENIE_BUSINESS_API_KEY
    const genieIPGUrl = process.env.GENIE_IPG_URL // e.g., 'https://ipg.geniebiz.lk'
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!genieShopId || !genieApiKey || !genieIPGUrl) {
      console.error('Missing Genie IPG configuration')
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      )
    }

    // Generate unique order reference
    const orderRef = `ADAM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Prepare payment request for Genie IPG
    const paymentRequest = {
      shopId: genieShopId,
      orderRef: orderRef,
      amount: amount, // Amount in cents
      currency: currency,
      description: `ADAM Order - ${orderItems.length} item(s)`,
      customer: {
        email: customerDetails.email,
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        phone: customerDetails.phone,
      },
      items: orderItems.map((item, index) => ({
        id: item.productId,
        name: item.productName,
        description: item.variantName,
        quantity: item.quantity,
        unitPrice: Math.round(item.totalPrice * 100), // Convert to cents
        category: 'healthcare',
      })),
      returnUrl: `${returnUrl}/payment/return`,
      cancelUrl: `${returnUrl}/payment/cancel`,
      webhookUrl: `${returnUrl}/api/payment/webhook`,
      metadata: {
        cartId: `cart-${Date.now()}`,
        itemCount: orderItems.length,
        consultationRequired: orderItems.some(item => item.prescriptionRequired),
      }
    }

    console.log('Initializing payment with Genie IPG:', {
      orderRef,
      amount: amount / 100, // Log in LKR for readability
      itemCount: orderItems.length
    })

    // Call Genie IPG API to initialize payment
    const response = await fetch(`${genieIPGUrl}/api/v1/payment/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${genieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Genie IPG initialization failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { error: 'Payment initialization failed. Please try again.' },
        { status: 500 }
      )
    }

    const paymentData = await response.json()
    
    console.log('Payment initialized successfully:', {
      orderRef,
      paymentToken: paymentData.token,
      redirectUrl: paymentData.redirectUrl
    })

    // Return the payment URL and token
    return NextResponse.json({
      success: true,
      orderRef: orderRef,
      paymentToken: paymentData.token,
      redirectUrl: paymentData.redirectUrl,
      expiresAt: paymentData.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes default
    })

  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error during payment initialization' },
      { status: 500 }
    )
  }
}

/*
USAGE NOTES:

This API route integrates with Genie's IPG (Internet Payment Gateway) to:

1. Initialize payment sessions
2. Generate secure payment tokens
3. Create redirect URLs to Genie's payment page
4. Handle order references and metadata

REQUIRED ENVIRONMENT VARIABLES:
- GENIE_BUSINESS_SHOP_ID: Your Genie business shop ID
- GENIE_BUSINESS_API_KEY: Your Genie business API key
- GENIE_IPG_URL: Genie IPG base URL (e.g., https://ipg.geniebiz.lk)
- NEXT_PUBLIC_APP_URL: Your app's base URL for return/cancel URLs

WORKFLOW:
1. User submits checkout form
2. This API creates payment session with Genie IPG
3. User is redirected to Genie's secure payment page
4. After payment, user returns to /payment/return
5. Webhook at /api/payment/webhook processes the result

SECURITY NOTES:
- Payment amounts are handled in cents to avoid float precision issues
- Order references are unique and timestamped
- Return/cancel URLs are configured to bring users back to your app
- Webhook URL handles async payment status updates
*/