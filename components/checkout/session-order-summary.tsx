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
  return (
    <div className="neomorphic-container p-4">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">Your order</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-4">
        {session.cart_items.map((item: CartItem, index: number) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <img 
                src={item.image || "/placeholder.svg"} 
                alt={item.productName || `Product ${item.product_id.slice(-8)}`} 
                className="w-8 h-8 object-contain" 
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-800 text-xs leading-tight mb-1">
                {item.productName || `Product ${item.product_id.slice(-8).toUpperCase()}`}
              </h3>
              {item.variantName && (
                <p className="text-xs text-neutral-600 mb-1">{item.variantName}</p>
              )}
              <p className="text-xs text-neutral-600 mb-1">Quantity: {item.quantity}</p>
              {item.prescriptionRequired && (
                <p className="text-xs text-blue-600">Requires consultation</p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-bold text-neutral-800 text-sm">
                LKR {(item.price * item.quantity).toLocaleString()}
              </div>
              {item.months && item.months > 1 && item.monthlyPrice && (
                <div className="text-xs text-neutral-500">
                  LKR {item.monthlyPrice.toLocaleString()}/month × {item.months}
                </div>
              )}
              {item.prescriptionRequired && item.consultationFee && (
                <div className="text-xs text-blue-600">
                  + LKR {item.consultationFee.toLocaleString()} consultation
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-2 border-t border-neutral-200 pt-3">
        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Subtotal</span>
          <span>LKR {session.cart_total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Delivery</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between text-lg font-bold text-neutral-800 pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>LKR {session.cart_total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}