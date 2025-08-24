export interface CartItem {
  product_id: string
  quantity: number
  price: number
  productName?: string
  variantName?: string
  image?: string
  monthlyPrice?: number
  months?: number
  consultationRequired?: boolean
  consultationFee?: number
}

export interface CheckoutSession {
  cart_items: CartItem[]
  cart_total: number
  user_id?: string
}

export interface OrderCalculation {
  subtotal: number
  consultationFee: number
  deliveryFee: number
  total: number
  hasConsultationItems: boolean
}

export interface OrderSummaryProps {
  session: CheckoutSession
  className?: string
}