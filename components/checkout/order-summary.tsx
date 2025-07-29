"use client"

import { useState, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  subscription?: string
  image?: string
}

interface CartData {
  items: CartItem[]
  subtotal: number
  discount: number
  discountLabel?: string
  delivery: number
  total: number
}

export function OrderSummary() {
  const [cartData, setCartData] = useState<CartData>({
    items: [],
    subtotal: 0,
    discount: 0,
    delivery: 0,
    total: 0,
  })

  // Simulate loading cart data
  useEffect(() => {
    const mockCartData: CartData = {
      items: [
        {
          id: "hair-kit",
          name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
          description: "Delivered as 3 kits every 3 months",
          price: 120.0,
          image: "/placeholder.svg?height=40&width=40&text=HK",
        },
        {
          id: "rosemary-oil",
          name: "Rosemary Oil",
          description: "Monthly",
          price: 21.0,
          originalPrice: 28.0,
          subscription: "Monthly",
          image: "/placeholder.svg?height=40&width=40&text=RO",
        },
      ],
      subtotal: 141.0,
      discount: 40.0,
      discountLabel: "Save 50% on your first order (max. £40)",
      delivery: 0,
      total: 101.0,
    }

    setCartData(mockCartData)
  }, [])

  const removeItem = (itemId: string) => {
    setCartData((prev) => {
      const newItems = prev.items.filter((item) => item.id !== itemId)
      const newSubtotal = newItems.reduce((sum, item) => sum + item.price, 0)
      const newTotal = newSubtotal - prev.discount + prev.delivery

      return {
        ...prev,
        items: newItems,
        subtotal: newSubtotal,
        total: Math.max(0, newTotal),
      }
    })
  }

  return (
    <div className="neomorphic-container p-4">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">Your order</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-4">
        {cartData.items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-8 h-8 object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-800 text-xs leading-tight mb-1">{item.name}</h3>
              <p className="text-xs text-neutral-600 mb-1">{item.description}</p>

              {item.subscription && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{item.subscription}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-neutral-500 hover:text-red-600 underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-bold text-neutral-800 text-sm">£{item.price.toFixed(2)}</div>
              {item.originalPrice && (
                <div className="text-xs text-neutral-500 line-through">£{item.originalPrice.toFixed(2)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-2 border-t border-neutral-200 pt-3">
        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Subtotal</span>
          <span>£{cartData.subtotal.toFixed(2)}</span>
        </div>

        {cartData.discount > 0 && (
          <div className="flex justify-between text-neutral-700 text-sm">
            <div>
              <div>Promo discount</div>
              <button className="text-xs text-neutral-500 hover:text-neutral-700 underline">Remove</button>
            </div>
            <div className="text-right">
              <div>-£{cartData.discount.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">{cartData.discountLabel}</div>
            </div>
          </div>
        )}

        <div className="flex justify-between text-neutral-700 text-sm">
          <span>Delivery</span>
          <span className="text-emerald-600 font-semibold">
            {cartData.delivery === 0 ? "Free" : `£${cartData.delivery.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-lg font-bold text-neutral-800 pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>£{cartData.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
