import { createClient } from '@/lib/supabase/server'
import type { CheckoutRequest } from './validation'

export interface OrderResult {
  orderId: string
  redirectUrl: string
}

export async function createOrder(
  userId: string,
  body: CheckoutRequest,
  signal?: AbortSignal
): Promise<OrderResult> {
  if (signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  const supabase = await createClient()

  // Get hair-loss health vertical ID
  const { data: healthVertical } = await supabase
    .from('health_verticals')
    .select('id')
    .eq('slug', 'hair-loss')
    .single()

  // Create order record
  const orderData = {
    user_id: userId,
    health_vertical_id: healthVertical?.id || null,
    total_amount: body.cartTotal,
    status: 'pending',
    delivery_address: {
      street: body.address,
      city: body.city,
      postcode: body.postcode,
      country: 'Sri Lanka'
    },
    metadata: {
      userDetails: {
        email: body.email,
        firstName: body.legalFirstName,
        lastName: body.legalSurname,
        phone: body.phoneNumber,
        dateOfBirth: body.dateOfBirth,
        sex: body.sex
      }
    }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError) {
    console.error('Order creation error:', orderError)
    throw new Error('Failed to create order')
  }

  // Create order items (store Genie product ID directly in product_id field)
  const orderItemsData = body.cartItems.map(item => ({
    order_id: order.id,
    product_id: item.productId, // Store Genie product ID directly as string
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.totalPrice,
    metadata: {
      productName: item.productName,
      variantId: item.variantId,
      variantName: item.variantName,
      months: item.months,
      monthlyPrice: item.monthlyPrice,
      consultationFee: item.consultationFee,
      consultationRequired: item.consultationRequired,
      selectedOptions: item.selectedOptions
    }
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) {
    console.error('Order items creation error:', itemsError)
    throw new Error('Failed to save order items')
  }

  return {
    orderId: order.id,
    redirectUrl: `/dashboard?order=${order.id}`
  }
}