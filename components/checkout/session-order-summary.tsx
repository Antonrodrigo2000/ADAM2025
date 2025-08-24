import { calculateOrderTotals, formatPrice } from './order-summary/calculations'
import { OrderItem } from './order-summary/order-item'
import { SummaryBreakdown } from './order-summary/summary-breakdown'

interface CartItem {
  product_id: string
  quantity: number
  price: number
  productName?: string
  variantName?: string
  image?: string
  monthlyPrice?: number
  months?: number
  prescriptionRequired?: boolean
  consultationFee?: number
}

interface CheckoutSession {
  cart_items: CartItem[]
  cart_total: number
  user_id?: string
}

interface SessionOrderSummaryProps {
  session: CheckoutSession
}

export function SessionOrderSummary({ session }: SessionOrderSummaryProps) {
  const calculation = calculateOrderTotals(session.cart_items)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Your order</h2>
        <p className="text-sm text-neutral-600 mt-1">
          {session.cart_items.length} {session.cart_items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {session.cart_items.map((item, index) => (
          <OrderItem key={`${item.product_id}-${index}`} item={item} index={index} />
        ))}
      </div>

      {/* Summary Breakdown */}
      <SummaryBreakdown calculation={calculation} />

      {/* Additional Info */}
      {calculation.hasConsultationItems && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Items requiring consultation will be processed after physician approval. 
            The consultation fee covers all prescription items in your order.
          </p>
        </div>
      )}
    </div>
  )
}