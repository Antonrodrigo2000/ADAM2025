import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface CancelOrderRequest {
  reason: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
): Promise<NextResponse> {
  try {
    const { orderId } = params
    const body: CancelOrderRequest = await request.json()

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
      .select('id, user_id, status, consultation_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel another user\'s order' },
        { status: 403 }
      )
    }

    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'shipped') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel completed or shipped orders' },
        { status: 400 }
      )
    }

    console.log('❌ Cancelling order:', orderId, 'Reason:', body.reason)

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        consultation_status: order.consultation_status === 'pending' ? 'cancelled' : order.consultation_status,
        metadata: {
          cancellation_reason: body.reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Failed to cancel order:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel order' },
        { status: 500 }
      )
    }

    // Cancel any pending payment phases
    const { error: phaseError } = await supabase
      .from('order_payment_phases')
      .update({
        phase_status: 'cancelled',
        error_details: body.reason,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .in('phase_status', ['pending', 'processing'])

    if (phaseError) {
      console.error('❌ Failed to cancel payment phases:', phaseError)
      // Don't fail the whole operation, just log the error
    }

    console.log('✅ Order cancelled successfully:', orderId)

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully'
    })

  } catch (error) {
    console.error('❌ Cancel order API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}