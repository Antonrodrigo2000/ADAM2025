import { NextRequest, NextResponse } from 'next/server'
import { validateCheckoutRequest, type CheckoutRequest } from './services/validation'
import { executeCheckoutSession } from './services/session'

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    
    // Validate request
    const validation = validateCheckoutRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Execute checkout session with cancellation token support
    const result = await executeCheckoutSession(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      flowType: result.flowType,
      orderId: result.orderId,
      userId: result.userId,
      isNewUser: result.isNewUser,
      nextStep: result.nextStep,
      addressPaymentData: result.addressPaymentData,
      message: result.message
    })

  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during checkout'
      },
      { status: 500 }
    )
  }
}