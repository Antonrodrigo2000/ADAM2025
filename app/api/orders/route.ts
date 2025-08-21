import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface OrderRequest {
  user_id: string
  payment_flow_type: 'consultation_first' | 'full_upfront'
  total_amount: number
  consultation_fee_total: number
  payment_method_id: string
  delivery_address: any
  status: string
  consultation_status: string
  payment_status: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
}

export interface OrderResponse {
  success: boolean
  orderId?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: OrderRequest = await request.json()

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

    // Verify user is creating order for themselves
    if (body.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot create order for another user' },
        { status: 403 }
      )
    }

    // Get health vertical ID (for now defaulting to hair-loss, but could be dynamic)
    const { data: healthVertical } = await supabase
      .from('health_verticals')
      .select('id')
      .eq('slug', 'hair-loss')
      .single()

    // Create order record
    const orderData = {
      user_id: body.user_id,
      health_vertical_id: healthVertical?.id || null,
      total_amount: body.total_amount,
      consultation_fee_total: body.consultation_fee_total,
      payment_flow_type: body.payment_flow_type,
      payment_method_id: body.payment_method_id,
      status: body.status,
      consultation_status: body.consultation_status,
      payment_status: body.payment_status,
      delivery_address: body.delivery_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('🏥 Creating consultation order:', orderData)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    if (body.items && body.items.length > 0) {
      const orderItemsData = body.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        created_at: new Date().toISOString()
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError)
        // Clean up order
        await supabase.from('orders').delete().eq('id', order.id)
        return NextResponse.json(
          { success: false, error: 'Failed to save order items' },
          { status: 500 }
        )
      }
    }

    console.log('✅ Consultation order created:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id
    })

  } catch (error) {
    console.error('❌ Orders API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}