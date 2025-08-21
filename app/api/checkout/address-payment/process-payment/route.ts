import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { ConsultationPaymentFlowService } from '@/lib/services/consultation-payment-flow'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, addressId, paymentMethodId, cartItems, cartTotal } = body

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

    // Analyze payment flow - consultation first or regular checkout
    const analysis = await ConsultationPaymentFlowService.analyzePaymentFlow(cartItems)
    
    if (analysis.flowType === 'consultation_first') {
      console.log('🏥 Using consultation-first payment flow')
      
      // Use consultation payment flow
      const consultationResult = await ConsultationPaymentFlowService.createConsultationPayment(
        user.id,
        cartItems,
        paymentMethodId,
        session.shipping_address || session.customer_info?.address,
        sessionId
      )

      if (!consultationResult.success) {
        return NextResponse.json(
          { error: consultationResult.error || 'Consultation payment failed' },
          { status: 500 }
        )
      }

      console.log('✅ Consultation payment initiated')

      return NextResponse.json({
        success: true,
        flow_type: 'consultation_first',
        transaction_id: consultationResult.transactionId,
        redirect_url: `/checkout/${sessionId}/processing?type=consultation&tx=${consultationResult.transactionId}`,
        message: 'Consultation payment initiated - order will be created after payment confirmation'
      })

    } else {
      console.log('💳 Using regular upfront payment flow')
      
      // Regular payment flow (existing logic)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: cartTotal,
          payment_flow_type: 'full_upfront',
          payment_method_id: paymentMethodId,
          delivery_address: session.shipping_address || session.customer_info?.address,
          metadata: {
            session_id: sessionId,
            payment_method_id: paymentMethodId,
            address_id: addressId,
          },
        })
        .select()
        .single()

      if (orderError) {
        console.error('Failed to create order:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Failed to create order items:', itemsError)
        return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
      }

      // TODO: Integrate with actual payment gateway (Genie/Dialog IPG)
      // For now, simulate successful payment
      
      await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_status: 'confirmed'
        })
        .eq('id', order.id)

      console.log('✅ Regular payment processed')

      return NextResponse.json({
        success: true,
        flow_type: 'full_upfront',
        order_id: order.id,
        redirect_url: `/checkout/${sessionId}/success?order=${order.id}`,
        message: 'Payment processed successfully'
      })
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}