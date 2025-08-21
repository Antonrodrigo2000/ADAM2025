import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface LinkTransactionRequest {
  orderId: string
  transactionId: string
  paymentMethodId: string
  phaseType: 'consultation' | 'products'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LinkTransactionRequest = await request.json()

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, consultation_fee_total')
      .eq('id', body.orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot link transaction to another user\'s order' },
        { status: 403 }
      )
    }

    console.log('🔗 Linking transaction to order:', {
      orderId: body.orderId,
      transactionId: body.transactionId,
      phaseType: body.phaseType
    })

    if (body.phaseType === 'consultation') {
      // Update order with consultation payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          consultation_payment_id: body.transactionId,
          payment_method_id: body.paymentMethodId,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.orderId)

      if (updateError) {
        console.error('❌ Failed to update order with consultation payment:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to link consultation payment' },
          { status: 500 }
        )
      }

      // Create consultation payment phase record
      const { error: phaseError } = await supabase
        .from('order_payment_phases')
        .insert({
          order_id: body.orderId,
          phase_type: 'consultation',
          phase_status: 'processing',
          genie_transaction_id: body.transactionId,
          payment_method_id: body.paymentMethodId,
          amount: order.consultation_fee_total,
          currency: 'LKR',
          initiated_at: new Date().toISOString()
        })

      if (phaseError) {
        console.error('❌ Failed to create consultation payment phase:', phaseError)
        return NextResponse.json(
          { success: false, error: 'Failed to create payment phase record' },
          { status: 500 }
        )
      }

    } else if (body.phaseType === 'products') {
      // Calculate product amount (total - consultation fee)
      const productAmount = order.total_amount - (order.consultation_fee_total || 0)

      // Update order with product payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          product_payment_id: body.transactionId,
          product_payment_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.orderId)

      if (updateError) {
        console.error('❌ Failed to update order with product payment:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to link product payment' },
          { status: 500 }
        )
      }

      // Create product payment phase record
      const { error: phaseError } = await supabase
        .from('order_payment_phases')
        .insert({
          order_id: body.orderId,
          phase_type: 'products',
          phase_status: 'processing',
          genie_transaction_id: body.transactionId,
          payment_method_id: body.paymentMethodId,
          amount: productAmount,
          currency: 'LKR',
          initiated_at: new Date().toISOString()
        })

      if (phaseError) {
        console.error('❌ Failed to create product payment phase:', phaseError)
        return NextResponse.json(
          { success: false, error: 'Failed to create payment phase record' },
          { status: 500 }
        )
      }
    }

    console.log('✅ Transaction linked successfully to order')

    return NextResponse.json({
      success: true,
      message: 'Transaction linked successfully'
    })

  } catch (error) {
    console.error('❌ Link transaction API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}