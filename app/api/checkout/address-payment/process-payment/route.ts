import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { PaymentFlowService } from '@/lib/services/payment-flow'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, paymentMethodId, cartItems } = body

    // Get authenticated user
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get checkout session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .eq('status', 'active')
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    console.log('🛒 Processing payment for session:', sessionId)

    // Use cart items from session if not provided in request
    const effectiveCartItems = cartItems?.length > 0 ? cartItems : session.cart_items || []
    
    if (effectiveCartItems.length === 0) {
      return NextResponse.json({ error: 'No cart items found' }, { status: 400 })
    }

    // Analyze payment flow - consultation first or regular checkout
    const analysis = await PaymentFlowService.analyzePaymentFlow(effectiveCartItems)
    
    console.log(`🛒 Using ${analysis.flowType} payment flow`)
    
    // Use unified payment flow service for both consultation_first and full_upfront
    const paymentResult = await PaymentFlowService.createPayment(
      user.id,
      effectiveCartItems,
      paymentMethodId,
      session.shipping_address || session.customer_info?.address,
      sessionId
    )

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment failed' },
        { status: 500 }
      )
    }

    console.log(`✅ ${analysis.flowType} payment initiated, order created:`, paymentResult.orderId)

    const redirectType = analysis.flowType === 'consultation_first' ? 'consultation' : 'upfront'
    
    return NextResponse.json({
      success: true,
      flow_type: analysis.flowType,
      order_id: paymentResult.orderId,
      transaction_id: paymentResult.transactionId,
      redirect_url: `/checkout/${sessionId}/processing?type=${redirectType}&tx=${paymentResult.transactionId}`,
      message: `${analysis.flowType} payment initiated - awaiting confirmation`
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}