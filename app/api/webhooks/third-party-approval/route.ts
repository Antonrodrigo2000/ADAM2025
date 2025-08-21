import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GeniePaymentService } from '@/lib/services/genie-payment-service'

interface ApprovalWebhookData {
  orderId: string
  approved: boolean
  products: Array<{
    productId: string // Genie product ID
    quantity: number
  }>
  notes?: string
  approvedBy?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ApprovalWebhookData = await request.json()
    
    console.log('🩺 Received third-party approval webhook:', {
      orderId: body.orderId,
      approved: body.approved,
      productCount: body.products?.length
    })

    if (!body.orderId || body.approved === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, approved' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user_payment_methods!inner(payment_token, user_id),
        user_profiles!inner(genie_customer_id)
      `)
      .eq('id', body.orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', body.orderId, orderError)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify this is a consultation flow order
    if (order.payment_flow_type !== 'consultation_first') {
      return NextResponse.json(
        { success: false, error: 'Order does not use consultation payment flow' },
        { status: 400 }
      )
    }

    // Verify consultation has been paid
    if (order.consultation_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Consultation payment not confirmed yet' },
        { status: 400 }
      )
    }

    if (!body.approved) {
      // Handle rejection
      console.log('❌ Order rejected by third-party service')
      
      const { error: rejectError } = await supabase
        .from('orders')
        .update({
          consultation_status: 'rejected',
          status: 'rejected',
          physician_notes: body.notes || 'Rejected by approval service',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.orderId)

      if (rejectError) {
        console.error('❌ Failed to update rejected order:', rejectError)
      }

      return NextResponse.json({
        success: true,
        message: 'Order rejection processed'
      })
    }

    // Handle approval
    console.log('✅ Order approved, processing product payment...')

    // Upsert order items with approved products (third-party service may change quantities)
    console.log('📝 Updating order items with approved products')
    
    // First, delete existing order items (will be replaced with approved ones)
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', body.orderId)

    // Insert new order items with approved products and quantities
    const approvedOrderItems = body.products.map(product => ({
      order_id: body.orderId,
      product_id: product.productId,
      quantity: product.quantity,
      unit_price: 0, // Will be calculated by Genie based on product pricing
      total_price: 0, // Will be calculated by Genie
      metadata: {
        approved_by_third_party: true,
        approval_timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(approvedOrderItems)

    if (itemsError) {
      console.error('❌ Failed to update order items:', itemsError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order items' },
        { status: 500 }
      )
    }

    console.log('💰 Creating transaction for approved products (amount calculated by Genie)')

    // Create Genie transaction with specific products
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/genie-payments`

    const transactionResult = await GeniePaymentService.createTransactionWithProducts(
      order.user_profiles.genie_customer_id,
      body.products.map(p => ({ id: p.productId, quantity: p.quantity })), // Fix TypeScript error
      webhookUrl,
      undefined, // no redirect needed for stored token payments
      `products_${body.orderId}`, // localId
      `customer_${order.user_id}` // customerReference
    )

    if (!transactionResult.success || !transactionResult.transaction) {
      console.error('❌ Failed to create product payment transaction:', transactionResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to create product payment transaction' },
        { status: 500 }
      )
    }

    // Update order with approval and product payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        consultation_status: 'approved',
        product_payment_id: transactionResult.transaction.id,
        product_payment_status: 'processing',
        status: 'approved_pending_payment',
        physician_notes: body.notes || 'Approved by third-party service',
        approved_at: new Date().toISOString(),
        approved_by: body.approvedBy || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.orderId)

    if (updateError) {
      console.error('❌ Failed to update approved order:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Create product payment phase
    const { error: phaseError } = await supabase
      .from('order_payment_phases')
      .insert({
        order_id: body.orderId,
        phase_type: 'products',
        phase_status: 'processing',
        genie_transaction_id: transactionResult.transaction.id,
        payment_method_id: order.payment_method_id,
        amount: 0, // Amount will be updated when Genie payment confirms
        currency: 'LKR',
        initiated_at: new Date().toISOString(),
        payment_metadata: {
          approved_products: body.products,
          approval_source: 'third_party_webhook'
        }
      })

    if (phaseError) {
      console.error('❌ Failed to create product payment phase:', phaseError)
    }

    // Charge the stored payment method
    const chargeResult = await GeniePaymentService.chargeStoredToken(
      order.user_profiles.genie_customer_id,
      transactionResult.transaction.id,
      order.payment_method_id
    )

    if (!chargeResult.success) {
      console.error('❌ Failed to charge for product payment:', chargeResult.error)
      
      // Mark payment as failed
      await supabase
        .from('orders')
        .update({
          product_payment_status: 'failed',
          status: 'payment_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.orderId)

      return NextResponse.json(
        { success: false, error: 'Failed to process product payment' },
        { status: 500 }
      )
    }

    console.log('✅ Third-party approval processed and product payment initiated')

    return NextResponse.json({
      success: true,
      message: 'Approval processed and product payment initiated',
      transactionId: transactionResult.transaction.id,
      approvedProducts: body.products.length
    })

  } catch (error) {
    console.error('❌ Third-party approval webhook error:', error)
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
    service: 'third-party-approval-webhook',
    timestamp: new Date().toISOString()
  })
}