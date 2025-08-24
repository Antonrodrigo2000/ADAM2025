"use client"

import { useCart } from "@/contexts"
import { calculateOrderTotals, formatPrice } from './order-summary/calculations'
import { OrderItem } from './order-summary/order-item'
import { SummaryBreakdown } from './order-summary/summary-breakdown'

export function OrderSummary() {
  const { state, actions } = useCart()

  // Convert cart state to session format
  const sessionData = {
    cart_items: state.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.monthlyPrice || item.price,
      productName: item.productName,
      variantName: item.variantName,
      image: item.image,
      monthlyPrice: item.monthlyPrice,
      months: item.months,
      consultationRequired: item.consultationRequired,
      consultationFee: item.consultationFee
    })),
    cart_total: state.total,
    user_id: undefined
  }

  const calculation = calculateOrderTotals(sessionData.cart_items)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Your order</h2>
        <p className="text-sm text-neutral-600 mt-1">
          {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Order Items with Cart Actions */}
      <div className="space-y-4 mb-6">
        {sessionData.cart_items.map((item, index) => {
          const cartItem = state.items.find(i => i.id === item.product_id)
          return (
            <div key={`${item.product_id}-${index}`}>
              <OrderItem item={item} index={index} />
              
              {/* Cart Actions */}
              {cartItem?.subscription && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => actions.removeItem(cartItem.id)}
                    className="text-xs text-neutral-500 hover:text-red-600 underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Breakdown */}
      <SummaryBreakdown calculation={calculation} />

      {/* Promo Code Section */}
      {state.discount > 0 && state.discountCode && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">Promo code: {state.discountCode}</span>
            <button 
              onClick={actions.removeDiscount}
              className="text-neutral-500 hover:text-neutral-700 underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

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
