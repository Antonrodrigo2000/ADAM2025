"use client"

import { useCart } from "@/lib/contexts"

export function OrderSummary() {
  const { state, actions } = useCart()

  return (
    <div className="neomorphic-container p-4">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">Your order</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-4">
        {state.items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <img src={item.image || "/placeholder.svg"} alt={item.productName} className="w-8 h-8 object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-800 text-xs leading-tight mb-1">{item.productName}</h3>
              <p className="text-xs text-neutral-600 mb-1">{item.variantName}</p>
              <p className="text-xs text-neutral-600 mb-1">Quantity: {item.quantity}</p>

              {item.subscription && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{item.subscription.frequency}</span>
                  <button
                    onClick={() => actions.removeItem(item.id)}
                    className="text-xs text-neutral-500 hover:text-red-600 underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-bold text-neutral-800 text-sm">£{(item.price * item.quantity).toFixed(2)}</div>
              {item.originalPrice && (
                <div className="text-xs text-neutral-500 line-through">£{(item.originalPrice * item.quantity).toFixed(2)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-2 border-t border-neutral-200 pt-3">
        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Subtotal</span>
          <span>£{state.subtotal.toFixed(2)}</span>
        </div>

        {state.discount > 0 && (
          <div className="flex justify-between text-neutral-700 text-sm">
            <div>
              <div>Promo discount</div>
              {state.discountCode && (
                <button 
                  onClick={actions.removeDiscount}
                  className="text-xs text-neutral-500 hover:text-neutral-700 underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="text-right">
              <div>-£{state.discount.toFixed(2)}</div>
              {state.discountCode && (
                <div className="text-xs text-neutral-500">Code: {state.discountCode}</div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Tax</span>
          <span>£{state.tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Delivery</span>
          <span className="text-emerald-600 font-semibold">
            {state.shipping === 0 ? "Free" : `£${state.shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-lg font-bold text-neutral-800 pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>£{state.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
