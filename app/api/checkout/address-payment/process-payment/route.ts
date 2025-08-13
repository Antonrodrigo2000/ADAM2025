import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Simulate payment processing
    // In real implementation, this would integrate with Dialog IPG or other payment gateway
    
    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: cartTotal,
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
      product_id: item.product_id,
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

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        amount: cartTotal,
        status: 'charged', // Simulate successful payment
        gateway_transaction_id: `sim_${Date.now()}`,
        charged_at: new Date().toISOString(),
      })

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
    }

    // Update order status to approved
    await supabase
      .from('orders')
      .update({ status: 'approved' })
      .eq('id', order.id)

    return NextResponse.json({
      success: true,
      order_id: order.id,
      message: 'Payment processed successfully',
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}